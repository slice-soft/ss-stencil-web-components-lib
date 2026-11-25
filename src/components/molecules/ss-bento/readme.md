# ss-bento



<!-- Auto Generated Below -->


## Overview

A grid of tiles of different sizes (`ss-bento-item`), for a landing page or
a dashboard alike.

Columns follow the bento's own width, not the viewport's: it uses as many
as fit at `min-item-width`, up to `columns`. A tile never spans more
columns than are in use, so the grid never overflows; at one column every
tile is a single cell. The count is measured, since a container query cannot
read a custom property.

## Properties

| Property       | Attribute        | Description                                                                                      | Type                                 | Default     |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------ | ----------- |
| `columns`      | `columns`        | The most columns it will use.                                                                    | `number`                             | `4`         |
| `dense`        | `dense`          | Later small tiles fill the holes large ones leave. Visual order then differs from reading order. | `boolean`                            | `false`     |
| `inlineStyles` | `inline-styles`  | Inline CSS styles applied to the grid.                                                           | `string \| { [x: string]: string; }` | `undefined` |
| `minItemWidth` | `min-item-width` | The narrowest a one-column tile may be (a CSS length). Defaults to `--ss-bento-min-item-width`.  | `string`                             | `undefined` |
| `xId`          | `x-id`           | Id applied to the grid.                                                                          | `string`                             | `undefined` |


## Slots

| Slot | Description               |
| ---- | ------------------------- |
|      | `ss-bento-item` elements. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
