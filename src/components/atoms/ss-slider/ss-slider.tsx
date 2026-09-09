import { AttachInternals, Component, Element, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { applyDescribedBy } from '../../../utils/a11y';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type SsSliderValueEvent = { xId?: string; name?: string; value: number };

@Component({
  tag: 'ss-slider',
  styleUrl: 'ss-slider.scss',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class SsSlider {
  private input?: HTMLInputElement;
  /** Value the slider loaded with; restored on form reset, since `value` mutates. */
  private defaultValue: number = 0;

  /**
   * Form association for the host element. The rendered range input lives in
   * this component's shadow root, where a surrounding form cannot see it, so
   * the host mirrors its value and validity instead.
   */
  @Element() el!: HTMLElement;

  @AttachInternals() internals: ElementInternals;

  /** Set by an ancestor fieldset through formDisabledCallback. */
  @State() ancestorDisabled: boolean = false;

  /** Id applied to the native range input; also included in event details. */
  @Prop() xId?: string;
  /** Name of the native input for form submission. */
  @Prop() name?: string;
  /** Current value of the slider; updated on user interaction. */
  @Prop({ mutable: true }) value: number = 0;
  /** Minimum value. */
  @Prop() min: number = 0;
  /** Maximum value. */
  @Prop() max: number = 100;
  /** Step granularity of the value. */
  @Prop() step: number = 1;
  /** Color variant of the slider. */
  @Prop() color: Variant = 'primary';
  /** Size of the slider. */
  @Prop() size: Size = 'md';
  /** Disables the slider. */
  @Prop() disabled: boolean = false;
  /** Prevents changing the value while keeping the slider focusable. */
  @Prop() readonly: boolean = false;
  /** Applies error styling and sets aria-invalid. */
  @Prop() invalid: boolean = false;
  /** Expands the slider to the full width of its container. */
  @Prop() fullWidth: boolean = false;
  /** Renders the current value next to the slider. */
  @Prop() showValue: boolean = false;
  /** Custom text rendered instead of the numeric value when showValue is enabled. */
  @Prop() valueLabel?: string;
  /** Accessible label for screen readers. */
  @Prop() accessibilityLabel?: string;
  /** Id of the element that describes the slider, set as aria-describedby. */
  @Prop() describedBy?: string;
  /** Inline CSS styles applied to the wrapper element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted on native input events while dragging; detail contains xId, name and value. */
  @Event() ssInput: EventEmitter<SsSliderValueEvent>;
  /** Emitted on native change events; detail contains xId, name and value. */
  @Event() ssChange: EventEmitter<SsSliderValueEvent>;
  /** Emitted when the slider gains focus; detail is the native FocusEvent. */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  /** Emitted when the slider loses focus; detail is the native FocusEvent. */
  @Event() ssBlur: EventEmitter<FocusEvent>;
  /** Emitted on native invalid events; detail contains xId, name and value. */
  @Event() ssInvalid: EventEmitter<SsSliderValueEvent>;

  private get isDisabled() {
    return this.disabled || this.ancestorDisabled;
  }

  componentWillLoad() {
    this.defaultValue = this.value;
  }

  componentDidLoad() {
    this.syncFormState();
    applyDescribedBy(this.el, this.input, this.describedBy);
  }

  componentDidUpdate() {
    this.syncFormState();
    applyDescribedBy(this.el, this.input, this.describedBy);
  }

  /** Restores the value the slider loaded with, as a native range input does. */
  formResetCallback() {
    this.value = this.defaultValue;
    if (this.input) this.input.value = String(this.value);
    this.syncFormState();
  }

  /** Fired when an ancestor fieldset is disabled or re-enabled. */
  formDisabledCallback(disabled: boolean) {
    this.ancestorDisabled = disabled;
  }

  /**
   * Copies the rendered input's value and native validity onto the host, so the
   * surrounding form submits the value a plain range input would submit.
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
    const b = 'ss-slider';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.isDisabled,
      [`${b}--readonly`]: this.readonly,
      [`${b}--invalid`]: this.invalid,
    };
  }

  private emitValue(value = this.value): SsSliderValueEvent {
    return { xId: this.xId, name: this.name, value };
  }

  private getEventValue(event: Event) {
    return Number((event.target as HTMLInputElement).value);
  }

  private handleInput = (event: Event) => {
    if (this.readonly) {
      event.preventDefault();
      if (this.input) this.input.value = String(this.value);
      return;
    }
    this.value = this.getEventValue(event);
    this.syncFormState();
    this.ssInput.emit(this.emitValue());
  };

  private handleChange = (event: Event) => {
    if (this.readonly) {
      event.preventDefault();
      if (this.input) this.input.value = String(this.value);
      return;
    }
    this.value = this.getEventValue(event);
    this.syncFormState();
    this.ssChange.emit(this.emitValue());
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.readonly) {
      event.preventDefault();
    }
  };

  render() {
    const renderedValue = this.valueLabel ?? String(this.value);

    return (
      <span class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <input
          ref={el => (this.input = el)}
          id={this.xId}
          class="ss-slider__input"
          type="range"
          name={this.name}
          min={this.min}
          max={this.max}
          step={this.step}
          value={this.value}
          disabled={this.isDisabled}
          aria-readonly={this.readonly ? 'true' : undefined}
          aria-invalid={this.invalid ? 'true' : undefined}
          aria-label={this.accessibilityLabel}
          aria-describedby={this.describedBy}
          onInput={this.handleInput}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onFocus={event => this.ssFocus.emit(event)}
          onBlur={event => this.ssBlur.emit(event)}
          onInvalid={() => this.ssInvalid.emit(this.emitValue())}
        />
        {this.showValue && <output class="ss-slider__value">{renderedValue}</output>}
      </span>
    );
  }
}
