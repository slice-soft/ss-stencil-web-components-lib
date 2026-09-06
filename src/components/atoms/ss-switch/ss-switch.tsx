import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { SsCheckedChangeEvent } from '../../../types/control-events';

export type SwitchLabelPosition = 'start' | 'end';

/**
 * @slot - Label content.
 */
@Component({
  tag: 'ss-switch',
  styleUrl: 'ss-switch.scss',
  scoped: true,
})
export class SsSwitch {
  private input?: HTMLInputElement;

  /** Id applied to the native input; also included in event details. */
  @Prop() xId?: string;
  /** Name of the native input for form submission. */
  @Prop() name?: string;
  /** Value of the native input sent on form submission. */
  @Prop() value?: string;
  /** Whether the switch is on; updated on user interaction and reflected as an attribute. */
  @Prop({ mutable: true, reflect: true }) checked: boolean = false;
  /** Disables the switch. */
  @Prop() disabled: boolean = false;
  /** Prevents toggling while still allowing focus and blur events. */
  @Prop() readonly: boolean = false;
  /** Marks the switch as required for form validation. */
  @Prop() required: boolean = false;
  /** Applies error styling and sets aria-invalid. */
  @Prop() invalid: boolean = false;
  /** Label text rendered when no slot content is provided. */
  @Prop() label?: string;
  /** Position of the label relative to the control: start or end. */
  @Prop() labelPosition: SwitchLabelPosition = 'end';
  /** Size of the switch. */
  @Prop() size: Size = 'md';
  /** Id of the element that describes the switch, set as aria-describedby. */
  @Prop() describedBy?: string;
  /** Inline CSS styles applied to the root label element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the checked state changes; detail contains xId, name, value and checked. */
  @Event() ssChange: EventEmitter<SsCheckedChangeEvent>;
  /** Emitted when the switch gains focus; detail is the native FocusEvent. */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  /** Emitted when the switch loses focus; detail is the native FocusEvent. */
  @Event() ssBlur: EventEmitter<FocusEvent>;
  /** Emitted on native invalid events; detail contains xId, name, value and checked. */
  @Event() ssInvalid: EventEmitter<SsCheckedChangeEvent>;

  private getClasses() {
    const b = 'ss-switch';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--checked`]: this.checked,
      [`${b}--disabled`]: this.disabled,
      [`${b}--readonly`]: this.readonly,
      [`${b}--invalid`]: this.invalid,
      [`${b}--label-${this.labelPosition}`]: true,
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
    const text = (
      <span class="ss-switch__label">
        <slot>{this.label}</slot>
      </span>
    );
    const control = (
      <span class="ss-switch__track" aria-hidden="true">
        <span class="ss-switch__thumb" />
      </span>
    );

    return (
      <label class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <input
          ref={el => (this.input = el)}
          id={this.xId}
          class="ss-switch__input"
          type="checkbox"
          role="switch"
          name={this.name}
          value={this.value}
          checked={this.checked}
          disabled={this.disabled}
          readOnly={this.readonly}
          required={this.required}
          aria-checked={this.checked ? 'true' : 'false'}
          aria-invalid={this.invalid ? 'true' : undefined}
          aria-describedby={this.describedBy}
          onChange={this.handleChange}
          onFocus={event => this.ssFocus.emit(event)}
          onBlur={event => this.ssBlur.emit(event)}
          onInvalid={() => this.ssInvalid.emit(this.emitValue())}
        />
        {this.labelPosition === 'start' && text}
        {control}
        {this.labelPosition === 'end' && text}
      </label>
    );
  }
}
