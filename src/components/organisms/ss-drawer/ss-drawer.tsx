import { Component, Element, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';
import { Size } from '../../../types/size';
import { onDismiss } from '../../../utils/dismiss';
import { deepestActive, getTabbable, trapFocus } from '../../../utils/focus';
import { nextId } from '../../../utils/id';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';
export type SsDrawerOpenChangeEvent = { xId?: string; open: boolean };

/**
 * A panel that enters from an edge of the viewport.
 *
 * Modal by default, like `ss-modal`: focus is trapped, the page behind is
 * covered and stops scrolling. With `modal="false"` it is a side panel that
 * leaves the page usable: no backdrop, no trap, and Escape closes it only when
 * pressed inside it.
 *
 * Rendered scoped rather than shadow, for the reason `ss-modal` is: the focus
 * trap has to see the caller's controls.
 *
 * @slot - The panel's content.
 * @slot header - Rich header content; overrides the `heading` prop.
 * @slot footer - Actions.
 */
@Component({
  tag: 'ss-drawer',
  styleUrl: 'ss-drawer.scss',
  scoped: true,
})
export class SsDrawer {
  @Element() el!: HTMLElement;

  private panelEl?: HTMLElement;
  private drawerId = nextId('ss-drawer');
  private active = false;
  private releaseFocus?: () => void;
  private releaseDismiss?: () => void;
  private previousBodyOverflow?: string;
  private previousFocus?: HTMLElement | null;

  /** Id applied to the panel element. */
  @Prop() xId?: string;
  /** Whether the drawer is showing. Updated when it is dismissed, and reflected. */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  /** The edge it enters from. `start` and `end` follow the writing direction. */
  @Prop() placement: DrawerPlacement = 'end';
  /** Width (start, end) or height (top, bottom) of the panel. */
  @Prop() size: Size = 'md';
  /** Takes over the page (backdrop, focus trap). `false` leaves the page usable. */
  @Prop() modal: boolean = true;
  /** Heading text. */
  @Prop() heading?: string;
  /** Accessible name, for a drawer with no visible heading. */
  @Prop() accessibilityLabel?: string;
  /** Shows a close button in the header. */
  @Prop() dismissible: boolean = true;
  /** Accessible name of the close button. Translate it. */
  @Prop() dismissLabel: string = 'Close';
  /** Escape closes the drawer (non-modal: only when pressed inside it). */
  @Prop() closeOnEscape: boolean = true;
  /** Pressing the backdrop closes a modal drawer. */
  @Prop() closeOnBackdrop: boolean = true;
  /** Inline CSS styles applied to the panel element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the drawer opens or closes through an interaction; detail contains xId and open. */
  @Event() ssOpenChange: EventEmitter<SsDrawerOpenChangeEvent>;

  componentDidLoad() {
    if (this.open) this.activate();
  }

  /** Activates after the render that shows the panel, as `ss-modal` does. */
  componentDidUpdate() {
    if (this.open) this.activate();
  }

  disconnectedCallback() {
    this.deactivate();
  }

  @Watch('open')
  handleOpenChange(open: boolean) {
    if (!open) this.deactivate();
  }

  @Watch('modal')
  handleModalChange() {
    // A different kind of layer: let the next render set it up again.
    this.deactivate();
  }

  private get headerId() {
    return `${this.drawerId}-header`;
  }

  private get hasHeaderSlot() {
    return !!this.el.querySelector('[slot="header"]');
  }

  private get hasHeading() {
    return this.hasHeaderSlot || !!this.heading;
  }

  private activate() {
    if (!this.panelEl || this.active) return;
    this.active = true;

    if (this.modal) {
      this.releaseFocus = trapFocus(this.panelEl);
      this.releaseDismiss = onDismiss(this.panelEl, {
        escape: this.closeOnEscape,
        outside: this.closeOnBackdrop,
        onDismiss: () => this.close(),
      });
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return;
    }

    // Non-modal: focus goes in, but nothing holds it there, and a press on the
    // page is neither a dismissal nor swallowed.
    this.previousFocus = deepestActive();
    if (!this.el.contains(document.activeElement)) {
      const [first] = getTabbable(this.panelEl);
      (first ?? this.panelEl).focus();
    }
    // Always scoped to focus, even when Escape must not close it: a panel that
    // refused Escape outright would block the layers beneath it.
    this.releaseDismiss = onDismiss(this.panelEl, {
      escape: 'focus-within',
      outside: 'ignore',
      onDismiss: () => {
        if (this.closeOnEscape) this.close();
      },
    });
  }

  private deactivate() {
    if (!this.active) return;
    this.active = false;

    this.releaseFocus?.();
    this.releaseDismiss?.();
    this.releaseFocus = undefined;
    this.releaseDismiss = undefined;

    if (this.previousBodyOverflow !== undefined) {
      document.body.style.overflow = this.previousBodyOverflow;
      this.previousBodyOverflow = undefined;
    }

    // Closing from the page must not pull focus back: only hand it back when
    // it was inside the panel, where it would otherwise be lost.
    if (this.previousFocus && this.el.contains(document.activeElement)) this.previousFocus.focus?.();
    this.previousFocus = undefined;
  }

  private close = () => {
    if (!this.open) return;
    this.open = false;
    this.ssOpenChange.emit({ xId: this.xId, open: false });
  };

  private getClasses() {
    const b = 'ss-drawer';
    return {
      [b]: true,
      [`${b}--${this.placement}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--modal`]: this.modal,
      [`${b}--open`]: this.open,
    };
  }

  render() {
    return (
      <div class={this.getClasses()} hidden={!this.open}>
        {this.modal && <div class="ss-drawer__backdrop" />}

        <div
          id={this.xId}
          class="ss-drawer__panel"
          style={resolveInlineStyles(this.inlineStyles)}
          ref={el => (this.panelEl = el)}
          role="dialog"
          aria-modal={this.modal ? 'true' : undefined}
          aria-labelledby={this.hasHeading ? this.headerId : undefined}
          aria-label={this.hasHeading ? undefined : this.accessibilityLabel}
          tabindex={-1}
        >
          <div class="ss-drawer__header">
            <ss-typography xId={this.headerId} class="ss-drawer__heading" as="strong" fontSize="lg">
              {this.hasHeaderSlot ? <slot name="header" /> : this.heading}
            </ss-typography>

            {this.dismissible && (
              <button class="ss-drawer__dismiss" type="button" aria-label={this.dismissLabel} onClick={this.close}>
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </div>

          <div class="ss-drawer__body">
            <slot />
          </div>

          <div class="ss-drawer__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    );
  }
}
