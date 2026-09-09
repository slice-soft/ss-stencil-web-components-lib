import { Component, Element, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { Size } from '../../../types/size';
import { slotHasContent } from '../../../utils/slot';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

/** Emitted when the alert is dismissed. */
export interface SsAlertDismissEvent {
  xId?: string;
}

/**
 * Assistive technology interrupts the user for a problem and waits for a pause
 * to mention anything else, so severity decides the role rather than a prop:
 * `alert` is assertive, `status` is polite.
 */
const ROLE: Record<AlertVariant, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
};

/** The title reads one step above the message it introduces. */
const TITLE_SIZE: Record<Size, Size> = {
  'xs': 'sm',
  'sm': 'md',
  'md': 'lg',
  'lg': 'xl',
  'xl': '2xl',
  '2xl': '3xl',
  '3xl': '3xl',
};

/**
 * A message block that states what happened and, when it matters, interrupts to
 * say so.
 *
 * The alert supplies the severity, the layout and the announcement; the caller
 * supplies the words, and any icon or actions, through slots. There is no
 * built-in icon set, following `ss-icon`, which is also a slot.
 *
 * @slot - The message.
 * @slot title - Rich title content; overrides the `heading` prop.
 * @slot icon - A leading icon, typically an `ss-icon`. Decorative: the message carries the meaning.
 * @slot actions - Buttons or links that resolve the alert.
 */
@Component({
  tag: 'ss-alert',
  styleUrl: 'ss-alert.scss',
  shadow: true,
})
export class SsAlert {
  @Element() el!: HTMLElement;

  /** Id applied to the rendered container. */
  @Prop() xId?: string;
  /** Severity, which sets both the colour and how insistently it is announced. */
  @Prop() variant: AlertVariant = 'info';
  /**
   * Title text, used when no title slot content is provided. Named `heading`
   * because `title` is a global attribute and would render a browser tooltip.
   */
  @Prop() heading?: string;
  /** Renders a dismiss button. */
  @Prop() dismissible: boolean = false;
  /** Accessible label for the dismiss button. */
  @Prop() dismissLabel: string = 'Dismiss';
  /** Size of the alert. */
  @Prop() size: Size = 'md';
  /** Expands the alert to the full width of its container. */
  @Prop() fullWidth: boolean = false;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the dismiss button is pressed; detail contains xId. */
  @Event() ssDismiss: EventEmitter<SsAlertDismissEvent>;

  /** Which optional regions currently hold content, tracked through slotchange. */
  @State() filled: Record<string, boolean> = { icon: false, actions: false };

  private trackSlot(name: string) {
    return (event: Event) => {
      const has = slotHasContent(event);
      if (this.filled[name] !== has) this.filled = { ...this.filled, [name]: has };
    };
  }

  private handleDismiss = () => {
    this.ssDismiss.emit({ xId: this.xId });
  };

  private hasSlotted(name: string): boolean {
    return !!this.el.querySelector(`[slot="${name}"]`);
  }

  private getClasses() {
    const b = 'ss-alert';
    return {
      [b]: true,
      [`${b}--${this.variant}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--dismissible`]: this.dismissible,
      [`${b}--has-icon`]: this.filled.icon,
      [`${b}--has-actions`]: this.filled.actions,
    };
  }

  render() {
    const hasTitle = this.hasSlotted('title') || !!this.heading;

    return (
      <div id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)} role={ROLE[this.variant]}>
        <span class="ss-alert__icon" aria-hidden="true">
          <slot name="icon" onSlotchange={this.trackSlot('icon')} />
        </span>

        <div class="ss-alert__body">
          {hasTitle && (
            <ss-typography class="ss-alert__title" as="strong" fontSize={TITLE_SIZE[this.size]} color="inherit">
              {this.hasSlotted('title') ? <slot name="title" /> : this.heading}
            </ss-typography>
          )}

          <ss-typography class="ss-alert__message" as="span" fontSize={this.size} color="inherit">
            <slot />
          </ss-typography>

          <div class="ss-alert__actions">
            <slot name="actions" onSlotchange={this.trackSlot('actions')} />
          </div>
        </div>

        {this.dismissible && (
          <button class="ss-alert__dismiss" type="button" aria-label={this.dismissLabel} onClick={this.handleDismiss}>
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>
    );
  }
}
