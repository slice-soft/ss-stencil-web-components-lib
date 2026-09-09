import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

/** Emitted when the reader asks for a different page. */
export interface SsPaginationChangeEvent {
  xId?: string;
  page: number;
}

/** A gap in the run of page numbers, rendered as an ellipsis. */
const GAP = 'gap';
type Slot = number | typeof GAP;

/**
 * Page navigation for a list that does not fit on one screen.
 *
 * Unlike the other molecules this one is driven by props rather than slots: a
 * page range is data, not content, and the pages between the ends are computed
 * from `page` and `total`. Every rendered page is a real button, so keyboard
 * and screen-reader users move through the list the same way they move through
 * any other row of controls.
 *
 * The component reports the page the reader asked for and updates its own
 * `page`; fetching the rows for it stays with the consumer.
 */
@Component({
  tag: 'ss-pagination',
  styleUrl: 'ss-pagination.scss',
  scoped: true,
})
export class SsPagination {
  /** Id of the container; also included in event details. */
  @Prop() xId?: string;
  /** The page currently shown, counting from one. Updated on interaction and reflected. */
  @Prop({ mutable: true, reflect: true }) page: number = 1;
  /** How many pages there are in total. */
  @Prop() total: number = 1;
  /** How many pages to show either side of the current one before collapsing into a gap. */
  @Prop() siblingCount: number = 1;
  /** Accessible name for the navigation region, so a page with two of them stays distinguishable. */
  @Prop() accessibilityLabel: string = 'Pagination';
  /** Label for the previous-page control. */
  @Prop() previousLabel: string = 'Previous page';
  /** Label for the next-page control. */
  @Prop() nextLabel: string = 'Next page';
  /** Size shared by every control. */
  @Prop() size: Size = 'md';
  /** Disables the whole control. */
  @Prop() disabled: boolean = false;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when a different page is requested; detail contains xId and the page. */
  @Event() ssChange: EventEmitter<SsPaginationChangeEvent>;

  /** Pages are one-based, and a request outside the range is not a page. */
  private get current(): number {
    return Math.min(Math.max(Math.trunc(this.page) || 1, 1), this.pageCount);
  }

  private get pageCount(): number {
    return Math.max(Math.trunc(this.total) || 1, 1);
  }

  /**
   * The first and last page are always reachable, and the pages around the
   * current one keep their place; whatever is left over collapses into a gap.
   * A gap is only worth drawing when it hides more than one page — replacing a
   * single number with an ellipsis costs the reader a click and saves nothing.
   */
  private get slots(): Slot[] {
    const count = this.pageCount;
    const current = this.current;
    const siblings = Math.max(Math.trunc(this.siblingCount) || 0, 0);

    // Collapsing cannot save a slot below this width, so a short range shows
    // every page rather than hiding one behind an ellipsis for no gain.
    if (count <= 2 * siblings + 5) return Array.from({ length: count }, (_, index) => index + 1);

    const from = Math.max(2, current - siblings);
    const to = Math.min(count - 1, current + siblings);
    const slots: Slot[] = [1];

    if (from > 2) slots.push(from === 3 ? 2 : GAP);
    for (let page = from; page <= to; page++) slots.push(page);
    if (to < count - 1) slots.push(to === count - 2 ? count - 1 : GAP);
    if (count > 1) slots.push(count);

    return slots;
  }

  private goTo(page: number) {
    const target = Math.min(Math.max(page, 1), this.pageCount);
    if (this.disabled || target === this.current) return;

    this.page = target;
    this.ssChange.emit({ xId: this.xId, page: target });
  }

  private getClasses() {
    const b = 'ss-pagination';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--disabled`]: this.disabled,
    };
  }

  render() {
    const current = this.current;
    const count = this.pageCount;

    return (
      <nav id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)} aria-label={this.accessibilityLabel}>
        <ul class="ss-pagination__list">
          <li class="ss-pagination__item">
            <ss-button
              class="ss-pagination__previous"
              size={this.size}
              xStyle="ghost"
              accessibilityLabel={this.previousLabel}
              label="‹"
              disabled={this.disabled || current === 1}
              onClick={() => this.goTo(current - 1)}
            />
          </li>

          {this.slots.map(slot =>
            slot === GAP ? (
              <li class="ss-pagination__item">
                <span class="ss-pagination__gap" aria-hidden="true">
                  …
                </span>
              </li>
            ) : (
              <li class="ss-pagination__item">
                <ss-button
                  class="ss-pagination__page"
                  size={this.size}
                  xStyle={slot === current ? 'solid' : 'ghost'}
                  label={String(slot)}
                  accessibilityLabel={`Page ${slot}`}
                  disabled={this.disabled}
                  aria-current={slot === current ? 'page' : undefined}
                  onClick={() => this.goTo(slot)}
                />
              </li>
            ),
          )}

          <li class="ss-pagination__item">
            <ss-button
              class="ss-pagination__next"
              size={this.size}
              xStyle="ghost"
              accessibilityLabel={this.nextLabel}
              label="›"
              disabled={this.disabled || current === count}
              onClick={() => this.goTo(current + 1)}
            />
          </li>
        </ul>
      </nav>
    );
  }
}
