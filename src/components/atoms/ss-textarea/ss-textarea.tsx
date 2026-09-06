import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { InputStyle, SsInputValueEvent } from '../../../types/control-events';

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

@Component({
  tag: 'ss-textarea',
  styleUrl: 'ss-textarea.scss',
  shadow: true,
})
export class SsTextarea {
  /** Id applied to the native textarea; also included in event details. */
  @Prop() xId?: string;
  /** Name of the native textarea for form submission. */
  @Prop() name?: string;
  /** Current value of the textarea. */
  @Prop() value?: string;
  /** Placeholder text shown when the textarea is empty. */
  @Prop() placeholder?: string;
  /** Color variant of the textarea. */
  @Prop() color: Variant = 'primary';
  /** Visual style of the textarea. */
  @Prop() xStyle: InputStyle = 'solid';
  /** Size of the textarea. */
  @Prop() size: Size = 'md';
  /** Number of visible text rows. */
  @Prop() rows: number = 3;
  /** Native cols attribute: visible width in characters. */
  @Prop() cols?: number;
  /** Disables the textarea. */
  @Prop() disabled: boolean = false;
  /** Makes the textarea read-only. */
  @Prop() readonly: boolean = false;
  /** Marks the textarea as required for form validation. */
  @Prop() required: boolean = false;
  /** Applies error styling and sets aria-invalid. */
  @Prop() invalid: boolean = false;
  /** Expands the textarea to the full width of its container. */
  @Prop() fullWidth: boolean = false;
  /** Allowed resize direction: none, vertical, horizontal or both. */
  @Prop() resize: TextareaResize = 'vertical';
  /** Minimum number of characters allowed. */
  @Prop() minLength?: number;
  /** Maximum number of characters allowed. */
  @Prop() maxLength?: number;
  /** Accessible label for screen readers. */
  @Prop() accessibilityLabel?: string;
  /** Id of the element that describes the textarea, set as aria-describedby. */
  @Prop() describedBy?: string;
  /** Inline CSS styles applied to the textarea element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted on native input events; detail contains xId and value. */
  @Event() ssInput: EventEmitter<SsInputValueEvent>;
  /** Emitted on native change events; detail contains xId and value. */
  @Event() ssChange: EventEmitter<SsInputValueEvent>;
  /** Emitted when the textarea gains focus; detail is the native FocusEvent. */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  /** Emitted when the textarea loses focus; detail is the native FocusEvent. */
  @Event() ssBlur: EventEmitter<FocusEvent>;
  /** Emitted on native invalid events; detail contains xId and value. */
  @Event() ssInvalid: EventEmitter<SsInputValueEvent>;

  private getClasses() {
    const b = 'ss-textarea';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--resize-${this.resize}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.disabled,
      [`${b}--readonly`]: this.readonly,
      [`${b}--invalid`]: this.invalid,
    };
  }

  private emitValue(event: Event): SsInputValueEvent {
    return { xId: this.xId, value: (event.target as HTMLTextAreaElement).value };
  }

  render() {
    return (
      <textarea
        id={this.xId}
        name={this.name}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        value={this.value}
        placeholder={this.placeholder}
        rows={this.rows}
        cols={this.cols}
        disabled={this.disabled}
        readOnly={this.readonly}
        required={this.required}
        minLength={this.minLength}
        maxLength={this.maxLength}
        aria-invalid={this.invalid ? 'true' : undefined}
        aria-label={this.accessibilityLabel}
        aria-describedby={this.describedBy}
        onInput={event => this.ssInput.emit(this.emitValue(event))}
        onChange={event => this.ssChange.emit(this.emitValue(event))}
        onFocus={event => this.ssFocus.emit(event)}
        onBlur={event => this.ssBlur.emit(event)}
        onInvalid={event => this.ssInvalid.emit(this.emitValue(event))}
      />
    );
  }
}
