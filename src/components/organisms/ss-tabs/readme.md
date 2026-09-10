# ss-tabs



<!-- Auto Generated Below -->


## Overview

A set of panels, one shown at a time, chosen from a row of tabs.

It follows the WAI-ARIA tabs pattern. The tab list is a single stop in the
tab order — the selected tab — and the arrow keys move between tabs,
wrapping, with Home and End for the ends. With automatic activation, the
default, moving to a tab shows its panel. With manual activation the reader
moves first and presses Enter or Space to show it, which is the better choice
when a panel is slow to render.

The tabs are drawn here, from each `ss-tab`'s `label`, as real buttons in a
real tab list. Drawing them from data rather than slotting the caller's
markup is what keeps the roles intact: every tab is a direct child of the tab
list, in the same tree as the panels it controls, so the ids tying the two
together resolve. The trade is that a tab label is text.

## Properties

| Property             | Attribute             | Description                                                                                                         | Type                                 | Default        |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------- |
| `accessibilityLabel` | `accessibility-label` | Accessible name for the tab list.                                                                                   | `string`                             | `undefined`    |
| `activation`         | `activation`          | Whether moving to a tab shows its panel (automatic) or waits for Enter or Space (manual).                           | `"automatic" \| "manual"`            | `'automatic'`  |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the container.                                                                         | `string \| { [x: string]: string; }` | `undefined`    |
| `orientation`        | `orientation`         | Direction the tabs run in, which also decides the arrow keys: Left and Right, or Up and Down.                       | `"horizontal" \| "vertical"`         | `'horizontal'` |
| `value`              | `value`               | Value of the selected tab. Updated on interaction, and reflected. Falls back to the first tab that can be selected. | `string`                             | `undefined`    |
| `xId`                | `x-id`                | Id applied to the container; also included in the ssChange detail.                                                  | `string`                             | `undefined`    |


## Events

| Event      | Description                                                                                   | Type                             |
| ---------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| `ssChange` | Emitted when an interaction selects a different tab; detail contains xId and the tab's value. | `CustomEvent<SsTabsChangeEvent>` |


## Slots

| Slot | Description                    |
| ---- | ------------------------------ |
|      | The `ss-tab` panels, in order. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
