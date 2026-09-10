import { Component, Element, Event, EventEmitter, h, Host, Listen, Prop, Watch } from '@stencil/core';
import type { AlertVariant } from '../../molecules/ss-alert/ss-alert';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

/** Why a toast closed: its time ran out, or the reader dismissed it. */
export type ToastCloseReason = 'timeout' | 'dismiss';

export type SsToastOpenChangeEvent = { xId?: string; open: boolean; reason: ToastCloseReason };

/** What can hold the clock. Any one of them is enough. */
type PauseReason = 'hover' | 'focus' | 'hidden';

/**
 * A short message that appears, says what happened, and goes away on its own.
 *
 * The message is an `ss-alert`, so it brings the alert's severity, layout and
 * live-region role: a screen reader announces info and success politely and
 * interrupts for warning and error. What the toast adds is time. It closes
 * itself after `duration`, and the clock stops while the reader is hovering
 * over it, has focus inside it, or cannot see the page at all — a message that
 * disappears while someone is reading it, or while they are in another tab, was
 * never delivered (WCAG 2.2.1, Timing Adjustable).
 *
 * Put toasts inside an `ss-toaster`, which pins them to a corner and stacks
 * them. A closed toast stays in the DOM and takes no room; remove it on
 * `ssOpenChange` when toasts are rendered from a list.
 *
 * Scoped so the caller's content reaches the alert's own slots: it is moved
 * into the `ss-alert` element, where the alert slots it natively.
 *
 * @slot - The message.
 * @slot title - Rich title content; overrides the `heading` prop.
 * @slot icon - A leading icon, typically an `ss-icon`. Decorative.
 * @slot actions - Buttons or links that act on the message, such as Undo.
 */
@Component({
  tag: 'ss-toast',
  styleUrl: 'ss-toast.scss',
  scoped: true,
})
export class SsToast {
  @Element() el!: HTMLElement;

  private timer?: ReturnType<typeof setTimeout>;
  private remaining = 0;
  private startedAt = 0;
  private paused = new Set<PauseReason>();

  /** Id applied to the toast's container. */
  @Prop() xId?: string;
  /** Whether the toast is showing. Set to show it; updated when it closes, and reflected. */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  /** Severity, which sets the colour and how insistently the message is announced. */
  @Prop() variant: AlertVariant = 'info';
  /** Title text, used when no title slot content is provided. */
  @Prop() heading?: string;
  /** Milliseconds before the toast closes itself. 0 keeps it until dismissed — use that for anything the reader must act on. */
  @Prop() duration: number = 5000;
  /** Renders a dismiss button. */
  @Prop() dismissible: boolean = true;
  /** Accessible label for the dismiss button. */
  @Prop() dismissLabel: string = 'Dismiss';
  /** Inline CSS styles applied to the toast's container. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the toast closes itself or is dismissed; detail contains xId, open and the reason. */
  @Event() ssOpenChange: EventEmitter<SsToastOpenChangeEvent>;

  componentDidLoad() {
    this.restart();
  }

  disconnectedCallback() {
    this.stop();
  }

  @Watch('open')
  @Watch('duration')
  handleTimingChange() {
    this.restart();
  }

  /** A page the reader cannot see is a page they are not reading. */
  @Listen('visibilitychange', { target: 'document' })
  handleVisibilityChange() {
    this.setPaused('hidden', document.visibilityState === 'hidden');
  }

  /**
   * Starts the full duration again. Hover and focus are forgotten: a toast
   * closed while the pointer was over it may never hear the pointer leave,
   * since a hidden element fires no mouseleave, and would otherwise reopen
   * with its clock stuck.
   */
  private restart() {
    this.stop();
    this.paused.delete('hover');
    this.paused.delete('focus');
    this.remaining = this.duration;
    this.resume();
  }

  private stop() {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  private resume() {
    if (!this.open || !(this.duration > 0) || this.paused.size || this.timer !== undefined) return;

    this.startedAt = Date.now();
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.close('timeout');
    }, this.remaining);
  }

  /** Holds or releases the clock. It resumes with the time that was left, not the full duration. */
  private setPaused(reason: PauseReason, paused: boolean) {
    if (!paused) {
      this.paused.delete(reason);
      this.resume();
      return;
    }

    if (this.timer !== undefined) this.remaining -= Date.now() - this.startedAt;
    this.stop();
    this.paused.add(reason);
  }

  private close(reason: ToastCloseReason) {
    if (!this.open) return;
    this.open = false;
    this.ssOpenChange.emit({ xId: this.xId, open: false, reason });
  }

  /**
   * The alert's own dismiss event stops here. The toast reports the close
   * itself, with the reason, so a listener hears one event rather than two
   * that mean the same thing.
   */
  private handleDismiss = (event: Event) => {
    event.stopPropagation();
    this.close('dismiss');
  };

  private handleFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.el.contains(next)) this.setPaused('focus', false);
  };

  render() {
    return (
      <Host>
        <div
          id={this.xId}
          class={{ 'ss-toast': true, [`ss-toast--${this.variant}`]: true }}
          style={resolveInlineStyles(this.inlineStyles)}
          onMouseEnter={() => this.setPaused('hover', true)}
          onMouseLeave={() => this.setPaused('hover', false)}
          onFocusin={() => this.setPaused('focus', true)}
          onFocusout={this.handleFocusOut}
        >
          <ss-alert
            class="ss-toast__alert"
            variant={this.variant}
            heading={this.heading}
            dismissible={this.dismissible}
            dismissLabel={this.dismissLabel}
            fullWidth
            onSsDismiss={this.handleDismiss}
          >
            <slot name="icon" />
            <slot name="title" />
            <slot />
            <slot name="actions" />
          </ss-alert>
        </div>
      </Host>
    );
  }
}
