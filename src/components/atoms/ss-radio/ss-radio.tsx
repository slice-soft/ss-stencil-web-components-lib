import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { SsCheckedChangeEvent } from '../../../types/control-events';

/**
 * @slot - Label content.
 */
@Component({
  tag: 'ss-radio',
  styleUrl: 'ss-radio.scss',
  scoped: true,
})
export class SsRadio {
  private input?: HTMLInputElement;

  @Prop() xId?: string;
  @Prop() name?: string;
  @Prop() value?: string;
  @Prop({ mutable: true, reflect: true }) checked: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop() readonly: boolean = false;
  @Prop() required: boolean = false;
  @Prop() invalid: boolean = false;
  @Prop() label?: string;
  @Prop() size: Size = 'md';
  @Prop() describedBy?: string;
  @Prop() inlineStyles?: InlineStyles;

  @Event() ssChange: EventEmitter<SsCheckedChangeEvent>;
  @Event() ssFocus: EventEmitter<FocusEvent>;
  @Event() ssBlur: EventEmitter<FocusEvent>;
  @Event() ssInvalid: EventEmitter<SsCheckedChangeEvent>;

  private getClasses() {
    const b = 'ss-radio';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--checked`]: this.checked,
      [`${b}--disabled`]: this.disabled,
      [`${b}--readonly`]: this.readonly,
      [`${b}--invalid`]: this.invalid,
    };
  }

  private emitValue(checked = this.checked): SsCheckedChangeEvent {
    return { xId: this.xId, name: this.name, value: this.value, checked };
  }

  private handleChange = (event: Event) => {
    if (this.readonly) {
      event.preventDefault();
      this.input!.checked = this.checked;
      return;
    }
    this.checked = (event.target as HTMLInputElement).checked;
    this.ssChange.emit(this.emitValue());
  };

  render() {
    return (
      <label class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <input
          ref={el => (this.input = el)}
          id={this.xId}
          class="ss-radio__input"
          type="radio"
          name={this.name}
          value={this.value}
          checked={this.checked}
          disabled={this.disabled}
          readOnly={this.readonly}
          required={this.required}
          aria-invalid={this.invalid ? 'true' : undefined}
          aria-describedby={this.describedBy}
          onChange={this.handleChange}
          onFocus={event => this.ssFocus.emit(event)}
          onBlur={event => this.ssBlur.emit(event)}
          onInvalid={() => this.ssInvalid.emit(this.emitValue())}
        />
        <span class="ss-radio__control" aria-hidden="true">
          <span class="ss-radio__mark" />
        </span>
        <span class="ss-radio__label">
          <slot>{this.label}</slot>
        </span>
      </label>
    );
  }
}
