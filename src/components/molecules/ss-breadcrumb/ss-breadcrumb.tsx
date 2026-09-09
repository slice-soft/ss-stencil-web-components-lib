import { Component, Element, h, Prop } from '@stencil/core';
import type { LinkSize } from '../../atoms/ss-link/ss-link';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

/**
 * The trail of pages leading to the one being read.
 *
 * The trail owns the separator, the sizing and which step is the current page;
 * each step draws its own separator because CSS cannot put one between slotted
 * children. The last step is marked as current, so a reader is told where they
 * are rather than being offered a link to where they already are.
 *
 * @slot - The `ss-breadcrumb-item` steps, in order.
 */
@Component({
  tag: 'ss-breadcrumb',
  styleUrl: 'ss-breadcrumb.scss',
  scoped: true,
})
export class SsBreadcrumb {
  @Element() el!: HTMLElement;

  /** Id applied to the rendered navigation element. */
  @Prop() xId?: string;
  /** Accessible name for the trail, so a page with two of them stays navigable. */
  @Prop() accessibilityLabel: string = 'Breadcrumb';
  /** Character drawn between steps. */
  @Prop() separator: string = '/';
  /** Size shared by every step. */
  @Prop() size: LinkSize = 'md';
  /** Inline CSS styles applied to the rendered navigation element. */
  @Prop() inlineStyles?: InlineStyles;

  componentDidLoad() {
    this.syncItems();
  }

  componentDidUpdate() {
    this.syncItems();
  }

  private get items(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>('ss-breadcrumb-item')).filter(item => item.closest('ss-breadcrumb') === this.el);
  }

  private syncItems() {
    const items = this.items;

    items.forEach((item, index) => {
      const props = item as unknown as Record<string, unknown>;
      props.separator = this.separator;
      props.size = this.size;
      props.last = index === items.length - 1;
    });
  }

  render() {
    return (
      <nav id={this.xId} class="ss-breadcrumb" style={resolveInlineStyles(this.inlineStyles)} aria-label={this.accessibilityLabel}>
        {/* The steps are custom elements, not `li`, so the list roles are stated
            rather than inherited from the element names. */}
        <ol class="ss-breadcrumb__list" role="list">
          <slot />
        </ol>
      </nav>
    );
  }
}
