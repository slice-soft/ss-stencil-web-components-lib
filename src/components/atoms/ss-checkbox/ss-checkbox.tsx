import { Component, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';
import { Size } from '../../../types/size';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { SsCheckedChangeEvent } from '../../../types/control-events';

/**
 * @slot - Label content.
 */
@Component({
  tag: 'ss-checkbox',
  styleUrl: 'ss-checkbox.scss',
  scoped: true,
})
export class SsCheckbox {
  private input?: HTMLInputElement;

  /** Id applied to the native input; also included in event details. */
  @Prop() xId?: string;
  /** Name of the native input for form submission. */
  @Prop() name?: string;
  /** Value of the native input sent on form submission. */
  @Prop() value?: string;
  /** Whether the checkbox is checked; updated on user interaction and reflected as an attribute. */
  @Prop({ mutable: true, reflect: true }) checked: boolean = false;
  /** Shows the indeterminate state; cleared when the user toggles the checkbox. */
  @Prop({ mutable: true, reflect: true }) indeterminate: boolean = false;
  /** Disables the checkbox. */
  @Prop() disabled: boolean = false;
  /** Prevents changes to the checked state while still allowing focus and blur events. */
  @Prop() readonly: boolean = false;
  /** Marks the checkbox as required for form validation. */
  @Prop() required: boolean = false;
  /** Applies error styling and sets aria-invalid. */
  @Prop() invalid: boolean = false;
  /** Label text rendered when no slot content is provided. */
  @Prop() label?: string;
  /** Size of the checkbox. */
  @Prop() size: Size = 'md';
  /** Id of the element that describes the checkbox, set as aria-describedby. */
  @Prop() describedBy?: string;
  /** Inline CSS styles applied to the root label element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the checked state changes; detail contains xId, name, value and checked. */
  @Event() ssChange: EventEmitter<SsCheckedChangeEvent>;
  /** Emitted when the checkbox gains focus; detail is the native FocusEvent. */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  /** Emitted when the checkbox loses focus; detail is the native FocusEvent. */
  @Event() ssBlur: EventEmitter<FocusEvent>;
  /** Emitted on native invalid events; detail contains xId, name, value and checked. */
  @Event() ssInvalid: EventEmitter<SsCheckedChangeEvent>;

  componentDidLoad() {
    this.syncIndeterminate();
  }

  componentDidUpdate() {
    this.syncIndeterminate();
  }

  @Watch('indeterminate')
  syncIndeterminate() {
    if (this.input) {
      this.input.indeterminate = this.indeterminate;
    }
  }

  private getClasses() {
    const b = 'ss-checkbox';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--checked`]: this.checked,
      [`${b}--indeterminate`]: this.indeterminate,
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
      this.input!.indeterminate = this.indeterminate;
      return;
    }
    this.indeterminate = false;
    this.checked = (event.target as HTMLInputElement).checked;
    this.ssChange.emit(this.emitValue());
  };

  render() {
    return (
      <label class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <input
          ref={el => (this.input = el)}
          id={this.xId}
          class="ss-checkbox__input"
          type="checkbox"
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
        <span class="ss-checkbox__control" aria-hidden="true">
          <span class="ss-checkbox__mark" />
        </span>
        <span class="ss-checkbox__label">
          <slot>{this.label}</slot>
        </span>
      </label>
    );
  }
}
