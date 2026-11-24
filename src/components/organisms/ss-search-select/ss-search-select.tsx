import { AttachInternals, Component, Element, Event, EventEmitter, h, Listen, Prop, State, Watch } from '@stencil/core';
import { applyDescribedBy, applyLabelledBy } from '../../../utils/a11y';
import { onDismiss } from '../../../utils/dismiss';
import { nextId } from '../../../utils/id';
import { matches, readOptions, type SelectOption } from '../../../utils/options';
import { anchorTo, onResize } from '../../../utils/position';
import { rovingIndex } from '../../../utils/roving';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { InputStyle } from '../../../types/control-events';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';

export type SearchSelectFilter = 'contains' | 'none';

export interface SsSearchSelectSearchEvent {
  xId?: string;
  query: string;
}

export interface SsSearchSelectChangeEvent {
  xId?: string;
  value: string | string[];
}

export interface SsSearchSelectOpenChangeEvent {
  xId?: string;
  open: boolean;
}

const OFFSET = 4;
const EDGE_PADDING = 8;

/**
 * A select you type into to filter: a WAI-ARIA combobox over a listbox.
 *
 * It only shows. The options come from `ss-option` children or from the
 * `options` property (which wins when set), wherever the caller got them. By
 * default it filters what it holds, ignoring case and accents; with
 * `filter="none"` it shows `options` exactly as given, for a host that searches
 * elsewhere. It reports every change the person makes to the text as
 * `ssSearch`, never debounced — waiting, fetching, cancelling and errors are
 * the host's — and shows `loading` when told to.
 *
 * The list is drawn here from that data rather than slotted, so the field and
 * the active option share a tree and `aria-activedescendant` resolves. Every
 * selected option's label is remembered, so replacing `options` with new
 * search results never turns the field's text into a bare value.
 *
 * Keyboard: ArrowDown/ArrowUp open the list and move through it, skipping
 * disabled options; Enter chooses; Escape closes, and a second Escape clears
 * the text; Tab closes and moves on. Leaving the field restores the selected
 * label, or clears the selection when the text was emptied.
 *
 * @slot - The `ss-option` elements, when the options are written in HTML.
 */
