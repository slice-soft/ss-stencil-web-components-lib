import { Component, Element, Event, EventEmitter, h, Listen, Prop, State, Watch } from '@stencil/core';
import type { Orientation } from '../../../utils/roving';
import { onResize } from '../../../utils/position';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export interface SsStepChangeEvent {
  xId?: string;
  value: string;
  previous?: string;
}

type Step = HTMLElement & {
  value?: string;
  index: number;
  derived: 'upcoming' | 'current' | 'complete';
  orientation: Orientation;
  interactive: boolean;
  last: boolean;
  completeLabel: string;
  errorLabel: string;
};

/**
 * Where the reader is in a sequence of steps.
 *
 * It only shows: the page decides which step is current, which are done or
 * in error, and whether a step may be entered. Interactive, it reports a press
 * with a cancelable `ssStepChange`; the page that must check first prevents it
 * and sets `value` itself when ready.
 *
 * A horizontal stepper narrower than `--ss-stepper-compact-max-width` shows
 * only the current step and "Step 2 of 5". The width is measured, since a
 * container query cannot read a custom property: an invisible probe as wide
 * as the token is observed with the host, so the threshold is right even when
 * the tokens arrive after the stepper renders.
 *
 * @slot - `ss-step` elements.
 */
@Component({
  tag: 'ss-stepper',
  styleUrl: 'ss-stepper.scss',
  shadow: true,
})
export class SsStepper {
  @Element() el!: HTMLElement;

  private releaseResize?: () => void;
  private probeEl?: HTMLElement;
  private rootEl?: HTMLElement;

  /** Id applied to the list. */
  @Prop() xId?: string;
  /** The current step's value. Absent: the first step. */
  @Prop({ mutable: true, reflect: true }) value?: string;
  /** Lays the steps out in a row or a column. */
  @Prop() orientation: Orientation = 'horizontal';
  /** Steps are buttons that ask to become current. Off: a read-only indicator. */
  @Prop() interactive: boolean = false;
  /** Accessible name of the list. Translate it. */
  @Prop() accessibilityLabel: string = 'Steps';
  /** Read after a completed step's label. Translate it. */
  @Prop() completeLabel: string = 'Completed';
  /** Read after the label of a step in error. Translate it. */
  @Prop() errorLabel: string = 'Error';
  /** The compact form's text; `{current}` and `{total}` are filled in. */
  @Prop() summaryLabel: string = 'Step {current} of {total}';
  /** Inline CSS styles applied to the root element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when a step is pressed (interactive only). Cancelable: prevent it to keep the current step. */
  @Event({ cancelable: true }) ssStepChange: EventEmitter<SsStepChangeEvent>;

  @State() private total = 0;
  @State() private current = 0;
  @State() private compact = false;

  componentWillLoad() {
    this.sync();
  }

  componentDidLoad() {
    this.releaseResize = onResize([this.rootEl, this.probeEl], this.measure);
    this.measure();
  }

  disconnectedCallback() {
    this.releaseResize?.();
  }

  @Watch('value')
  @Watch('orientation')
  @Watch('interactive')
  @Watch('completeLabel')
  @Watch('errorLabel')
  handleChange() {
    this.sync();
    this.measure();
  }

  @Listen('ssStepUpdate')
  handleStepUpdate(event: Event) {
    if (!this.owns(event)) return;
    event.stopPropagation();
    this.sync();
  }

  @Listen('ssStepSelect')
  handleStepSelect(event: CustomEvent<{ index: number }>) {
    if (!this.owns(event)) return;
    event.stopPropagation();
    const step = this.steps[event.detail.index];
    if (!step) return;
    const value = this.stepValue(step, event.detail.index);
    const previous = this.value;
    const emitted = this.ssStepChange.emit({ xId: this.xId, value, previous });
    if (!emitted.defaultPrevented) this.value = value;
  }

  /** The compact form's text. */
  get summary(): string {
    return this.summaryLabel.replace('{current}', String(this.current + 1)).replace('{total}', String(this.total));
  }

  private owns(event: Event) {
    return (event.target as HTMLElement).closest('ss-stepper') === this.el;
  }

  private get steps(): Step[] {
    return Array.from(this.el.children).filter((child): child is Step => child.tagName === 'SS-STEP');
  }

  private stepValue(step: Step, index: number) {
    return step.value ?? String(index);
  }

  /** Tells each step where it stands. */
  private sync = () => {
    const steps = this.steps;
    const found = steps.findIndex((step, index) => this.stepValue(step, index) === this.value);
    const current = found === -1 ? 0 : found;

    steps.forEach((step, index) => {
      step.index = index;
      step.derived = index < current ? 'complete' : index === current ? 'current' : 'upcoming';
      step.orientation = this.orientation;
      step.interactive = this.interactive;
      step.last = index === steps.length - 1;
      step.completeLabel = this.completeLabel;
      step.errorLabel = this.errorLabel;
      if (index === current) step.setAttribute('data-current', '');
      else step.removeAttribute('data-current');
      // Hidden by the step's own stylesheet, with !important: the document's
      // `:defined { display: revert }` outranks a ::slotted rule from here.
      if (this.compact && index !== current) step.setAttribute('data-collapsed', '');
      else step.removeAttribute('data-collapsed');
    });

    this.total = steps.length;
    this.current = current;
  };

  private measure = () => {
    if (this.orientation !== 'horizontal') {
      if (this.compact) {
        this.compact = false;
        this.sync();
      }
      return;
    }
    const limit = this.probeEl?.getBoundingClientRect().width ?? 0;
    // The inner box, not the host: the document's `:defined { display: revert }`
    // makes the host inline, and a ResizeObserver never reports an inline box.
    const width = this.rootEl?.getBoundingClientRect().width ?? 0;
    const compact = limit > 0 && width > 0 && width <= limit;
    if (compact === this.compact) return;
    this.compact = compact;
    this.sync();
  };

  private handleSlotChange = () => {
    this.sync();
  };

  render() {
    const b = 'ss-stepper';
    return (
      <div
        class={{ [b]: true, [`${b}--${this.orientation}`]: true, [`${b}--compact`]: this.compact }}
        style={resolveInlineStyles(this.inlineStyles)}
        ref={el => (this.rootEl = el)}
      >
        <span class="ss-stepper__probe" aria-hidden="true" ref={el => (this.probeEl = el)} />
        {this.compact && <p class="ss-stepper__summary">{this.summary}</p>}
        <ol id={this.xId} class="ss-stepper__list" role="list" aria-label={this.accessibilityLabel}>
          <slot onSlotchange={this.handleSlotChange} />
        </ol>
      </div>
    );
  }
}
