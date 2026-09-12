import { Component, Element, Event, EventEmitter, h, Listen, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { SsCheckedChangeEvent } from '../../../types/control-events';
import { composeDescribedBy } from '../../../utils/a11y';
import { resolveId } from '../../../utils/id';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type CheckboxGroupOrientation = 'vertical' | 'horizontal';

/** Emitted when the aggregate selection changes. */
export interface SsCheckboxGroupChangeEvent {
  xId?: string;
  name?: string;
  value: string[];
}

/** Helper and error text sit one step below the label, and never below `xs`. */
const MESSAGE_SIZE: Record<Size, Size> = {
  'xs': 'xs',
  'sm': 'xs',
  'md': 'sm',
  'lg': 'sm',
  'xl': 'md',
  '2xl': 'lg',
  '3xl': 'xl',
};

/**
 * Presents N `ss-checkbox` children as one `string[]` value and one change
 * event, with group semantics and an optional select-all master.
 *
 * Membership is by value: a checkbox with no `value` cannot be a member and is
 * left uncoordinated, and two checkboxes sharing a value toggle together,
 * because the aggregate holds values rather than element identities.
 *
 * @slot - The `ss-checkbox` children. Other elements are rendered but not coordinated.
 * @slot label - Rich group label; overrides the `label` prop.
 * @slot helper - Rich helper content; overrides the `helperText` prop.
 * @slot error - Rich error content; overrides the `errorText` prop. Shown only while invalid.
 */
@Component({
  tag: 'ss-checkbox-group',
  styleUrl: 'ss-checkbox-group.scss',
  scoped: true,
})
export class SsCheckboxGroup {
  @Element() el!: HTMLElement;

  /** Id of the container; also the seed for the generated message ids. */
  @Prop() xId?: string;
  /** Native name shared by every checkbox, for form submission. */
  @Prop() name?: string;
  /**
   * The selected values. An array is not an attribute, so assign it as a
   * property, following `ss-select.value`; no comma-separated form is accepted.
   */
  @Prop({ mutable: true }) value: string[] = [];
  /** Group label, used when no label slot content is provided. */
  @Prop() label?: string;
  /** Helper text, used when no helper slot content is provided. */
  @Prop() helperText?: string;
  /** Error text, used when no error slot content is provided; shown only while invalid. */
  @Prop() errorText?: string;
  /**
   * Requires at least one selection. HTML has no native "one of this set", so
   * the group expresses it with the only construct that does: while nothing is
   * selected the first checkbox is `required`, which makes the form invalid,
   * and the moment anything is selected that requirement is lifted. Only one
   * checkbox is ever announced as required, and checking any of them satisfies
   * the group rather than that particular choice.
   */
  @Prop() required: boolean = false;
  /** Marks the group invalid: reveals the error message and sets aria-invalid. */
  @Prop() invalid: boolean = false;
  /** Disables every checkbox in the group, including the master. */
  @Prop() disabled: boolean = false;
  /** Stacks the choices, or lays them out in a row. */
  @Prop() orientation: CheckboxGroupOrientation = 'vertical';
  /** Size shared by every checkbox, and by the group label. */
  @Prop() size: Size = 'md';
  /**
   * Label for an optional select-all checkbox. Supplying it renders the master;
   * its checked and indeterminate state is derived from the selection and is
   * not separately controllable.
   */
  @Prop() selectAllLabel?: string;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the aggregate selection changes; detail carries the whole array. */
  @Event() ssChange: EventEmitter<SsCheckboxGroupChangeEvent>;
  /** Emitted when the group fails native validation. */
  @Event() ssInvalid: EventEmitter<SsCheckboxGroupChangeEvent>;

  private groupId!: string;
  private master?: HTMLElement;
  private hasLabelSlot = false;
  private hasHelperSlot = false;
  private hasErrorSlot = false;

  componentWillLoad() {
    this.groupId = resolveId(this.xId, 'ss-checkbox-group');
  }

  componentWillRender() {
    this.hasLabelSlot = this.hasSlotted('label');
    this.hasHelperSlot = this.hasSlotted('helper');
    this.hasErrorSlot = this.hasSlotted('error');
  }

  componentDidLoad() {
    this.syncCheckboxes();
  }

  componentDidUpdate() {
    this.syncCheckboxes();
  }

  /**
   * A child reports one checkbox toggling; the group reports the whole
   * selection. The child event is stopped immediately so that one interaction
   * is not observed twice with two different payload shapes — including on the
   * group itself, where plain `stopPropagation` would still run the other
   * listeners. A listener bound directly to the checkbox is below this boundary
   * and still receives its own event.
   */
  @Listen('ssChange')
  handleCheckboxChange(event: CustomEvent<SsCheckedChangeEvent>) {
    const target = event.target as HTMLElement | null;

    if (target && target === this.master) {
      event.stopImmediatePropagation();
      this.commit(event.detail.checked ? this.selectableValues : []);
      return;
    }

    if (!this.ownsCheckbox(target)) return;
    event.stopImmediatePropagation();

    const value = (target as unknown as { value?: string }).value;
    if (value === undefined) return;

    const selected = new Set(this.value ?? []);
    if (event.detail.checked) selected.add(value);
    else selected.delete(value);

    this.commit([...selected]);
  }

  @Listen('ssInvalid')
  handleCheckboxInvalid(event: CustomEvent<SsCheckedChangeEvent>) {
    const target = event.target as HTMLElement | null;
    if (target !== this.master && !this.ownsCheckbox(target)) return;

    event.stopImmediatePropagation();
    this.ssInvalid.emit({ xId: this.xId, name: this.name, value: [...(this.value ?? [])] });
  }

  private commit(next: string[]) {
    this.value = next;
    this.ssChange.emit({ xId: this.xId, name: this.name, value: [...next] });
  }

  /** True for a coordinated child, which excludes the master and this group's own events. */
  private ownsCheckbox(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    return !!el && el !== this.master && el.tagName?.toLowerCase() === 'ss-checkbox' && el.closest('ss-checkbox-group') === this.el;
  }

  /** Scoped rendering relocates slotted content, so the search covers the subtree. */
  private hasSlotted(name: string): boolean {
    const el = this.el.querySelector(`[slot="${name}"]`);
    return !!el && el.closest('ss-checkbox-group') === this.el;
  }

  private get checkboxes(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>('ss-checkbox')).filter(box => box !== this.master && box.closest('ss-checkbox-group') === this.el);
  }

  /** Values the master may toggle: a disabled choice keeps whatever it has. */
  private get selectableValues(): string[] {
    const kept = (this.value ?? []).filter(value => this.checkboxes.some(box => this.choiceValue(box) === value && this.isDisabled(box)));
    const selectable = this.checkboxes.filter(box => !this.isDisabled(box)).map(box => this.choiceValue(box));

    return [...new Set([...kept, ...selectable])].filter((value): value is string => value !== undefined);
  }

  private choiceValue(box: HTMLElement): string | undefined {
    return (box as unknown as { value?: string }).value;
  }

  private isDisabled(box: HTMLElement): boolean {
    return this.disabled || !!(box as unknown as { disabled?: boolean }).disabled;
  }

  private get showHelper() {
    return this.hasHelperSlot || !!this.helperText;
  }

  private get showError() {
    return this.invalid && (this.hasErrorSlot || !!this.errorText);
  }

  private get showLabel() {
    return this.hasLabelSlot || !!this.label;
  }

  private get labelId() {
    return `${this.groupId}-label`;
  }

  private get helperId() {
    return `${this.groupId}-helper`;
  }

  private get errorId() {
    return `${this.groupId}-error`;
  }

  private syncCheckboxes() {
    const selected = new Set(this.value ?? []);
    const boxes = this.checkboxes;

    boxes.forEach((box, index) => {
      const props = box as unknown as Record<string, unknown>;
      const value = this.choiceValue(box);

      props.name = this.name;
      props.size = this.size;
      if (this.disabled) props.disabled = true;
      props.checked = value !== undefined && selected.has(value);
      // See the `required` prop: the requirement is the group's, and it is
      // lifted as soon as anything at all is selected.
      props.required = this.required && index === 0 && selected.size === 0;
    });

    if (!this.master) return;

    const selectable = boxes.filter(box => !this.isDisabled(box));
    const chosen = selectable.filter(box => selected.has(this.choiceValue(box) as string));
    const masterProps = this.master as unknown as Record<string, unknown>;

    masterProps.size = this.size;
    masterProps.disabled = this.disabled;
    masterProps.checked = selectable.length > 0 && chosen.length === selectable.length;
    masterProps.indeterminate = chosen.length > 0 && chosen.length < selectable.length;
  }

  private getClasses() {
    const b = 'ss-checkbox-group';
    return {
      [b]: true,
      [`${b}--${this.orientation}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--required`]: this.required,
      [`${b}--invalid`]: this.invalid,
      [`${b}--disabled`]: this.disabled,
    };
  }

  render() {
    const messageSize = MESSAGE_SIZE[this.size];
    const describedBy = composeDescribedBy(this.showHelper && this.helperId, this.showError && this.errorId);

    return (
      <div
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        role="group"
        aria-labelledby={this.showLabel ? this.labelId : undefined}
        aria-describedby={describedBy}
        aria-required={this.required ? 'true' : undefined}
        aria-invalid={this.invalid ? 'true' : undefined}
      >
        {this.showLabel && (
          <ss-typography class="ss-checkbox-group__label" xId={this.labelId} as="span" fontSize={this.size}>
            {this.hasLabelSlot ? <slot name="label" /> : this.label}
          </ss-typography>
        )}

        {this.selectAllLabel && <ss-checkbox class="ss-checkbox-group__master" ref={el => (this.master = el)} label={this.selectAllLabel} size={this.size} />}

        <div class="ss-checkbox-group__choices">
          <slot />
        </div>

        {this.showHelper && (
          <ss-typography class="ss-checkbox-group__helper" xId={this.helperId} as="small" fontSize={messageSize} color="muted">
            {this.hasHelperSlot ? <slot name="helper" /> : this.helperText}
          </ss-typography>
        )}

        {this.showError && (
          <ss-typography class="ss-checkbox-group__error" xId={this.errorId} as="small" fontSize={messageSize} color="error" role="alert">
            {this.hasErrorSlot ? <slot name="error" /> : this.errorText}
          </ss-typography>
        )}
      </div>
    );
  }
}
