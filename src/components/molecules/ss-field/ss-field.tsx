import { Component, Element, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { composeDescribedBy } from '../../../utils/a11y';
import { resolveId } from '../../../utils/id';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type FieldOrientation = 'vertical' | 'horizontal';

/** State the field coordinates on the control, and can therefore also clear. */
type CoordinatedState = 'required' | 'disabled' | 'invalid';

/** Controls this field will wire. Anything else in the default slot is left alone. */
const CUSTOM_CONTROLS = 'ss-input,ss-textarea,ss-select,ss-combobox,ss-slider,ss-checkbox,ss-switch';
const CONTROLS = `${CUSTOM_CONTROLS},input,select,textarea`;

/** Helper and error text sit one step below the label, and never below `xs`. */
const MESSAGE_SIZE: Record<Size, Size> = {
  'xs': 'xs',
  'sm': 'xs',
  'md': 'sm',
  'lg': 'sm',
  'xl': 'md',
  '2xl': 'lg',
  '3xl': 'xl',
};

/**
 * Associates one form control with its label, helper text and error message,
 * generating the ids and coordinating the state that a consumer would otherwise
 * repeat on both the label and the control.
 *
 * The control is supplied through the default slot and stays owned by the
 * caller: the field never touches its value, type, placeholder or appearance.
 * It sets only what association requires — the id the label points at, the
 * description reference, and the `required`/`disabled`/`invalid` state it was
 * given. State the field was not given is left as the caller set it on the
 * control; the field only clears what it applied itself.
 *
 * @slot - The form control. If several are supplied, only the first is wired.
 * @slot label - Rich label content; overrides the `label` prop.
 * @slot helper - Rich helper content; overrides the `helperText` prop.
 * @slot error - Rich error content; overrides the `errorText` prop. Shown only while invalid.
 */
@Component({
  tag: 'ss-field',
  styleUrl: 'ss-field.scss',
  scoped: true,
})
export class SsField {
  @Element() el!: HTMLElement;

  /** Id of the container; also the seed for the generated control and message ids. */
  @Prop() xId?: string;
  /** Label text, used when no label slot content is provided. */
  @Prop() label?: string;
  /** Helper text, used when no helper slot content is provided. */
  @Prop() helperText?: string;
  /** Error text, used when no error slot content is provided; shown only while invalid. */
  @Prop() errorText?: string;
  /** Marks the field required: adds the label marker and sets the control's required state. */
  @Prop() required: boolean = false;
  /** Marks the field invalid: reveals the error message and sets the control's invalid state. */
  @Prop() invalid: boolean = false;
  /** Disables the field: attenuates the label and disables the control. */
  @Prop() disabled: boolean = false;
  /** Size of the label; helper and error text follow one step below it. */
  @Prop() size: Size = 'md';
  /** Places the label above the control, or beside it. */
  @Prop() orientation: FieldOrientation = 'vertical';
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  private fieldId!: string;
  /** State this field applied to the control, so it only clears its own. */
  private applied = { required: false, disabled: false, invalid: false };
  /** The control's own description, captured before the field adds to it. */
  private ownDescribedBy?: string;
  private wiredControl?: Element;
  private hasLabelSlot = false;
  private hasHelperSlot = false;
  private hasErrorSlot = false;

  componentWillLoad() {
    this.fieldId = resolveId(this.xId, 'ss-field');
  }

  componentWillRender() {
    // A change to slotted content alone does not re-render the field; a prop
    // change re-reads it.
    this.hasLabelSlot = this.hasSlotted('label');
    this.hasHelperSlot = this.hasSlotted('helper');
    this.hasErrorSlot = this.hasSlotted('error');
  }

  /**
   * Scoped rendering relocates slotted content into the rendered tree, so the
   * search covers the whole subtree rather than the direct children, and
   * `closest` keeps a nested field's content from being claimed as this one's.
   */
  private owns(el: Element | null | undefined): boolean {
    return !!el && el.closest('ss-field') === this.el;
  }

  private hasSlotted(name: string): boolean {
    return this.owns(this.el.querySelector(`[slot="${name}"]`));
  }

  componentDidLoad() {
    this.wireControl();
  }

  componentDidUpdate() {
    this.wireControl();
  }

  private get control(): HTMLElement | undefined {
    return Array.from(this.el.querySelectorAll<HTMLElement>(CONTROLS)).find(
      el =>
        !el.hasAttribute('slot') &&
        this.owns(el) &&
        // The native control an atom renders is that atom's business, not a
        // second candidate competing to be this field's control.
        !el.parentElement?.closest(CUSTOM_CONTROLS),
    );
  }

  private get showHelper() {
    return this.hasHelperSlot || !!this.helperText;
  }

  private get showError() {
    return this.invalid && (this.hasErrorSlot || !!this.errorText);
  }

  private get showLabel() {
    return this.hasLabelSlot || !!this.label;
  }

  private get labelId() {
    return `${this.fieldId}-label`;
  }

  private get helperId() {
    return `${this.fieldId}-helper`;
  }

  private get errorId() {
    return `${this.fieldId}-error`;
  }

  /**
   * The id the label points at. A custom element that renders its control into
   * a shadow root cannot be reached by `for`, so the host carries the id and
   * form association delegates the focus inward; every other control exposes a
   * native element in the light DOM, which takes the id directly.
   */
  private get controlId() {
    const control = this.control;
    if (!control) return `${this.fieldId}-control`;

    const explicit = control.id || control.getAttribute('x-id');
    return explicit || `${this.fieldId}-control`;
  }

  private wireControl() {
    const control = this.control;
    if (!control) return;

    if (control !== this.wiredControl) {
      // A replaced control brings its own description and its own state.
      this.ownDescribedBy = control.getAttribute('described-by') ?? control.getAttribute('aria-describedby') ?? undefined;
      this.applied = { required: false, disabled: false, invalid: false };
      this.wiredControl = control;
    }

    const isCustom = control.tagName.includes('-');
    const describedBy = composeDescribedBy(this.ownDescribedBy, this.showHelper && this.helperId, this.showError && this.errorId);

    if (isCustom) {
      // A shadow root hides the native control from `for`, so the host takes
      // the id and form association delegates the click inward; a scoped atom
      // renders its control into the light DOM, where `for` reaches it.
      if (control.shadowRoot) control.id = this.controlId;
      else this.setProp(control, 'xId', this.controlId);

      // `for` moves focus but does not name a control across a shadow boundary,
      // so a shadow-rendered control is named by element reference instead.
      // A light-DOM control ignores this: it is already named natively.
      this.setProp(control, 'labelledBy', this.showLabel ? this.labelId : undefined);
      this.setProp(control, 'describedBy', describedBy);
      this.coordinate(control, 'required', this.required);
      this.coordinate(control, 'disabled', this.disabled);
      this.coordinate(control, 'invalid', this.invalid);
      return;
    }

    control.id = this.controlId;
    this.setAttr(control, 'aria-describedby', describedBy);
    this.coordinateAttr(control, 'required', this.required, 'required');
    this.coordinateAttr(control, 'disabled', this.disabled, 'disabled');
    this.coordinateAttr(control, 'aria-invalid', this.invalid, 'invalid');
  }

  /** Assigns a prop only when the control declares it: a slider has no `required`. */
  private setProp(control: HTMLElement, prop: string, value: string | boolean | undefined) {
    if (!(prop in control)) return false;
    (control as unknown as Record<string, unknown>)[prop] = value;
    return true;
  }

  private setAttr(control: HTMLElement, attr: string, value?: string) {
    if (value) control.setAttribute(attr, value);
    else control.removeAttribute(attr);
  }

  /** Applies field state to the control, and clears only what it applied. */
  private coordinate(control: HTMLElement, prop: CoordinatedState, value: boolean) {
    if (value) {
      this.applied[prop] = this.setProp(control, prop, true);
    } else if (this.applied[prop]) {
      this.setProp(control, prop, false);
      this.applied[prop] = false;
    }
  }

  private coordinateAttr(control: HTMLElement, attr: string, value: boolean, state: CoordinatedState) {
    if (value) {
      control.setAttribute(attr, attr.startsWith('aria-') ? 'true' : '');
      this.applied[state] = true;
    } else if (this.applied[state]) {
      control.removeAttribute(attr);
      this.applied[state] = false;
    }
  }

  private getClasses() {
    const b = 'ss-field';
    return {
      [b]: true,
      [`${b}--${this.orientation}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--required`]: this.required,
      [`${b}--invalid`]: this.invalid,
      [`${b}--disabled`]: this.disabled,
    };
  }

  render() {
    const messageSize = MESSAGE_SIZE[this.size];

    return (
      <div class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        {this.showLabel && (
          <ss-label
            class="ss-field__label"
            xId={this.labelId}
            htmlFor={this.controlId}
            label={this.hasLabelSlot ? undefined : this.label}
            size={this.size}
            required={this.required}
            disabled={this.disabled}
          >
            {this.hasLabelSlot && <slot name="label" />}
          </ss-label>
        )}

        <div class="ss-field__control">
          <slot />
        </div>

        {this.showHelper && (
          <ss-typography class="ss-field__helper" xId={this.helperId} as="small" fontSize={messageSize} color="muted">
            {this.hasHelperSlot ? <slot name="helper" /> : this.helperText}
          </ss-typography>
        )}

        {this.showError && (
          <ss-typography class="ss-field__error" xId={this.errorId} as="small" fontSize={messageSize} color="error" role="alert">
            {this.hasErrorSlot ? <slot name="error" /> : this.errorText}
          </ss-typography>
        )}
      </div>
    );
  }
}
