import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { InputStyle, SsInputValueEvent } from '../../../types/control-events';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

let comboboxId = 0;

/**
 * @slot - Native option elements for the internal datalist.
 */
@Component({
  tag: 'ss-combobox',
  styleUrl: 'ss-combobox.scss',
  scoped: true,
})
export class SsCombobox {
  private readonly fallbackListId = `ss-combobox-list-${comboboxId++}`;

  /** Id applied to the native input; also included in event details and used to derive the datalist id. */
  @Prop() xId?: string;
  /** Name of the native input for form submission. */
  @Prop() name?: string;
  /** Current value of the input. */
  @Prop() value?: string;
  /** Placeholder text shown when the input is empty. */
  @Prop() placeholder?: string;
  /** Color variant of the combobox. */
  @Prop() color: Variant = 'primary';
  /** Visual style of the input field. */
  @Prop() xStyle: InputStyle = 'solid';
  /** Size of the combobox. */
  @Prop() size: Size = 'md';
  /** Disables the input. */
  @Prop() disabled: boolean = false;
  /** Makes the input read-only. */
  @Prop() readonly: boolean = false;
  /** Marks the input as required for form validation. */
  @Prop() required: boolean = false;
  /** Applies error styling and sets aria-invalid. */
  @Prop() invalid: boolean = false;
  /** Native autocomplete attribute of the input. */
  @Prop() autocomplete?: string;
  /** Minimum number of characters allowed. */
  @Prop() minLength?: number;
  /** Maximum number of characters allowed. */
  @Prop() maxLength?: number;
  /** Expands the combobox to the full width of its container. */
  @Prop() fullWidth: boolean = false;
  /** Custom id for the internal datalist; defaults to xId-list or a generated id. */
  @Prop() listId?: string;
  /** Accessible label for screen readers. */
  @Prop() accessibilityLabel?: string;
  /** Id of the element that describes the input, set as aria-describedby. */
  @Prop() describedBy?: string;
  /** Inline CSS styles applied to the wrapper element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted on native input events; detail contains xId and the current value. */
  @Event() ssInput: EventEmitter<SsInputValueEvent>;
  /** Emitted on native change events; detail contains xId and value. */
  @Event() ssChange: EventEmitter<SsInputValueEvent>;
  /** Emitted when the input gains focus; detail is the native FocusEvent. */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  /** Emitted when the input loses focus; detail is the native FocusEvent. */
  @Event() ssBlur: EventEmitter<FocusEvent>;
  /** Emitted on native invalid events; detail contains xId and value. */
  @Event() ssInvalid: EventEmitter<SsInputValueEvent>;

  private get computedListId() {
    return this.listId ?? (this.xId ? `${this.xId}-list` : this.fallbackListId);
  }

  private getClasses() {
    const b = 'ss-combobox';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.disabled,
      [`${b}--readonly`]: this.readonly,
      [`${b}--invalid`]: this.invalid,
    };
  }

  private emitValue(event: Event): SsInputValueEvent {
    return { xId: this.xId, value: (event.target as HTMLInputElement).value };
  }

  render() {
    return (
      <span class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <input
          id={this.xId}
          class="ss-combobox__input"
          type="text"
          name={this.name}
          value={this.value}
          placeholder={this.placeholder}
          list={this.computedListId}
          disabled={this.disabled}
          readOnly={this.readonly}
          required={this.required}
          autoComplete={this.autocomplete}
          minLength={this.minLength}
          maxLength={this.maxLength}
          aria-invalid={this.invalid ? 'true' : undefined}
          aria-label={this.accessibilityLabel}
          aria-describedby={this.describedBy}
          role="combobox"
          aria-autocomplete="list"
          onInput={event => this.ssInput.emit(this.emitValue(event))}
          onChange={event => this.ssChange.emit(this.emitValue(event))}
          onFocus={event => this.ssFocus.emit(event)}
          onBlur={event => this.ssBlur.emit(event)}
          onInvalid={event => this.ssInvalid.emit(this.emitValue(event))}
        />
        <datalist id={this.computedListId}>
          <slot />
        </datalist>
      </span>
    );
  }
}
