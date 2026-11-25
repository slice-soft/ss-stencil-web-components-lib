import { Component, Element, h, Host, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { applyLabelledBy } from '../../../utils/a11y';
import { normalize } from '../../../utils/range';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type ProgressShape = 'bar' | 'circle';

/**
 * How far along something is: a bar or a circle, with a value, or
 * indeterminate when the value is not known.
 *
 * It only shows. Whoever hosts it owns the number and when it changes.
 */
@Component({
  tag: 'ss-progress',
  styleUrl: 'ss-progress.scss',
  shadow: true,
})
export class SsProgress {
  @Element() el!: HTMLElement;

  private barEl?: HTMLElement;

  /** Id applied to the progressbar element. */
  @Prop() xId?: string;
  /** Current value, from 0 to `max`. Absent: indeterminate. */
  @Prop() value?: number;
  /** The value that means done. Non-positive values fall back to 100. */
  @Prop() max: number = 100;
  /** A horizontal bar or a circle. */
  @Prop() shape: ProgressShape = 'bar';
  /** Thickness of the bar, or diameter of the circle. */
  @Prop() size: Size = 'md';
  /** Color of the fill. */
  @Prop() color: Variant | 'foreground' | 'muted' = 'primary';
  /** Accessible name. Translate it. */
  @Prop() label: string = 'Progress';
  /** Id of an element in the page that names it; wins over `label`. */
  @Prop() labelledBy?: string;
  /** Read instead of the percentage, such as "3 of 10 files". */
  @Prop() valueText?: string;
  /** Draws the rounded percentage (or `value-text`) next to the bar, or inside the circle. */
  @Prop() showValue: boolean = false;
  /** Inline CSS styles applied to the root element. */
  @Prop() inlineStyles?: InlineStyles;

  componentDidRender() {
    applyLabelledBy(this.el, this.barEl, this.labelledBy);
  }

  private renderBar() {
    return (
      <span class="ss-progress__track">
        <span class="ss-progress__fill" />
      </span>
    );
  }

  private renderCircle() {
    return (
      <svg class="ss-progress__circle" aria-hidden="true">
        <circle class="ss-progress__ring" cx="50%" cy="50%" pathLength={100} />
        <circle class="ss-progress__arc" cx="50%" cy="50%" pathLength={100} />
      </svg>
    );
  }

  render() {
    const { max, value } = normalize(this.value, this.max);
    const determinate = value !== undefined;
    const percent = determinate ? (value / max) * 100 : 0;
    const b = 'ss-progress';

    return (
      <Host class={{ [`${b}-host--${this.shape}`]: true }}>
        <span
          id={this.xId}
          ref={el => (this.barEl = el)}
          class={{
            [b]: true,
            [`${b}--${this.shape}`]: true,
            [`${b}--${this.size}`]: true,
            [`${b}--${this.color}`]: true,
            [`${b}--indeterminate`]: !determinate,
          }}
          style={{ ...resolveInlineStyles(this.inlineStyles), '--_percent': String(percent) }}
          role="progressbar"
          aria-label={this.label}
          aria-valuemin="0"
          aria-valuemax={String(max)}
          aria-valuenow={determinate ? String(value) : undefined}
          aria-valuetext={this.valueText}
        >
          {this.shape === 'circle' ? this.renderCircle() : this.renderBar()}
          {this.showValue && determinate && (
            <span class="ss-progress__value" aria-hidden="true">
              {this.valueText ?? `${Math.round(percent)}%`}
            </span>
          )}
        </span>
      </Host>
    );
  }
}
