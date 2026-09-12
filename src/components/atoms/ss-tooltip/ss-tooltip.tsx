import { Component, Element, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
import { nextId } from '../../../utils/id';
import { place, Placement } from '../../../utils/position';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type TooltipPlacement = Placement;
export type TooltipTrigger = 'hover' | 'click' | 'manual';
export type SsTooltipOpenChangeEvent = { xId?: string; open: boolean };

/** Gap from the trigger, and the least space to leave against a viewport edge. */
const OFFSET = 8;
const EDGE_PADDING = 4;

/** Elements that expose a `describedBy` prop reaching the control they render. */
const DESCRIBABLE = 'ss-button,ss-input,ss-textarea,ss-slider,ss-checkbox,ss-radio,ss-switch,ss-select,ss-combobox';

/**
 * Rendered scoped rather than shadow because the description has to reach the
 * trigger. A tooltip's whole job is to describe the thing it points at, and
 * `aria-describedby` is an IDREF: with the content inside a shadow root, the
 * reference never resolved and the trigger was announced with no description
 * at all — correct-looking markup, nothing reaching the user.
 *
 * @slot trigger - Tooltip trigger content.
 * @slot - Tooltip content.
 */
@Component({
  tag: 'ss-tooltip',
  styleUrl: 'ss-tooltip.scss',
  scoped: true,
})
export class SsTooltip {
  @Element() el!: HTMLElement;

  private contentId = nextId('ss-tooltip-content');
  private triggerEl?: HTMLElement;
  private contentEl?: HTMLElement;

  /**
   * The side the tooltip ended up on, which is not always the side it asked
   * for. A plain field read during render, paired with a counter that requests
   * one: the coordinates are written straight to the element instead, because
   * scrolling recomputes them continuously and re-rendering for each frame
   * would cost far more than the class it would produce.
   */
  private resolvedPlacement?: Placement;
  @State() placementVersion = 0;

  /** Id applied to the root element; also included in the ssOpenChange detail. */
  @Prop() xId?: string;
  /** Whether the tooltip is open; updated by hover and click interactions and reflected as an attribute. */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  /** Tooltip text rendered when no default slot content is provided. */
  @Prop() content?: string;
  /** Placement relative to the trigger: top, right, bottom or left. */
  @Prop() placement: TooltipPlacement = 'top';
  /** Interaction that toggles the tooltip: hover (also focus), click, or manual (controlled through open). */
  @Prop() trigger: TooltipTrigger = 'hover';
  /** Disables the tooltip; it stays closed and ignores interactions. */
  @Prop() disabled: boolean = false;
  /** Inline CSS styles applied to the root element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when an interaction changes the open state, not when the open prop is set externally; detail contains xId and open. */
  @Event() ssOpenChange: EventEmitter<SsTooltipOpenChangeEvent>;

  componentDidLoad() {
    this.describeTrigger();
    this.reposition();
  }

  componentDidUpdate() {
    this.describeTrigger();
    this.reposition();
  }

  /**
   * The anchor moves with the page, so a tooltip left where it was drawn ends
   * up pointing at nothing. Both listeners capture, because the scroll that
   * moved the trigger may have happened in a container rather than the window.
   */
  @Listen('scroll', { target: 'window', capture: true })
  @Listen('resize', { target: 'window' })
  handleViewportChange() {
    if (this.visible) this.reposition();
  }

  /**
   * Measures the trigger and the content and asks for a place that fits. The
   * measurement lives here and the geometry lives in `utils/position`, so what
   * happens at an edge is decided by something testable.
   *
   * A flip on first load costs one extra render, which Stencil warns about:
   * the side cannot be known before measuring, and measuring needs a render.
   * Scrolling costs none, which is the case that repeats.
   */
  private reposition() {
    if (!this.visible || !this.triggerEl || !this.contentEl) {
      this.resolvedPlacement = undefined;
      return;
    }

    const anchor = this.triggerEl.getBoundingClientRect();
    const content = this.contentEl.getBoundingClientRect();

    const next = place({
      anchor: { top: anchor.top, left: anchor.left, width: anchor.width, height: anchor.height },
      floating: { width: content.width, height: content.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      placement: this.placement,
      offset: OFFSET,
      padding: EDGE_PADDING,
    });

    this.contentEl.style.top = `${next.top}px`;
    this.contentEl.style.left = `${next.left}px`;

    if (this.resolvedPlacement === next.placement) return;
    this.resolvedPlacement = next.placement;
    this.placementVersion += 1;
  }

  /**
   * Escape dismisses a tooltip without moving focus, which is what lets a
   * keyboard user get a tooltip out of the way when it covers what they were
   * reading. It is bound to the document because a hover tooltip can be open
   * while focus is somewhere else entirely.
   */
  @Listen('keydown', { target: 'document' })
  handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !this.open) return;
    this.setOpen(false);
  }

  /**
   * Points the trigger at the tooltip content. The description goes on the
   * element the caller slotted, not on the wrapper around it: the wrapper is
   * not focusable, so assistive technology never reaches it. A custom element
   * takes it through its `describedBy` prop, which is what carries the
   * reference into whatever control it renders.
   */
  private describeTrigger() {
    const trigger = this.el.querySelector<HTMLElement>('[slot="trigger"]');
    if (!trigger) return;

    const value = this.visible ? this.contentId : undefined;

    if (trigger.matches(DESCRIBABLE)) {
      (trigger as unknown as Record<string, unknown>).describedBy = value;
      return;
    }

    if (value) trigger.setAttribute('aria-describedby', value);
    else trigger.removeAttribute('aria-describedby');
  }

  private get visible() {
    return this.open && !this.disabled;
  }

  private getClasses() {
    const b = 'ss-tooltip';
    return {
      [b]: true,
      [`${b}--${this.resolvedPlacement ?? this.placement}`]: true,
      [`${b}--open`]: this.visible,
      [`${b}--disabled`]: this.disabled,
    };
  }

  private setOpen(open: boolean) {
    if (this.disabled || this.trigger === 'manual' || this.open === open) return;
    this.open = open;
    this.ssOpenChange.emit({ xId: this.xId, open });
  }

  private toggleOpen = () => {
    if (this.trigger === 'click') {
      this.setOpen(!this.open);
    }
  };

  render() {
    return (
      <span
        id={this.xId}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        onMouseEnter={() => this.trigger === 'hover' && this.setOpen(true)}
        onMouseLeave={() => this.trigger === 'hover' && this.setOpen(false)}
        onFocusin={() => this.trigger === 'hover' && this.setOpen(true)}
        onFocusout={() => this.trigger === 'hover' && this.setOpen(false)}
      >
        <span class="ss-tooltip__trigger" ref={el => (this.triggerEl = el)} onClick={this.toggleOpen}>
          <slot name="trigger" />
        </span>
        <span id={this.contentId} class="ss-tooltip__content" ref={el => (this.contentEl = el)} role="tooltip" aria-hidden={this.visible ? 'false' : 'true'}>
          <slot>{this.content}</slot>
        </span>
      </span>
    );
  }
}
