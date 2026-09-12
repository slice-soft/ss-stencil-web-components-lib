import { Component, Element, h, Listen, Prop } from '@stencil/core';
import type { SsAccordionItemOpenChangeEvent } from '../ss-accordion-item/ss-accordion-item';
import { rovingIndex } from '../../../utils/roving';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

type Item = HTMLElement & { open: boolean; disabled?: boolean };

/**
 * A stack of `ss-accordion-item` sections.
 *
 * By default one section is open at a time: opening a section closes the one
 * that was open, so the reader is never left with a column of expanded text
 * to find their place in. `multiple` lets several stay open.
 *
 * The arrow keys move between headers — Up and Down, wrapping, with Home and
 * End — which the WAI-ARIA accordion pattern suggests for a long stack. Tab
 * still goes through the headers and into each open section in page order;
 * the arrows are a shortcut, not a replacement.
 *
 * @slot - The `ss-accordion-item` sections.
 */
@Component({
  tag: 'ss-accordion',
  styleUrl: 'ss-accordion.scss',
  scoped: true,
})
export class SsAccordion {
  @Element() el!: HTMLElement;

  /** Id applied to the container. */
  @Prop() xId?: string;
  /** Lets several sections stay open at once. */
  @Prop() multiple: boolean = false;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  /** Markup that opens several sections of a single-open accordion keeps the first. */
  componentDidLoad() {
    if (this.multiple) return;
    this.items
      .filter(item => item.open)
      .slice(1)
      .forEach(item => (item.open = false));
  }

  private get items(): Item[] {
    return Array.from(this.el.querySelectorAll<Item>('ss-accordion-item')).filter(item => item.closest('ss-accordion') === this.el);
  }

  private triggerOf(item: Item): HTMLButtonElement | null {
    return item.querySelector<HTMLButtonElement>('.ss-accordion-item__trigger');
  }

  /**
   * Closes the other sections when one opens. The event is checked by tag and
   * owner: popovers, dropdowns and dialogs inside a section emit an
   * `ssOpenChange` of their own, and a nested accordion's sections are not
   * this accordion's to close.
   */
  @Listen('ssOpenChange')
  handleItemOpenChange(event: CustomEvent<SsAccordionItemOpenChangeEvent>) {
    const source = event.target as Item;
    if (this.multiple || !event.detail.open || source.localName !== 'ss-accordion-item' || source.closest('ss-accordion') !== this.el) return;

    this.items.filter(item => item !== source && item.open).forEach(item => (item.open = false));
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const items = this.items;
    const triggers = items.map(item => this.triggerOf(item));
    const current = triggers.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;

    const next = rovingIndex(event.key, current, items.length, { disabled: index => !!items[index].disabled });
    if (next === null) return;

    event.preventDefault();
    triggers[next]?.focus();
  };

  render() {
    return (
      <div id={this.xId} class="ss-accordion" style={resolveInlineStyles(this.inlineStyles)} onKeyDown={this.handleKeyDown}>
        <slot />
      </div>
    );
  }
}
