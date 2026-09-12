import { Component, Element, Event, EventEmitter, h, Prop } from '@stencil/core';
import type { Orientation } from '../../../utils/roving';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

/** Emitted when the reader follows an item. Cancelable: preventing it stops the browser following the link. */
export interface SsNavChangeEvent {
  xId?: string;
  value: string;
  href?: string;
}

type Item = HTMLElement & { value?: string; href?: string; label?: string; disabled?: boolean; current?: boolean; orientation?: Orientation };

/**
 * A site's navigation: a named landmark holding a list of links, one of them
 * marked as the page the reader is on.
 *
 * Every item is a real link, so it opens in a new tab, can be copied, and is
 * reached by Tab like any other — site navigation is not an application menu,
 * and giving it menu roles would take those away and change what the keys do.
 *
 * An app that routes on the client listens for `ssChange` and calls
 * `preventDefault()` on it: the browser then does not follow the link, and the
 * app routes instead. The current item moves either way. A modified click —
 * Ctrl, Cmd, Shift or Alt, which the reader uses to open a new tab or window —
 * is left to the browser and changes nothing here.
 *
 * @slot - The `ss-nav-item` links, in order.
 */
@Component({
  tag: 'ss-nav',
  styleUrl: 'ss-nav.scss',
  scoped: true,
})
export class SsNav {
  @Element() el!: HTMLElement;

  /** Id applied to the navigation element; also included in the ssChange detail. */
  @Prop() xId?: string;
  /** Value of the current item, marked as the page the reader is on. Updated when an item is followed, and reflected. */
  @Prop({ mutable: true, reflect: true }) value?: string;
  /** Direction the items run in. */
  @Prop() orientation: Orientation = 'horizontal';
  /** Accessible name for the landmark, so a page with two navigations tells them apart. */
  @Prop() accessibilityLabel: string = 'Main';
  /** Inline CSS styles applied to the navigation element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when an item is followed; detail contains xId, the item's value and its href. Cancel it to route on the client. */
  @Event({ cancelable: true }) ssChange: EventEmitter<SsNavChangeEvent>;

  componentDidLoad() {
    this.syncItems();
  }

  componentDidUpdate() {
    this.syncItems();
  }

  private get items(): Item[] {
    return Array.from(this.el.querySelectorAll<Item>('ss-nav-item')).filter(item => item.closest('ss-nav') === this.el);
  }

  /** An item is identified by its value, then its href, then its text. */
  private itemValue(item: Item): string {
    return item.value ?? item.href ?? item.label ?? item.textContent?.trim() ?? '';
  }

  private syncItems() {
    this.items.forEach(item => {
      item.current = this.value !== undefined && this.itemValue(item) === this.value;
      item.orientation = this.orientation;
    });
  }

  private handleClick = (event: MouseEvent) => {
    const item = (event.target as Element | null)?.closest?.('ss-nav-item') as Item | null;
    if (!item || item.closest('ss-nav') !== this.el) return;

    if (item.disabled) {
      event.preventDefault();
      return;
    }

    // The reader is opening a new tab or window; this page stays where it is.
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    const value = this.itemValue(item);
    const change = this.ssChange.emit({ xId: this.xId, value, href: item.href });
    if (change.defaultPrevented) event.preventDefault();

    this.value = value;
  };

  render() {
    return (
      <nav
        id={this.xId}
        class={{ 'ss-nav': true, [`ss-nav--${this.orientation}`]: true }}
        style={resolveInlineStyles(this.inlineStyles)}
        aria-label={this.accessibilityLabel}
        onClick={this.handleClick}
      >
        {/* The items are custom elements, not `li`, so the list roles are stated
            rather than inherited from the element names. */}
        <ul class="ss-nav__list" role="list">
          <slot />
        </ul>
      </nav>
    );
  }
}
