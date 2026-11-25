import { Component, h, Host, Prop } from '@stencil/core';

const span = (value: unknown) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 1 ? n : 1;
};

/**
 * One tile of an `ss-bento`: a cell that spans columns and rows. It draws
 * nothing of its own; what is inside (an `ss-card`, a chart, an image) does,
 * and is stretched to fill the cell.
 *
 * @slot - The tile's content.
 */
@Component({
  tag: 'ss-bento-item',
  styleUrl: 'ss-bento-item.scss',
  shadow: true,
})
export class SsBentoItem {
  /** Columns the tile spans, at most the columns in use. */
  @Prop() colSpan: number = 1;
  /** Rows the tile spans; one when the bento is a single column. */
  @Prop() rowSpan: number = 1;
  /** Columns in use. Set by `ss-bento`. @internal */
  @Prop() cols: number = 1;

  render() {
    const cols = span(this.cols);
    const colSpan = Math.min(span(this.colSpan), cols);
    const rowSpan = cols === 1 ? 1 : span(this.rowSpan);
    return (
      <Host style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}>
        <slot />
      </Host>
    );
  }
}
