import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { InputStyle, SsInputValueEvent } from '../../../types/control-events';

export type SsInputType = 'text' | 'password' | 'email' | 'number' | 'url' | 'tel' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'file' | 'hidden';

@Component({
  tag: 'ss-input',
  styleUrl: 'ss-input.scss',
  shadow: true,
})
export class SsInput {
  /** Id applied to the native input; also included in event details. */
  @Prop() xId?: string;
  /** Name of the native input for form submission. */
  @Prop() name?: string;
  /** Native input type. */
  @Prop() type: SsInputType = 'text';
  /** Color variant of the input. */
  @Prop() color: Variant = 'primary';
  /** Current value of the input. */
  @Prop() value?: string;
  /** Placeholder text shown when the input is empty. */
  @Prop() placeholder?: string;
  /** Disables the input. */
  @Prop() disabled: boolean = false;
  /** Makes the input read-only. */
  @Prop() readonly: boolean = false;
  /** Marks the input as required for form validation. */
  @Prop() required: boolean = false;
  /** Applies error styling and sets aria-invalid without changing native validity. */
  @Prop() invalid: boolean = false;
  /** Native autocomplete attribute of the input. */
  @Prop() autocomplete?: string;
  /** Minimum value for numeric and date inputs. */
  @Prop() min?: string;
  /** Maximum value for numeric and date inputs. */
  @Prop() max?: string;
  /** Step granularity for numeric and date inputs. */
  @Prop() step?: string;
  /** Minimum number of characters allowed. */
  @Prop() minLength?: number;
  /** Maximum number of characters allowed. */
  @Prop() maxLength?: number;
  /** Accessible label for screen readers. */
  @Prop() accessibilityLabel?: string;
  /** Id of the element that describes the input, set as aria-describedby. */
  @Prop() describedBy?: string;
  /** Inline CSS styles applied to the input element. */
  @Prop() inlineStyles?: InlineStyles;
  /** Size of the input. */
  @Prop() size: Size = 'md';
  /** Expands the input to the full width of its container. */
  @Prop() fullWidth: boolean = false;
  /** Visual style of the input. */
  @Prop() xStyle: InputStyle = 'solid';

  /** Emitted on native input events; detail contains xId and value. */
  @Event() ssInput: EventEmitter<SsInputValueEvent>;
  /** Emitted on native change events; detail contains xId and value. */
  @Event() ssChange: EventEmitter<SsInputValueEvent>;
  /** Emitted on native invalid events; detail contains xId and value. */
  @Event() ssInvalid: EventEmitter<SsInputValueEvent>;
  /** Emitted when the input gains focus; detail is the native FocusEvent. */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  /** Emitted when the input loses focus; detail is the native FocusEvent. */
  @Event() ssBlur: EventEmitter<FocusEvent>;

  private getClasses() {
    const b = 'ss-input';
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

  private emitValue(ev: Event) {
    return { xId: this.xId, value: (ev.target as HTMLInputElement).value };
  }

  render() {
    return (
      <input
        id={this.xId}
        name={this.name}
        type={this.type}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        disabled={this.disabled}
        readOnly={this.readonly}
        required={this.required}
        aria-invalid={this.invalid ? 'true' : undefined}
        aria-label={this.accessibilityLabel}
        aria-describedby={this.describedBy}
        autoComplete={this.autocomplete}
        min={this.min}
        max={this.max}
        step={this.step}
        minLength={this.minLength}
        maxLength={this.maxLength}
        placeholder={this.placeholder}
        value={this.value}
        onInput={ev => this.ssInput.emit(this.emitValue(ev))}
        onChange={ev => this.ssChange.emit(this.emitValue(ev))}
        onInvalid={ev => this.ssInvalid.emit(this.emitValue(ev))}
        onFocus={ev => this.ssFocus.emit(ev)}
        onBlur={ev => this.ssBlur.emit(ev)}
      />
    );
  }
}
