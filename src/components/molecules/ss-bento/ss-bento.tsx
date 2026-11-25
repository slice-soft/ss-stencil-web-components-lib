import { Component, Element, h, Prop, State, Watch } from '@stencil/core';
import { fitColumns } from '../../../utils/grid';
import { onResize } from '../../../utils/position';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

type Item = HTMLElement & { cols: number };

/**
 * A grid of tiles of different sizes (`ss-bento-item`), for a landing page or
 * a dashboard alike.
 *
 * Columns follow the bento's own width, not the viewport's: it uses as many
 * as fit at `min-item-width`, up to `columns`. A tile never spans more
 * columns than are in use, so the grid never overflows; at one column every
 * tile is a single cell. The count is measured, since a container query cannot
 * read a custom property.
 *
 * @slot - `ss-bento-item` elements.
 */
@Component({
  tag: 'ss-bento',
  styleUrl: 'ss-bento.scss',
  shadow: true,
})
export class SsBento {
  @Element() el!: HTMLElement;

  private gridEl?: HTMLElement;
  private probeEl?: HTMLElement;
  private releaseResize?: () => void;

  /** Id applied to the grid. */
  @Prop() xId?: string;
  /** The most columns it will use. */
  @Prop() columns: number = 4;
  /** The narrowest a one-column tile may be (a CSS length). Defaults to `--ss-bento-min-item-width`. */
  @Prop() minItemWidth?: string;
  /** Later small tiles fill the holes large ones leave. Visual order then differs from reading order. */
  @Prop() dense: boolean = false;
  /** Inline CSS styles applied to the grid. */
  @Prop() inlineStyles?: InlineStyles;

  @State() private cols = 1;

  componentDidLoad() {
    this.releaseResize = onResize([this.gridEl, this.probeEl], this.measure);
    this.measure();
  }

  disconnectedCallback() {
    this.releaseResize?.();
  }

  @Watch('columns')
  @Watch('minItemWidth')
  handleChange() {
    // The probe's width changes with min-item-width and is observed; columns is not.
    this.measure();
  }

  private get items(): Item[] {
    return Array.from(this.el.children).filter((child): child is Item => child.tagName === 'SS-BENTO-ITEM');
  }

  private measure = () => {
    if (!this.gridEl || !this.probeEl) return;
    // The grid, not the host: the document's `:defined { display: revert }`
    // makes the host inline, and a ResizeObserver never reports an inline box.
    const width = this.gridEl.getBoundingClientRect().width;
    const minItem = this.probeEl.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(this.gridEl).columnGap) || 0;
    this.cols = fitColumns(width, minItem, gap, Number(this.columns));
    this.items.forEach(item => (item.cols = this.cols));
  };

  render() {
    return (
      <div
        id={this.xId}
        class={{ 'ss-bento': true, 'ss-bento--dense': this.dense }}
        style={{ ...resolveInlineStyles(this.inlineStyles), '--_cols': String(this.cols) }}
        ref={el => (this.gridEl = el)}
      >
        <span class="ss-bento__probe" aria-hidden="true" style={this.minItemWidth ? { '--_min': this.minItemWidth } : {}} ref={el => (this.probeEl = el)} />
        <slot onSlotchange={this.measure} />
      </div>
    );
  }
}
