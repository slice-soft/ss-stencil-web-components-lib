import { Component, Element, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { nextId } from '../../../utils/id';
import { onResize } from '../../../utils/position';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type TableRow = Record<string, unknown>;
export type TableSortDirection = 'ascending' | 'descending';
export type TableAlign = 'start' | 'center' | 'end';
export type TableSize = 'sm' | 'md' | 'lg';

export interface SsTableColumn {
  /** Property of each row this column shows. */
  key: string;
  /** Header text. */
  label: string;
  /** Whether the header sorts the rows by this column. */
  sortable?: boolean;
  /** Alignment of the header and cells; numbers read best at the end. */
  align?: TableAlign;
  /** Turns a cell's value into the text shown. The row is passed for cells built from several fields. */
  format?: (value: unknown, row: TableRow) => string;
}

/** Emitted when a sortable header is pressed. */
export interface SsTableSortEvent {
  xId?: string;
  key: string;
  direction: TableSortDirection;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const isEmpty = (value: unknown) => value === null || value === undefined || value === '';

/**
 * Natural order: numbers as numbers, dates as dates, and text the way a person
 * reads it, so "Item 2" comes before "Item 10".
 */
function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return collator.compare(String(a), String(b));
}

/**
 * Rows of data under a row of headers.
 *
 * It is driven by data rather than markup — `columns` and `rows` are set as
 * properties, like `ss-checkbox-group`'s value — because a table's cells are
 * the caller's content, and a scoped component cannot style content slotted
 * into it. Drawing the cells itself is what lets the table look like the rest
 * of the library. The trade is that a cell is text, shaped by a column's
 * `format`.
 *
 * It is a real `<table>`: the caption names it, every header is a column
 * header, and a sortable header is a button inside the header cell, with the
 * sort order stated on the cell as `aria-sort`. Rows are sorted here unless
 * `manual-sort` is set, in which case the table only reports the request and
 * leaves the order to whoever fetched the rows.
 *
 * A table wider than its container scrolls sideways, and only then does its
 * scroll area become a focusable region named after the caption, so a keyboard
 * user can scroll it. A table that fits adds no stop to the tab order.
 *
 * @slot empty - What to show when there are no rows; overrides `empty-text`.
 */
@Component({
  tag: 'ss-table',
  styleUrl: 'ss-table.scss',
  scoped: true,
})
export class SsTable {
  @Element() el!: HTMLElement;

  private tableId = nextId('ss-table');
  private scrollEl?: HTMLElement;
  private releaseResize?: () => void;

  /** Whether the rows are wider than the space they have. */
  @State() overflowing = false;

  /** Id applied to the container; also included in the ssSort detail. */
  @Prop() xId?: string;
  /** The columns, in order. Set as a property. */
  @Prop() columns: SsTableColumn[] = [];
  /** The rows, one object each. Set as a property; never modified. */
  @Prop() rows: TableRow[] = [];
  /** Caption, which is also the table's accessible name. */
  @Prop() caption?: string;
  /** Keeps the caption for assistive technology but hides it from view. */
  @Prop() hideCaption: boolean = false;
  /** Column the rows are sorted by. Updated when a header is pressed, and reflected. */
  @Prop({ mutable: true, reflect: true }) sortKey?: string;
  /** Direction of the sort. Updated when a header is pressed, and reflected. */
  @Prop({ mutable: true, reflect: true }) sortDirection: TableSortDirection = 'ascending';
  /** Reports sort requests without reordering the rows, for data sorted elsewhere. */
  @Prop() manualSort: boolean = false;
  /** Property holding each row's identity, so the rows keep their elements when the order changes. Defaults to position. */
  @Prop() rowKey?: string;
  /** Shades every other row. */
  @Prop() striped: boolean = false;
  /** Keeps the header in view while the rows scroll. Give the table a max-height for it to scroll. */
  @Prop() stickyHeader: boolean = false;
  /** Cell padding. */
  @Prop() size: TableSize = 'md';
  /** Text shown when there are no rows. */
  @Prop() emptyText: string = 'No data';
  /** Inline CSS styles applied to the container. A max-height here makes the rows scroll. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when a sortable header is pressed; detail contains xId, the column key and the direction. */
  @Event() ssSort: EventEmitter<SsTableSortEvent>;

  componentDidLoad() {
    this.releaseResize = onResize([this.scrollEl, this.scrollEl?.firstElementChild], () => this.measure());
    this.measure();
  }

  componentDidUpdate() {
    this.measure();
  }

  disconnectedCallback() {
    this.releaseResize?.();
  }

  private measure() {
    if (!this.scrollEl) return;
    const overflowing = this.scrollEl.scrollWidth > this.scrollEl.clientWidth;
    if (overflowing !== this.overflowing) this.overflowing = overflowing;
  }

  private get safeColumns(): SsTableColumn[] {
    return Array.isArray(this.columns) ? this.columns : [];
  }

  /** The rows in the order shown. A copy is sorted; the caller's array is left alone. */
  private get shownRows(): TableRow[] {
    const rows = Array.isArray(this.rows) ? this.rows : [];
    const key = this.sortKey;
    if (this.manualSort || !key || !this.safeColumns.some(column => column.key === key)) return rows;

    const direction = this.sortDirection === 'descending' ? -1 : 1;

    // Empty cells go last whichever way the column is sorted: they are the
    // absence of an answer, not the smallest one.
    return [...rows].sort((a, b) => {
      const left = a[key];
      const right = b[key];
      if (isEmpty(left) || isEmpty(right)) return Number(isEmpty(left)) - Number(isEmpty(right));
      return compare(left, right) * direction;
    });
  }

  private sortBy(key: string) {
    const direction: TableSortDirection = this.sortKey === key && this.sortDirection === 'ascending' ? 'descending' : 'ascending';
    this.sortKey = key;
    this.sortDirection = direction;
    this.ssSort.emit({ xId: this.xId, key, direction });
  }

  private cell(column: SsTableColumn, row: TableRow): string {
    const value = row[column.key];
    if (column.format) return column.format(value, row);
    return isEmpty(value) ? '' : String(value);
  }

  private alignClass(column: SsTableColumn) {
    return `ss-table__cell--${column.align ?? 'start'}`;
  }

  private renderHeader(column: SsTableColumn) {
    const sorted = this.sortKey === column.key;

    return (
      <th scope="col" class={{ 'ss-table__header': true, [this.alignClass(column)]: true }} aria-sort={column.sortable && sorted ? this.sortDirection : undefined}>
        {column.sortable ? (
          <button type="button" class={{ 'ss-table__sort': true, 'ss-table__sort--active': sorted }} onClick={() => this.sortBy(column.key)}>
            {column.label}
            <span class="ss-table__sort-icon" aria-hidden="true">
              {sorted ? (this.sortDirection === 'ascending' ? '▲' : '▼') : '↕'}
            </span>
          </button>
        ) : (
          column.label
        )}
      </th>
    );
  }

  render() {
    const columns = this.safeColumns;
    const rows = this.shownRows;
    const captionId = `${this.tableId}-caption`;

    return (
      <div
        id={this.xId}
        class={{ 'ss-table': true, [`ss-table--${this.size}`]: true, 'ss-table--striped': this.striped, 'ss-table--sticky-header': this.stickyHeader }}
        style={resolveInlineStyles(this.inlineStyles)}
      >
        <div
          class="ss-table__scroll"
          ref={el => (this.scrollEl = el)}
          tabindex={this.overflowing ? 0 : undefined}
          role={this.overflowing ? 'region' : undefined}
          aria-labelledby={this.overflowing && this.caption ? captionId : undefined}
        >
          <table class="ss-table__table">
            {this.caption && (
              <caption id={captionId} class={{ 'ss-table__caption': true, 'ss-table__caption--hidden': this.hideCaption }}>
                {this.caption}
              </caption>
            )}
            <thead>
              <tr>{columns.map(column => this.renderHeader(column))}</tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row, index) => (
                  <tr key={this.rowKey ? String(row[this.rowKey]) : index} class="ss-table__row">
                    {columns.map(column => (
                      <td class={{ 'ss-table__cell': true, [this.alignClass(column)]: true }}>{this.cell(column, row)}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td class="ss-table__empty" colSpan={Math.max(columns.length, 1)}>
                    <slot name="empty">{this.emptyText}</slot>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
