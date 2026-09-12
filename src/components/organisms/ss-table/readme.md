# ss-table



<!-- Auto Generated Below -->


## Overview

Rows of data under a row of headers.

It is driven by data rather than markup — `columns` and `rows` are set as
properties, like `ss-checkbox-group`'s value — because a table's cells are
the caller's content, and a scoped component cannot style content slotted
into it. Drawing the cells itself is what lets the table look like the rest
of the library. The trade is that a cell is text, shaped by a column's
`format`.

It is a real `<table>`: the caption names it, every header is a column
header, and a sortable header is a button inside the header cell, with the
sort order stated on the cell as `aria-sort`. Rows are sorted here unless
`manual-sort` is set, in which case the table only reports the request and
leaves the order to whoever fetched the rows.

A table wider than its container scrolls sideways, and only then does its
scroll area become a focusable region named after the caption, so a keyboard
user can scroll it. A table that fits adds no stop to the tab order.

## Properties

| Property        | Attribute        | Description                                                                                                         | Type                                 | Default       |
| --------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------- |
| `caption`       | `caption`        | Caption, which is also the table's accessible name.                                                                 | `string`                             | `undefined`   |
| `columns`       | `columns`        | The columns, in order. Set as a property.                                                                           | `SsTableColumn[]`                    | `[]`          |
| `emptyText`     | `empty-text`     | Text shown when there are no rows.                                                                                  | `string`                             | `'No data'`   |
| `hideCaption`   | `hide-caption`   | Keeps the caption for assistive technology but hides it from view.                                                  | `boolean`                            | `false`       |
| `inlineStyles`  | `inline-styles`  | Inline CSS styles applied to the container. A max-height here makes the rows scroll.                                | `string \| { [x: string]: string; }` | `undefined`   |
| `manualSort`    | `manual-sort`    | Reports sort requests without reordering the rows, for data sorted elsewhere.                                       | `boolean`                            | `false`       |
| `rowKey`        | `row-key`        | Property holding each row's identity, so the rows keep their elements when the order changes. Defaults to position. | `string`                             | `undefined`   |
| `rows`          | `rows`           | The rows, one object each. Set as a property; never modified.                                                       | `TableRow[]`                         | `[]`          |
| `size`          | `size`           | Cell padding.                                                                                                       | `"lg" \| "md" \| "sm"`               | `'md'`        |
| `sortDirection` | `sort-direction` | Direction of the sort. Updated when a header is pressed, and reflected.                                             | `"ascending" \| "descending"`        | `'ascending'` |
| `sortKey`       | `sort-key`       | Column the rows are sorted by. Updated when a header is pressed, and reflected.                                     | `string`                             | `undefined`   |
| `stickyHeader`  | `sticky-header`  | Keeps the header in view while the rows scroll. Give the table a max-height for it to scroll.                       | `boolean`                            | `false`       |
| `striped`       | `striped`        | Shades every other row.                                                                                             | `boolean`                            | `false`       |
| `xId`           | `x-id`           | Id applied to the container; also included in the ssSort detail.                                                    | `string`                             | `undefined`   |


## Events

| Event    | Description                                                                                       | Type                            |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| `ssSort` | Emitted when a sortable header is pressed; detail contains xId, the column key and the direction. | `CustomEvent<SsTableSortEvent>` |


## Slots

| Slot      | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `"empty"` | What to show when there are no rows; overrides `empty-text`. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
