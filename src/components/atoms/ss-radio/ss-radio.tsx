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

  /** Id applied to the native input; also included in event details. */
  @Prop() xId?: string;
  /** Name shared by the radios that form one group; what makes the browser treat them as a set. */
  @Prop() name?: string;
  /** Value submitted with the form when this radio is the selected one. */
  @Prop() value?: string;
  /** Whether this radio is the selected one; updated on user interaction and reflected as an attribute. */
  @Prop({ mutable: true, reflect: true }) checked: boolean = false;
  /** Disables the radio. */
  @Prop() disabled: boolean = false;
  /** Prevents selection while still allowing focus and blur events. */
  @Prop() readonly: boolean = false;
  /** Marks the radio required; one required radio makes its whole native group required. */
  @Prop() required: boolean = false;
  /** Applies error styling and sets aria-invalid. */
  @Prop() invalid: boolean = false;
  /** Label text rendered when no slot content is provided. */
  @Prop() label?: string;
  /** Size of the radio. */
  @Prop() size: Size = 'md';
  /** Id of the element that describes the radio, set as aria-describedby. */
  @Prop() describedBy?: string;
  /** Inline CSS styles applied to the rendered label element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the radio becomes selected; detail contains xId, name, value and checked. */
  @Event() ssChange: EventEmitter<SsCheckedChangeEvent>;
  /** Emitted when the radio gains focus; detail is the native FocusEvent. */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  /** Emitted when the radio loses focus; detail is the native FocusEvent. */
  @Event() ssBlur: EventEmitter<FocusEvent>;
  /** Emitted on native invalid events; detail contains xId, name, value and checked. */
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
