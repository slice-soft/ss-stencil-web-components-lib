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
  @Prop() xId?: string;
  @Prop() name?: string;
  @Prop() value?: string;
  @Prop() placeholder?: string;
  @Prop() color: Variant = 'primary';
  @Prop() xStyle: InputStyle = 'solid';
  @Prop() size: Size = 'md';
  @Prop() rows: number = 3;
  @Prop() cols?: number;
  @Prop() disabled: boolean = false;
  @Prop() readonly: boolean = false;
  @Prop() required: boolean = false;
  @Prop() invalid: boolean = false;
  @Prop() fullWidth: boolean = false;
  @Prop() resize: TextareaResize = 'vertical';
  @Prop() minLength?: number;
  @Prop() maxLength?: number;
  @Prop() accessibilityLabel?: string;
  @Prop() describedBy?: string;
  @Prop() inlineStyles?: InlineStyles;

  @Event() ssInput: EventEmitter<SsInputValueEvent>;
  @Event() ssChange: EventEmitter<SsInputValueEvent>;
  @Event() ssFocus: EventEmitter<FocusEvent>;
  @Event() ssBlur: EventEmitter<FocusEvent>;
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
