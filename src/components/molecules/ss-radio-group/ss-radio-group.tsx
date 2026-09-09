import { Component, Element, Event, EventEmitter, h, Listen, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { SsCheckedChangeEvent } from '../../../types/control-events';
import { composeDescribedBy } from '../../../utils/a11y';
import { resolveId } from '../../../utils/id';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

/** Emitted when the selection changes; a selection always has a value. */
export interface SsRadioGroupChangeEvent {
  xId?: string;
  name: string;
  value: string;
}

/**
 * Emitted when the group fails validation. `value` is optional here and absent
 * for the case that actually triggers it — a required group with nothing
 * selected. A change event always carries a value; an invalid one cannot
 * promise the same, and inventing a sentinel would hide the difference.
 */
export interface SsRadioGroupInvalidEvent {
  xId?: string;
  name: string;
  value?: string;
}

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
 * Presents N `ss-radio` children as one selected value, one change event and
 * one set of group semantics, replacing the shared `name` a consumer would
 * otherwise repeat on every radio without ever gaining a group role, a group
 * label or an aggregate value.
 *
 * The radios keep their own native input, styling and focus behaviour: arrow-key
 * navigation comes from the browser, because same-name radios in one tree
 * already do it. The group adds the name, the selected value, the accessible
 * grouping and the messages.
 *
 * @slot - The `ss-radio` children. Other elements are rendered but not coordinated.
 * @slot label - Rich group label; overrides the `label` prop.
 * @slot helper - Rich helper content; overrides the `helperText` prop.
 * @slot error - Rich error content; overrides the `errorText` prop. Shown only while invalid.
 */
@Component({
  tag: 'ss-radio-group',
  styleUrl: 'ss-radio-group.scss',
  scoped: true,
})
export class SsRadioGroup {
  @Element() el!: HTMLElement;

  /** Id of the container; also the seed for the generated message ids. */
  @Prop() xId?: string;
  /**
   * Native name shared by every radio in the group — the thing that makes the
   * browser treat them as one group. Left unset, the group generates one, so a
   * group always works; a name is only needed to submit under a chosen key.
   *
   * It stays optional because a mandatory prop would make every custom element
   * require it wherever a dynamic tag resolves against the generated JSX types.
   */
  @Prop() name?: string;
  /** Value of the selected radio; updated on user interaction and reflected as an attribute. */
  @Prop({ mutable: true, reflect: true }) value?: string;
  /** Group label, used when no label slot content is provided. */
  @Prop() label?: string;
  /** Helper text, used when no helper slot content is provided. */
  @Prop() helperText?: string;
  /** Error text, used when no error slot content is provided; shown only while invalid. */
  @Prop() errorText?: string;
  /** Requires a selection: marks the group required for native validation. */
  @Prop() required: boolean = false;
  /** Marks the group invalid: reveals the error message and sets aria-invalid. */
  @Prop() invalid: boolean = false;
  /** Disables every radio in the group. */
  @Prop() disabled: boolean = false;
  /** Stacks the choices, or lays them out in a row. */
  @Prop() orientation: RadioGroupOrientation = 'vertical';
  /** Size shared by every radio, and by the group label. */
  @Prop() size: Size = 'md';
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the selected value changes; detail contains xId, name and value. */
  @Event() ssChange: EventEmitter<SsRadioGroupChangeEvent>;
  /** Emitted when the group fails native validation; detail may carry no value. */
  @Event() ssInvalid: EventEmitter<SsRadioGroupInvalidEvent>;

  private groupId!: string;
  private hasLabelSlot = false;
  private hasHelperSlot = false;
  private hasErrorSlot = false;

  componentWillLoad() {
    this.groupId = resolveId(this.xId, 'ss-radio-group');
  }

  componentWillRender() {
    this.hasLabelSlot = this.hasSlotted('label');
    this.hasHelperSlot = this.hasSlotted('helper');
    this.hasErrorSlot = this.hasSlotted('error');
  }

  componentDidLoad() {
    this.syncRadios();
  }

  componentDidUpdate() {
    this.syncRadios();
  }

  /**
   * A child radio reports an individual checked transition; the group reports a
   * selected value. Those are different concepts, so the child event is stopped
   * at this boundary and replaced, rather than letting one interaction be
   * observed twice with two different payload shapes.
   *
   * Stopping it immediately rather than merely stopping propagation is what
   * makes that true for a listener bound to the group itself — the most common
   * place to listen — since plain `stopPropagation` still runs the other
   * listeners on this same element. A listener bound directly to the radio is
   * below this boundary and still receives the radio's own event.
   */
  @Listen('ssChange')
  handleRadioChange(event: CustomEvent<SsCheckedChangeEvent>) {
    if (!this.ownsRadio(event.target)) return;

    event.stopImmediatePropagation();
    if (!event.detail.checked) return;

    this.value = event.detail.value;
    this.ssChange.emit({ xId: this.xId, name: this.groupName, value: this.value });
  }

  @Listen('ssInvalid')
  handleRadioInvalid(event: CustomEvent<SsCheckedChangeEvent>) {
    if (!this.ownsRadio(event.target)) return;

    event.stopImmediatePropagation();
    this.ssInvalid.emit({ xId: this.xId, name: this.groupName, value: this.value });
  }

  /**
   * True only for a radio this group coordinates. It also excludes the group's
   * own emitted event, whose target is this host rather than a radio.
   */
  private ownsRadio(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    return !!el && el.tagName?.toLowerCase() === 'ss-radio' && el.closest('ss-radio-group') === this.el;
  }

  /** Scoped rendering relocates slotted content, so the search covers the subtree. */
  private hasSlotted(name: string): boolean {
    const el = this.el.querySelector(`[slot="${name}"]`);
    return !!el && el.closest('ss-radio-group') === this.el;
  }

  /** The name actually applied; generated when the consumer supplied none. */
  private get groupName(): string {
    return this.name || this.groupId;
  }

  private get radios(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>('ss-radio')).filter(radio => radio.closest('ss-radio-group') === this.el);
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
    return `${this.groupId}-label`;
  }

  private get helperId() {
    return `${this.groupId}-helper`;
  }

  private get errorId() {
    return `${this.groupId}-error`;
  }

  private syncRadios() {
    const radios = this.radios;

    radios.forEach((radio, index) => {
      const props = radio as unknown as Record<string, unknown>;
      props.name = this.groupName;
      props.size = this.size;
      props.disabled = this.disabled;
      props.checked = this.value !== undefined && props.value === this.value;
      // One required radio makes the whole native group required, so the browser
      // asks for a selection rather than for this particular choice.
      props.required = this.required && index === 0;
    });
  }

  private getClasses() {
    const b = 'ss-radio-group';
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
    const describedBy = composeDescribedBy(this.showHelper && this.helperId, this.showError && this.errorId);

    return (
      <div
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        role="radiogroup"
        aria-labelledby={this.showLabel ? this.labelId : undefined}
        aria-describedby={describedBy}
        aria-required={this.required ? 'true' : undefined}
        aria-invalid={this.invalid ? 'true' : undefined}
      >
        {this.showLabel && (
          <ss-typography class="ss-radio-group__label" xId={this.labelId} as="span" fontSize={this.size}>
            {this.hasLabelSlot ? <slot name="label" /> : this.label}
          </ss-typography>
        )}

        <div class="ss-radio-group__choices">
          <slot />
        </div>

        {this.showHelper && (
          <ss-typography class="ss-radio-group__helper" xId={this.helperId} as="small" fontSize={messageSize} color="muted">
            {this.hasHelperSlot ? <slot name="helper" /> : this.helperText}
          </ss-typography>
        )}

        {this.showError && (
          <ss-typography class="ss-radio-group__error" xId={this.errorId} as="small" fontSize={messageSize} color="error" role="alert">
            {this.hasErrorSlot ? <slot name="error" /> : this.errorText}
          </ss-typography>
        )}
      </div>
    );
  }
}
