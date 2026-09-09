import { AttachInternals, Component, Element, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { applyDescribedBy, applyLabelledBy } from '../../../utils/a11y';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { InputStyle, SsInputValueEvent } from '../../../types/control-events';

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

@Component({
  tag: 'ss-textarea',
  styleUrl: 'ss-textarea.scss',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class SsTextarea {
  private textarea?: HTMLTextAreaElement;

  /**
   * Form association for the host element. The rendered textarea lives in this
   * component's shadow root, where a surrounding form cannot see it, so the
   * host mirrors its value and validity instead.
   */
  @Element() el!: HTMLElement;

  @AttachInternals() internals: ElementInternals;

  /** Set by an ancestor fieldset through formDisabledCallback. */
  @State() ancestorDisabled: boolean = false;

  /** Id applied to the native textarea; also included in event details. */
  @Prop() xId?: string;
  /** Name of the native textarea for form submission. */
  @Prop() name?: string;
  /** Current value of the textarea; also the value restored on form reset. */
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
  /** Id of the element that labels the textarea, set as aria-labelledby. */
  @Prop() labelledBy?: string;
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

  private get isDisabled() {
    return this.disabled || this.ancestorDisabled;
  }

  componentDidLoad() {
    this.syncFormState();
    applyLabelledBy(this.el, this.textarea, this.labelledBy);
    applyDescribedBy(this.el, this.textarea, this.describedBy);
  }

  componentDidUpdate() {
    this.syncFormState();
    applyLabelledBy(this.el, this.textarea, this.labelledBy);
    applyDescribedBy(this.el, this.textarea, this.describedBy);
  }

  /** Restores the value the textarea was rendered with, as a native one does. */
  formResetCallback() {
    if (this.textarea) this.textarea.value = this.value ?? '';
    this.syncFormState();
  }

  /** Fired when an ancestor fieldset is disabled or re-enabled. */
  formDisabledCallback(disabled: boolean) {
    this.ancestorDisabled = disabled;
  }

  /**
   * Copies the rendered textarea's value and native validity onto the host, so
   * the surrounding form submits the value and reports the same constraint
   * failures it would report for a plain textarea.
   */
  private syncFormState() {
    // `ElementInternals` needs a polyfill in older browsers, and Stencil's
    // spec-test DOM does not implement it at all. Form association is therefore
    // verified in the e2e suite, against a real browser.
    if (!this.textarea || typeof this.internals?.setFormValue !== 'function') return;
    this.internals.setFormValue(this.textarea.value);
    this.internals.setValidity(this.textarea.validity, this.textarea.validationMessage, this.textarea);
  }

  private getClasses() {
    const b = 'ss-textarea';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--resize-${this.resize}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.isDisabled,
      [`${b}--readonly`]: this.readonly,
      [`${b}--invalid`]: this.invalid,
    };
  }

  private emitValue(event: Event): SsInputValueEvent {
    return { xId: this.xId, value: (event.target as HTMLTextAreaElement).value };
  }

  private handleInput = (event: Event) => {
    this.syncFormState();
    this.ssInput.emit(this.emitValue(event));
  };

  private handleChange = (event: Event) => {
    this.syncFormState();
    this.ssChange.emit(this.emitValue(event));
  };

  render() {
    return (
      <textarea
        ref={el => (this.textarea = el)}
        id={this.xId}
        name={this.name}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        value={this.value}
        placeholder={this.placeholder}
        rows={this.rows}
        cols={this.cols}
        disabled={this.isDisabled}
        readOnly={this.readonly}
        required={this.required}
        minLength={this.minLength}
        maxLength={this.maxLength}
        aria-invalid={this.invalid ? 'true' : undefined}
        aria-label={this.accessibilityLabel}
        aria-labelledby={this.labelledBy}
        aria-describedby={this.describedBy}
        onInput={this.handleInput}
        onChange={this.handleChange}
        onFocus={event => this.ssFocus.emit(event)}
        onBlur={event => this.ssBlur.emit(event)}
        onInvalid={event => this.ssInvalid.emit(this.emitValue(event))}
      />
    );
  }
}
