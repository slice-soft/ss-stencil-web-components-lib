import { Component, Event, EventEmitter, h, Host, Prop, Watch } from '@stencil/core';
import type { Orientation } from '../../../utils/roving';

export type StepState = 'upcoming' | 'current' | 'complete';
export type StepStatus = 'complete' | 'error';

/**
 * One step of an `ss-stepper`: its marker, label and description, and the
 * line to the next step.
 *
 * It holds no content of its own: the stepper only says where the reader is,
 * and the page shows the current step's content. Its position, derived state
 * and whether it can be pressed are set by `ss-stepper`.
 *
 * @slot description - Secondary text under the label.
 * @slot icon - Replaces the number in the marker.
 */
@Component({
  tag: 'ss-step',
  styleUrl: 'ss-step.scss',
  shadow: true,
})
export class SsStep {
  /** Identifies the step; the stepper selects by it and reports it. Defaults to its position. */
  @Prop({ reflect: true }) value?: string;
  /** Text of the step. */
  @Prop() label?: string;
  /** Set by the page: `complete` marks it done wherever it is; `error` shows a problem. */
  @Prop() status?: StepStatus;
  /** The step cannot be pressed. */
  @Prop() disabled: boolean = false;

  /** Position from 0. Set by `ss-stepper`. @internal */
  @Prop() index: number = 0;
  /** State from its position. Set by `ss-stepper`. @internal */
  @Prop() derived: StepState = 'upcoming';
  /** Set by `ss-stepper`. @internal */
  @Prop() orientation: Orientation = 'horizontal';
  /** Whether steps are pressable. Set by `ss-stepper`. @internal */
  @Prop() interactive: boolean = false;
  /** No line after the last step. Set by `ss-stepper`. @internal */
  @Prop() last: boolean = false;
  /** Set by `ss-stepper`. @internal */
  @Prop() completeLabel: string = 'Completed';
  /** Set by `ss-stepper`. @internal */
  @Prop() errorLabel: string = 'Error';

  /** Asks the stepper to make this step current. Internal. */
  @Event({ eventName: 'ssStepSelect', bubbles: true, composed: true }) ssStepSelect: EventEmitter<{ index: number }>;
  /** Tells the stepper its value changed. Internal. */
  @Event({ eventName: 'ssStepUpdate', bubbles: true, composed: true }) ssStepUpdate: EventEmitter<void>;

  @Watch('value')
  handleValueChange() {
    this.ssStepUpdate.emit();
  }

  private get state(): StepState {
    if (this.derived === 'current') return 'current';
    return this.status === 'complete' ? 'complete' : this.derived;
  }

  private select = () => this.ssStepSelect.emit({ index: this.index });

  private renderMarker() {
    const error = this.status === 'error';
    let mark: unknown = String(this.index + 1);
    if (error) mark = '!';
    else if (this.state === 'complete')
      mark = (
        <svg class="ss-step__check" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12l5 5L20 7" />
        </svg>
      );
    return (
      <span class="ss-step__marker" aria-hidden="true">
        <slot name="icon">{mark}</slot>
      </span>
    );
  }

  render() {
    const state = this.state;
    const error = this.status === 'error';
    const pressable = this.interactive && state !== 'current' && !this.disabled;
    const b = 'ss-step';
    const inner = [
      this.renderMarker(),
      <span class="ss-step__text">
        <span class="ss-step__label">{this.label}</span>
        {state === 'complete' && !error && <span class="ss-step__status">{` ${this.completeLabel}`}</span>}
        {error && <span class="ss-step__status">{` ${this.errorLabel}`}</span>}
        <span class="ss-step__description">
          <slot name="description" />
        </span>
      </span>,
    ];

    return (
      <Host role="listitem" aria-current={this.derived === 'current' ? 'step' : null} data-last={this.last ? '' : null}>
        <div
          class={{
            [b]: true,
            [`${b}--${state}`]: true,
            [`${b}--error`]: error,
            [`${b}--disabled`]: this.disabled,
            [`${b}--${this.orientation}`]: true,
            [`${b}--last`]: this.last,
          }}
        >
          {pressable ? (
            <button class="ss-step__trigger" type="button" onClick={this.select}>
              {inner}
            </button>
          ) : (
            <span class="ss-step__trigger">{inner}</span>
          )}
          {!this.last && <span class="ss-step__connector" aria-hidden="true" />}
        </div>
      </Host>
    );
  }
}
