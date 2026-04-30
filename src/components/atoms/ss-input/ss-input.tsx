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
  @Prop() xId?: string;
  @Prop() name?: string;
  @Prop() type: SsInputType = 'text';
  @Prop() color: Variant = 'primary';
  @Prop() value?: string;
  @Prop() placeholder?: string;
  @Prop() disabled: boolean = false;
  @Prop() readonly: boolean = false;
  @Prop() required: boolean = false;
  @Prop() invalid: boolean = false;
  @Prop() autocomplete?: string;
  @Prop() min?: string;
  @Prop() max?: string;
  @Prop() step?: string;
  @Prop() minLength?: number;
  @Prop() maxLength?: number;
  @Prop() accessibilityLabel?: string;
  @Prop() describedBy?: string;
  @Prop() inlineStyles?: InlineStyles;
  @Prop() size: Size = 'md';
  @Prop() fullWidth: boolean = false;
  @Prop() xStyle: InputStyle = 'solid';

  @Event() ssInput: EventEmitter<SsInputValueEvent>;
  @Event() ssChange: EventEmitter<SsInputValueEvent>;
  @Event() ssInvalid: EventEmitter<SsInputValueEvent>;
  @Event() ssFocus: EventEmitter<FocusEvent>;
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