@Component({
  tag: 'ss-search-select',
  styleUrl: 'ss-search-select.scss',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class SsSearchSelect {
  @Element() el!: HTMLElement;

  @AttachInternals() internals: ElementInternals;

  /** Id applied to the field's input; also included in event details. */
  @Prop() xId?: string;
  /** Name submitted with the surrounding form. */
  @Prop() name?: string;
  /** The selected value. Updated on interaction. */
  @Prop({ mutable: true }) value?: string | string[];
  /** The options, as data. When set, it wins over `ss-option` children. */
  @Prop() options?: SelectOption[];
  /** Allows choosing several options, shown as removable chips. */
  @Prop() multiple: boolean = false;
  /** Whether the list is filtered by the typed text here (contains) or shown as given (none). */
  @Prop() filter: SearchSelectFilter = 'contains';
  /** Shows the loading text in the list, while the host fetches options. */
  @Prop() loading: boolean = false;
  /** Shows a button that empties the text and the selection. */
  @Prop() clearable: boolean = false;
  /** Placeholder shown while the field is empty. */
  @Prop() placeholder?: string;
  /** Size of the field. */
  @Prop() size: Size = 'md';
  /** Visual style of the field. */
  @Prop() xStyle: InputStyle = 'solid';
  /** Color variant of the field. */
  @Prop() color: Variant = 'primary';
  /** Disables the field. */
  @Prop() disabled: boolean = false;
  /** Requires a selection before the form submits. */
  @Prop() required: boolean = false;
  /** Marks the field as invalid. */
  @Prop() invalid: boolean = false;
  /** Expands the field to the full width of its container. */
  @Prop() fullWidth: boolean = false;
  /** Accessible name of the field and its list. */
  @Prop() accessibilityLabel?: string;
  /** Ids of elements, in the host's tree, that name the field — how `ss-field` names it. */
  @Prop() labelledBy?: string;
  /** Ids of elements, in the host's tree, that describe the field. */
  @Prop() describedBy?: string;
  /** Inline CSS styles applied to the field. */
  @Prop() inlineStyles?: InlineStyles;
  /** Accessible name of the clear button. */
  @Prop() clearLabel: string = 'Clear';
  /** Text shown and announced while `loading`. */
  @Prop() loadingLabel: string = 'Loading…';
  /** Text shown and announced when no option matches. */
  @Prop() emptyLabel: string = 'No results';
  /** First word of each chip's remove name, before the option's label ("Remove Colombia"). */
  @Prop() removeLabel: string = 'Remove';

  /** Emitted on every change the person makes to the text; detail contains xId and the query. */
  @Event() ssSearch: EventEmitter<SsSearchSelectSearchEvent>;
  /** Emitted when the selection changes; detail contains xId and the value (an array with `multiple`). */
  @Event() ssChange: EventEmitter<SsSearchSelectChangeEvent>;
  /** Emitted when the list opens or closes; detail contains xId and open. */
  @Event() ssOpenChange: EventEmitter<SsSearchSelectOpenChangeEvent>;
  /** Emitted when the field gains focus. */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  /** Emitted when the field loses focus. */
  @Event() ssBlur: EventEmitter<FocusEvent>;

  @State() open = false;
  /** The text the person typed, while they are typing; otherwise the field shows the selection. */
  @State() query = '';
  @State() editing = false;
  /** Index of the active option in the shown list, or -1. */
  @State() activeIndex = -1;
  @State() childOptions: SelectOption[] = [];
  @State() ancestorDisabled = false;

  private listId = nextId('ss-search-select-list');
  private optionPrefix = nextId('ss-search-select-option');
  /** Every label seen, by value: selected options keep theirs when `options` changes. */
  private labels = new Map<string, string>();
  private initialValue?: string | string[];
  private input?: HTMLInputElement;
  private fieldEl?: HTMLElement;
  private listEl?: HTMLElement;
  private childObserver?: MutationObserver;
  private releaseDismiss?: () => void;
  private releaseResize?: () => void;

  componentWillLoad() {
    this.readChildren();
    if (this.value === undefined) {
      const selected = this.childOptions.filter(option => option.selected).map(option => option.value);
      if (selected.length) this.value = this.multiple ? selected : selected[0];
    }
    this.initialValue = this.value;
    this.remember(this.options);
  }

  connectedCallback() {
    if (typeof MutationObserver === 'undefined') return;
    this.childObserver = new MutationObserver(() => this.readChildren());
    this.childObserver.observe(this.el, { childList: true });
  }

  disconnectedCallback() {
    this.childObserver?.disconnect();
    this.childObserver = undefined;
    this.deactivate();
  }

  componentDidLoad() {
    // Not a JSX handler: Stencil does not bind onBeforeInput.
    this.input?.addEventListener('beforeinput', this.handleBeforeInput);
    this.syncFormState();
    this.applyReferences();
  }

  /** A field and its list are named by the same label, from outside this shadow root. */
  private applyReferences() {
    applyLabelledBy(this.el, this.input, this.labelledBy);
    applyLabelledBy(this.el, this.el.shadowRoot?.getElementById(this.listId), this.labelledBy);
    applyDescribedBy(this.el, this.input, this.describedBy);
  }

  componentWillRender() {
    this.clampActive();
  }

  componentDidRender() {
    if (this.open) {
      this.activate();
      this.reposition();
      this.scrollActiveIntoView();
    }
  }

  componentDidUpdate() {
    this.syncFormState();
    this.applyReferences();
  }

  @Watch('options')
  optionsChanged(options?: SelectOption[]) {
    this.remember(options);
  }

  @Watch('disabled')
  disabledChanged(disabled: boolean) {
    if (disabled) this.setOpen(false);
  }

  @Listen('ssOptionChange')
  handleOptionChange(event: Event) {
    event.stopPropagation();
    this.readChildren();
  }

  @Listen('scroll', { target: 'window', capture: true })
  @Listen('resize', { target: 'window' })
  handleViewportChange() {
    if (this.open) this.reposition();
  }

  /** Restores the selection the component started with, as a native select does. */
  formResetCallback() {
    this.value = this.initialValue;
    this.editing = false;
    this.query = '';
    this.setOpen(false);
  }

  formDisabledCallback(disabled: boolean) {
    this.ancestorDisabled = disabled;
  }

  private get isDisabled() {
    return this.disabled || this.ancestorDisabled;
  }

  private get allOptions(): SelectOption[] {
    return this.options ?? this.childOptions;
  }

  /** The options the list shows now. */
  private get shown(): SelectOption[] {
    const all = this.allOptions;
    if (this.filter === 'none' || !this.editing) return all;
    return all.filter(option => matches(option.label, this.query));
  }

  private get values(): string[] {
    const value = this.value;
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }

  private labelOf(value: string) {
    return this.labels.get(value) ?? value;
  }

  private readChildren() {
    this.childOptions = readOptions(this.el);
    this.remember(this.childOptions);
  }

  private remember(options?: SelectOption[]) {
    options?.forEach(option => this.labels.set(option.value, option.label));
  }

  /** Keeps the active option on an option that exists and can be chosen. */
  private clampActive() {
    if (this.activeIndex < 0) return;
    const shown = this.shown;
    const current = shown[this.activeIndex];
    if (current && !current.disabled) return;
    this.activeIndex = shown.findIndex(option => !option.disabled);
  }

  private setOpen(open: boolean) {
    if (open && this.isDisabled) return;
    if (this.open === open) return;
    this.open = open;
    if (!open) {
      this.activeIndex = -1;
      this.deactivate();
    }
    this.ssOpenChange.emit({ xId: this.xId, open });
  }

  private activate() {
    if (this.releaseDismiss || !this.listEl || !this.fieldEl) return;
    this.releaseResize = onResize([this.fieldEl, this.listEl], () => this.reposition());
    // Escape is handled on the field: the first closes, a second clears the text.
    this.releaseDismiss = onDismiss(this.el, { escape: false, onDismiss: () => this.setOpen(false) });
  }

  private deactivate() {
    this.releaseDismiss?.();
    this.releaseDismiss = undefined;
    this.releaseResize?.();
    this.releaseResize = undefined;
  }

  private reposition() {
    if (!this.open || !this.fieldEl || !this.listEl) return;
    // The stylesheet keeps the larger of this and the menu minimum.
    this.listEl.style.setProperty('--_field-width', `${this.fieldEl.offsetWidth}px`);
    anchorTo(this.fieldEl, this.listEl, { placement: 'bottom', align: 'start', offset: OFFSET, padding: EDGE_PADDING });
  }

  private scrollActiveIntoView() {
    if (this.activeIndex < 0) return;
    this.el.shadowRoot?.getElementById(this.optionId(this.activeIndex))?.scrollIntoView?.({ block: 'nearest' });
  }

  private optionId(index: number) {
    return `${this.optionPrefix}-${index}`;
  }

  private syncFormState() {
    if (!('setFormValue' in this.internals)) return;
    const values = this.values;
    if (this.multiple) {
      const data = new FormData();
      if (this.name) values.forEach(value => data.append(this.name!, value));
      this.internals.setFormValue(values.length ? data : null);
    } else {
      this.internals.setFormValue(values[0] ?? '');
    }
    if (this.required && !values.length) {
      // A detached required input carries the browser's own message, in its language.
      const probe = document.createElement('input');
      probe.required = true;
      this.internals.setValidity({ valueMissing: true }, probe.validationMessage, this.input);
    } else {
      this.internals.setValidity({});
    }
  }

  private commitValue(value: string | string[]) {
    this.value = value;
    this.ssChange.emit({ xId: this.xId, value });
  }

  private choose(option: SelectOption | undefined) {
    if (!option || option.disabled) return;
    this.labels.set(option.value, option.label);
    this.editing = false;
    this.query = '';
    if (!this.multiple) {
      this.commitValue(option.value);
      this.setOpen(false);
      return;
    }
    // Several: a pick toggles the option, and the list stays open for the next.
    const values = this.values;
    this.commitValue(values.includes(option.value) ? values.filter(value => value !== option.value) : [...values, option.value]);
  }

  private remove(value: string) {
    this.commitValue(this.values.filter(selected => selected !== value));
    this.input?.focus();
  }

  /** Leaving the field: an emptied text clears the selection; any other text gives way to the selected label. */
  private settle() {
    this.setOpen(false);
    if (!this.editing) return;
    const emptied = !this.query.trim();
    this.editing = false;
    this.query = '';
    // With several, the text is only a filter: emptying it removes nothing.
    if (emptied && !this.multiple && this.values.length) this.commitValue('');
  }

  private clear = () => {
    const hadValue = this.values.length > 0;
    const hadText = this.editing && this.query !== '';
    this.editing = false;
    this.query = '';
    if (hadText) this.ssSearch.emit({ xId: this.xId, query: '' });
    if (hadValue) this.commitValue(this.multiple ? [] : '');
    this.input?.focus();
  };

  private moveActive(key: 'ArrowDown' | 'ArrowUp') {
    const shown = this.shown;
    const disabled = (index: number) => !!shown[index]?.disabled;
    const from = this.activeIndex;
    const next =
      from < 0 ? rovingIndex(key === 'ArrowDown' ? 'Home' : 'End', -1, shown.length, { disabled }) : rovingIndex(key, from, shown.length, { orientation: 'vertical', disabled });
    if (next !== null) this.activeIndex = next;
  }

  /**
   * The label of a single selection is not a query: the first text the person
   * types or pastes over it starts a new search instead of extending the label.
   */
  private handleBeforeInput = (event: InputEvent) => {
    if (this.multiple || this.editing || !this.input || !event.inputType.startsWith('insert')) return;
    this.input.value = '';
  };

  private handleInput = (event: Event) => {
    this.query = (event.target as HTMLInputElement).value;
    this.editing = true;
    this.activeIndex = -1;
    this.setOpen(true);
    this.ssSearch.emit({ xId: this.xId, query: this.query });
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open) this.setOpen(true);
        this.moveActive(event.key);
        return;
      case 'Home':
      case 'End': {
        // Only within an open list; otherwise they move the caret, as in any text field.
        if (!this.open || this.activeIndex < 0) return;
        event.preventDefault();
        const shown = this.shown;
        const next = rovingIndex(event.key, this.activeIndex, shown.length, { disabled: index => !!shown[index]?.disabled });
        if (next !== null) this.activeIndex = next;
        return;
      }
      case 'Enter':
        if (event.isComposing || !this.open) return;
        event.preventDefault();
        this.choose(this.shown[this.activeIndex]);
        return;
      case 'Backspace':
        if (this.multiple && !this.input?.value && this.values.length) {
          event.preventDefault();
          this.remove(this.values[this.values.length - 1]);
        }
        return;
      case 'Escape':
        if (this.open) {
          event.preventDefault();
          event.stopPropagation();
          this.setOpen(false);
        } else if (this.editing && this.query) {
          event.preventDefault();
          event.stopPropagation();
          this.query = '';
          this.ssSearch.emit({ xId: this.xId, query: '' });
        }
        return;
    }
  };

  private handleFocusOut = (event: FocusEvent) => {
    const to = event.relatedTarget as Node | null;
    if (to && (this.el.contains(to) || this.el.shadowRoot?.contains(to))) return;
    this.settle();
    this.ssBlur.emit(event);
  };

  private handleFieldPointerDown = (event: PointerEvent) => {
    if (this.isDisabled || event.button !== 0) return;
    if (event.target !== this.input) event.preventDefault();
    this.input?.focus();
    this.setOpen(!this.open);
  };

  private get statusText(): string {
    if (!this.open) return '';
    if (this.loading) return this.loadingLabel;
    return this.shown.length ? '' : this.emptyLabel;
  }

  private get fieldText(): string {
    if (this.editing || this.multiple) return this.query;
    return this.values[0] !== undefined ? this.labelOf(this.values[0]) : '';
  }

  private getClasses() {
    const b = 'ss-search-select';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--open`]: this.open,
      [`${b}--disabled`]: this.isDisabled,
      [`${b}--invalid`]: this.invalid,
      [`${b}--full-width`]: this.fullWidth,
    };
  }

  private renderOption(option: SelectOption, index: number) {
    const selected = this.values.includes(option.value);
    return (
      <li
        role="option"
        id={this.optionId(index)}
        class={{
          'ss-search-select__option': true,
          'ss-search-select__option--active': index === this.activeIndex,
          'ss-search-select__option--selected': selected,
          'ss-search-select__option--disabled': !!option.disabled,
        }}
        aria-selected={String(selected)}
        aria-disabled={option.disabled ? 'true' : undefined}
        onPointerDown={event => event.preventDefault()}
        onClick={() => this.choose(option)}
        onMouseMove={() => !option.disabled && this.activeIndex !== index && (this.activeIndex = index)}
      >
        <span class="ss-search-select__option-label">{option.label}</span>
        {selected && (
          <svg class="ss-search-select__check" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        )}
      </li>
    );
  }

  render() {
    const shown = this.shown;
    const status = this.statusText;
    const showClear = this.clearable && !this.isDisabled && (this.values.length > 0 || (this.editing && !!this.query));

    return (
      <div class={this.getClasses()} onFocusout={this.handleFocusOut}>
        <div class="ss-search-select__field" ref={el => (this.fieldEl = el)} style={resolveInlineStyles(this.inlineStyles)} onPointerDown={this.handleFieldPointerDown}>
          <div class="ss-search-select__values">
            {this.multiple &&
              this.values.map(value => (
                <span class="ss-search-select__chip">
                  <span class="ss-search-select__chip-label">{this.labelOf(value)}</span>
                  {!this.isDisabled && (
                    // A span, not a button: no element before the input may take focus,
                    // or delegatesFocus would send focus there instead of the field.
                    // Backspace removes the last chip from the keyboard.
                    <span
                      role="button"
                      class="ss-search-select__chip-remove"
                      aria-label={`${this.removeLabel} ${this.labelOf(value)}`}
                      onPointerDown={event => {
                        event.stopPropagation();
                        event.preventDefault();
                      }}
                      onClick={() => this.remove(value)}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                        <path d="M4 4l8 8M12 4l-8 8" />
                      </svg>
                    </span>
                  )}
                </span>
              ))}
            <input
              ref={el => (this.input = el)}
              id={this.xId}
              class="ss-search-select__input"
              type="text"
              role="combobox"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={String(this.open)}
              aria-controls={this.listId}
              aria-activedescendant={this.open && this.activeIndex >= 0 ? this.optionId(this.activeIndex) : undefined}
              aria-label={this.accessibilityLabel}
              aria-describedby={this.describedBy}
              aria-invalid={this.invalid ? 'true' : undefined}
              aria-required={this.required ? 'true' : undefined}
              placeholder={this.values.length && this.multiple ? undefined : this.placeholder}
              disabled={this.isDisabled}
              value={this.fieldText}
              onInput={this.handleInput}
              onKeyDown={this.handleKeyDown}
              onFocus={event => this.ssFocus.emit(event)}
            />
          </div>
          {showClear && (
            <button type="button" class="ss-search-select__clear" tabindex={-1} aria-label={this.clearLabel} onPointerDown={event => event.stopPropagation()} onClick={this.clear}>
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          )}
          <span class="ss-search-select__indicator" aria-hidden="true">
            <svg viewBox="0 0 16 16" focusable="false">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </span>
        </div>

        <div class="ss-search-select__popup" ref={el => (this.listEl = el)} hidden={!this.open}>
          <ul role="listbox" id={this.listId} class="ss-search-select__list" aria-label={this.accessibilityLabel} aria-multiselectable={this.multiple ? 'true' : undefined}>
            {shown.map((option, index) => this.renderOption(option, index))}
          </ul>
          {status && (
            <div class="ss-search-select__status" aria-hidden="true">
              {status}
            </div>
          )}
        </div>

        <div class="ss-search-select__live" role="status">
          {status}
        </div>
      </div>
    );
  }
}
