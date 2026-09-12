import { Component, Element, Event, EventEmitter, h, Listen, Prop, State, Watch } from '@stencil/core';
import { onDismiss } from '../../../utils/dismiss';
import { focusInto, getTabbable } from '../../../utils/focus';
import { nextId } from '../../../utils/id';
import { markTrigger, slottedIn } from '../../../utils/popup';
import { Align, anchorTo, onResize, Placement } from '../../../utils/position';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type SsPopoverOpenChangeEvent = { xId?: string; open: boolean };

/** Gap from the trigger, and the least space to leave against a viewport edge. */
const OFFSET = 8;
const EDGE_PADDING = 8;

/**
 * Content anchored to a trigger, which the reader opens, uses and puts away
 * without losing the page.
 *
 * Where `ss-modal` takes the page over, a popover sits beside it: no backdrop
 * and no focus trap. Focus goes into the panel when it opens, because that is
 * where the reader asked to go. Closing it with Escape sends focus back to the
 * trigger; closing it by pressing or tabbing somewhere else leaves focus where
 * the reader put it.
 *
 * Rendered scoped for the same reason as the modal: finding the first control
 * to focus, and telling whether focus has left, both need to see the caller's
 * content, which a shadow root would hide.
 *
 * @slot trigger - The control that opens the popover, usually an `ss-button`.
 * @slot - The popover's content.
 */
@Component({
  tag: 'ss-popover',
  styleUrl: 'ss-popover.scss',
  scoped: true,
})
export class SsPopover {
  @Element() el!: HTMLElement;

  private popoverId = nextId('ss-popover');
  private triggerEl?: HTMLElement;
  private panelEl?: HTMLElement;
  private releaseDismiss?: () => void;
  private releaseResize?: () => void;

  /** The side the panel ended up on. See `ss-tooltip` for why this is a field plus a counter. */
  private resolvedPlacement?: Placement;
  @State() placementVersion = 0;

  /** Id applied to the panel. */
  @Prop() xId?: string;
  /** Whether the panel is showing. Updated on interaction, and reflected. */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  /** Heading shown at the top of the panel, which also names it. */
  @Prop() heading?: string;
  /** Accessible name, for a panel with no visible heading. */
  @Prop() accessibilityLabel?: string;
  /** Side of the trigger to open on: top, right, bottom or left. Moves to the opposite side when there is no room. */
  @Prop() placement: Placement = 'bottom';
  /** Alignment along the trigger's edge: start, center or end. */
  @Prop() align: Align = 'center';
  /** Escape closes the panel. */
  @Prop() closeOnEscape: boolean = true;
  /** Pressing outside the popover closes the panel. */
  @Prop() closeOnOutside: boolean = true;
  /** Disables the popover; it stays closed and the trigger does nothing. */
  @Prop() disabled: boolean = false;
  /** Inline CSS styles applied to the panel. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when an interaction opens or closes the panel, not when `open` is set from outside; detail contains xId and open. */
  @Event() ssOpenChange: EventEmitter<SsPopoverOpenChangeEvent>;

  componentDidLoad() {
    this.syncTrigger();
    if (this.visible) this.activate();
  }

  componentDidUpdate() {
    this.syncTrigger();
    if (this.visible) this.activate();
    this.reposition();
  }

  disconnectedCallback() {
    this.deactivate();
  }

  /**
   * Closing runs here, before the render that hides the panel, because focus
   * left inside a hidden element is lost to the page. Opening waits for the
   * render instead: the panel has to be visible before anything in it can take
   * focus or be measured.
   */
  @Watch('open')
  @Watch('disabled')
  handleVisibilityChange() {
    if (!this.visible) this.deactivate();
  }

  @Listen('scroll', { target: 'window', capture: true })
  @Listen('resize', { target: 'window' })
  handleViewportChange() {
    if (this.visible) this.reposition();
  }

  private get visible() {
    return this.open && !this.disabled;
  }

  private get headingId() {
    return `${this.popoverId}-heading`;
  }

  private get trigger() {
    return slottedIn(this.el, 'trigger');
  }

  private syncTrigger() {
    markTrigger(this.trigger, 'dialog', this.visible);
  }

  private activate() {
    if (this.releaseDismiss || !this.panelEl) return;

    this.reposition();
    this.releaseResize = onResize([this.triggerEl, this.panelEl], () => this.reposition());
    this.releaseDismiss = onDismiss(this.el, {
      escape: this.closeOnEscape,
      outside: this.closeOnOutside,
      onDismiss: () => this.setOpen(false),
    });

    if (!this.panelEl.contains(document.activeElement)) {
      const [first] = getTabbable(this.panelEl);
      (first ?? this.panelEl).focus();
    }
  }

  private deactivate() {
    if (!this.releaseDismiss) return;

    this.releaseDismiss();
    this.releaseDismiss = undefined;
    this.releaseResize?.();
    this.releaseResize = undefined;

    // A reader still inside the panel goes back to what opened it. One who had
    // already moved elsewhere — pressed another control, tabbed away — stays
    // where they went.
    if (this.panelEl?.contains(document.activeElement)) focusInto(this.trigger);
  }

  private reposition() {
    if (!this.visible || !this.triggerEl || !this.panelEl) {
      this.resolvedPlacement = undefined;
      return;
    }

    const placement = anchorTo(this.triggerEl, this.panelEl, { placement: this.placement, align: this.align, offset: OFFSET, padding: EDGE_PADDING });

    if (this.resolvedPlacement === placement) return;
    this.resolvedPlacement = placement;
    this.placementVersion += 1;
  }

  private setOpen(open: boolean) {
    if (this.disabled || this.open === open) return;
    this.open = open;
    this.ssOpenChange.emit({ xId: this.xId, open });
  }

  private toggle = () => this.setOpen(!this.open);

  /**
   * Tabbing out of a popover closes it; otherwise it stays open over content
   * the reader has moved on to. Focus lost to nothing — the window blurring, a
   * press on something unfocusable — is not a move, and outside presses are
   * handled by the dismissal layer.
   */
  private handleFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && !this.el.contains(next)) this.setOpen(false);
  };

  private getClasses() {
    const b = 'ss-popover';
    return {
      [b]: true,
      [`${b}--${this.resolvedPlacement ?? this.placement}`]: true,
      [`${b}--open`]: this.visible,
      [`${b}--disabled`]: this.disabled,
    };
  }

  render() {
    return (
      <span class={this.getClasses()} onFocusout={this.handleFocusOut}>
        <span class="ss-popover__trigger" ref={el => (this.triggerEl = el)} onClick={this.toggle}>
          <slot name="trigger" />
        </span>

        <div
          id={this.xId}
          class="ss-popover__panel"
          style={resolveInlineStyles(this.inlineStyles)}
          ref={el => (this.panelEl = el)}
          role="dialog"
          aria-labelledby={this.heading ? this.headingId : undefined}
          aria-label={this.heading ? undefined : this.accessibilityLabel}
          tabindex={-1}
          hidden={!this.visible}
        >
          {this.heading && (
            <ss-typography xId={this.headingId} class="ss-popover__heading" as="strong" fontSize="md">
              {this.heading}
            </ss-typography>
          )}
          <slot />
        </div>
      </span>
    );
  }
}
