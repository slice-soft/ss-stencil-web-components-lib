import { AttachInternals, Component, Element, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import { applyDescribedBy } from '../../../utils/a11y';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { InputStyle, SsInputValueEvent } from '../../../types/control-events';

export type SsInputType = 'text' | 'password' | 'email' | 'number' | 'url' | 'tel' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'file' | 'hidden';

@Component({
  tag: 'ss-input',
  styleUrl: 'ss-input.scss',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class SsInput {
  private input?: HTMLInputElement;

  /**
   * Form association for the host element. The rendered input lives in this
   * component's shadow root, where a surrounding form cannot see it, so the
   * host mirrors its value and validity instead.
   */
  @Element() el!: HTMLElement;

  @AttachInternals() internals: ElementInternals;

  /** Set by an ancestor fieldset through formDisabledCallback. */
  @State() ancestorDisabled: boolean = false;

  /** Id applied to the native input; also included in event details. */
  @Prop() xId?: string;
  /** Name of the native input for form submission. */
  @Prop() name?: string;
  /** Native input type. */
  @Prop() type: SsInputType = 'text';
  /** Color variant of the input. */
  @Prop() color: Variant = 'primary';
  /** Current value of the input; also the value restored on form reset. */
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

  private get isDisabled() {
    return this.disabled || this.ancestorDisabled;
  }

  componentDidLoad() {
    this.syncFormState();
    applyDescribedBy(this.el, this.input, this.describedBy);
  }

  componentDidUpdate() {
    this.syncFormState();
    applyDescribedBy(this.el, this.input, this.describedBy);
  }

  /** Restores the value the input was rendered with, as a native input does. */
  formResetCallback() {
    if (this.input) this.input.value = this.value ?? '';
    this.syncFormState();
  }

  /** Fired when an ancestor fieldset is disabled or re-enabled. */
  formDisabledCallback(disabled: boolean) {
    this.ancestorDisabled = disabled;
  }

  /**
   * Copies the rendered input's value and native validity onto the host, so the
   * surrounding form submits the value and reports the same constraint failures
   * it would report for a plain input. The input is passed as the validation
   * anchor so the browser points its message at the visible control.
   */
  private syncFormState() {
    // `ElementInternals` needs a polyfill in older browsers, and Stencil's
    // spec-test DOM does not implement it at all. Form association is therefore
    // verified in the e2e suite, against a real browser.
    if (!this.input || typeof this.internals?.setFormValue !== 'function') return;
    this.internals.setFormValue(this.input.value);
    this.internals.setValidity(this.input.validity, this.input.validationMessage, this.input);
  }

  private getClasses() {
    const b = 'ss-input';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.isDisabled,
      [`${b}--readonly`]: this.readonly,
      [`${b}--invalid`]: this.invalid,
    };
  }

  private emitValue(ev: Event) {
    return { xId: this.xId, value: (ev.target as HTMLInputElement).value };
  }

  private handleInput = (ev: Event) => {
    this.syncFormState();
    this.ssInput.emit(this.emitValue(ev));
  };

  private handleChange = (ev: Event) => {
    this.syncFormState();
    this.ssChange.emit(this.emitValue(ev));
  };

  render() {
    return (
      <input
        ref={el => (this.input = el)}
        id={this.xId}
        name={this.name}
        type={this.type}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        disabled={this.isDisabled}
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
        onInput={this.handleInput}
        onChange={this.handleChange}
        onInvalid={ev => this.ssInvalid.emit(this.emitValue(ev))}
        onFocus={ev => this.ssFocus.emit(ev)}
        onBlur={ev => this.ssBlur.emit(ev)}
      />
    );
  }
}
