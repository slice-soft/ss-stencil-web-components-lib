import { Component, Element, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { slotHasContent } from '../../../utils/slot';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type CardStyle = 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/** Emitted on a plain press of a card that is a link. */
export interface SsCardNavigateEvent {
  xId?: string;
  href: string;
}

/**
 * A surface that groups related content, with optional media, header and footer
 * regions around it.
 *
 * It is layout only, unless it has an `href`: then the whole card is one link.
 * The role stays on a real `<a>`, never on the container: the card renders one
 * link and stretches its hit area over itself, so a press anywhere follows it,
 * while buttons and links inside (`ss-button`, `ss-link`, `ss-dropdown`,
 * `ss-popover`, `a`, `button`, or any element marked `data-card-action`) are
 * lifted above it and keep doing their own thing. Only elements slotted
 * directly can be lifted: an action nested in a slotted wrapper needs
 * `data-card-action` on the wrapper.
 *
 * The link is named by `accessibility-label`, else by the header, else by the
 * content. A client-side router listens for `ssNavigate` and calls
 * `preventDefault()`; a press with a modifier key is left to the browser.
 *
 * Each region collapses when nothing is slotted into it, so an unused header
 * leaves no gap and draws no divider.
 *
 * @slot - The card's content.
 * @slot media - Full-bleed media above the content, such as an image.
 * @slot header - A title row above the content.
 * @slot footer - Actions or metadata below the content.
 */
@Component({
  tag: 'ss-card',
  styleUrl: 'ss-card.scss',
  shadow: true,
})
export class SsCard {
  @Element() el!: HTMLElement;

  /** Id applied to the rendered container. */
  @Prop() xId?: string;
  /** Visual style: raised off the page, outlined, or filled with a surface tone. */
  @Prop() xStyle: CardStyle = 'elevated';
  /** Inner spacing applied to the header, content and footer regions. */
  @Prop() padding: CardPadding = 'md';
  /** Expands the card to the full width of its container. */
  @Prop() fullWidth: boolean = false;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;
  /** Makes the whole card a link to this address. */
  @Prop() href?: string;
  /** Where the link opens, as on an anchor. */
  @Prop() target?: string;
  /** Relationship of the linked page, as on an anchor. */
  @Prop() rel?: string;
  /** Accessible name of the link; by default the header names it, or else the content. */
  @Prop() accessibilityLabel?: string;

  /** Emitted on a plain press of a card with an `href`; cancelable — `preventDefault()` keeps the browser from following the link. */
  @Event({ cancelable: true }) ssNavigate: EventEmitter<SsCardNavigateEvent>;

  private link?: HTMLAnchorElement;

  /** Which optional regions currently hold content, tracked through slotchange. */
  @State() filled: Record<string, boolean> = { media: false, header: false, footer: false };

  private trackSlot(name: string) {
    return (event: Event) => {
      const has = slotHasContent(event);
      if (this.filled[name] !== has) this.filled = { ...this.filled, [name]: has };
      this.nameLink();
    };
  }

  componentDidRender() {
    this.nameLink();
  }

  /**
   * Names the link with the header's elements, or else the content's. They are
   * the caller's, outside this shadow root, where an id would not resolve, so
   * the link gets element references instead.
   */
  private nameLink() {
    const link = this.link as (HTMLAnchorElement & { ariaLabelledByElements?: Element[] | null }) | undefined;
    if (!link) return;
    const reflects = 'ariaLabelledByElements' in link;
    if (this.accessibilityLabel) {
      if (reflects) link.ariaLabelledByElements = null;
      return;
    }
    const assigned = (name?: string) => {
      const slot = this.el.shadowRoot?.querySelector<HTMLSlotElement>(name ? `slot[name="${name}"]` : 'slot:not([name])');
      return (slot?.assignedNodes({ flatten: true }) ?? []).filter(node => !!node.textContent?.trim());
    };
    const header = assigned('header');
    const names = header.length ? header : assigned();
    const elements = names.filter((node): node is HTMLElement => node instanceof HTMLElement);
    // Element references when every naming node is an element and the browser
    // reflects them; otherwise (bare text, or no reflection) the text itself.
    if (reflects && elements.length && elements.length === names.length) {
      link.removeAttribute('aria-label');
      link.ariaLabelledByElements = elements;
      return;
    }
    if (reflects) link.ariaLabelledByElements = null;
    const text = names
      .map(node => node.textContent!.trim())
      .join(' ')
      .replace(/\s+/g, ' ');
    if (text) link.setAttribute('aria-label', text);
    else link.removeAttribute('aria-label');
  }

  private handleClick = (event: MouseEvent) => {
    if (!this.href || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const navigate = this.ssNavigate.emit({ xId: this.xId, href: this.href });
    if (navigate.defaultPrevented) event.preventDefault();
  };

  private getClasses() {
    const b = 'ss-card';
    return {
      [b]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--padding-${this.padding}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--has-media`]: this.filled.media,
      [`${b}--has-header`]: this.filled.header,
      [`${b}--has-footer`]: this.filled.footer,
      [`${b}--interactive`]: !!this.href,
    };
  }

  render() {
    return (
      <div id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        {this.href && (
          <a
            ref={el => (this.link = el)}
            class="ss-card__link"
            href={this.href}
            target={this.target}
            rel={this.rel}
            aria-label={this.accessibilityLabel}
            onClick={this.handleClick}
          />
        )}
        <div class="ss-card__media">
          <slot name="media" onSlotchange={this.trackSlot('media')} />
        </div>
        <div class="ss-card__header">
          <slot name="header" onSlotchange={this.trackSlot('header')} />
        </div>
        <div class="ss-card__content">
          <slot />
        </div>
        <div class="ss-card__footer">
          <slot name="footer" onSlotchange={this.trackSlot('footer')} />
        </div>
      </div>
    );
  }
}
