# ss-input-group



<!-- Auto Generated Below -->


## Overview

Joins a control to the addons beside it — a currency symbol, a unit, a button
— so the set reads as one field.

The seam is made by telling the control which of its corners meet a
neighbour, through `join`, rather than by styling it: `ss-input` renders into
its own shadow root, and no wrapper can reach a border radius in there. That
is also why the addon, not the control, is what this component draws.

## Properties

| Property       | Attribute       | Description                                                             | Type                                                     | Default     |
| -------------- | --------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- | ----------- |
| `disabled`     | `disabled`      | Disables the control.                                                   | `boolean`                                                | `false`     |
| `fullWidth`    | `full-width`    | Expands the group, and its control, to the full width of the container. | `boolean`                                                | `false`     |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the container.                             | `string \| { [x: string]: string; }`                     | `undefined` |
| `size`         | `size`          | Size shared by the control and the addons.                              | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"` | `'md'`      |
| `xId`          | `x-id`          | Id applied to the rendered container.                                   | `string`                                                 | `undefined` |


## Slots

| Slot      | Description                       |
| --------- | --------------------------------- |
|           | The control the addons attach to. |
| `"end"`   | Content after the control.        |
| `"start"` | Content before the control.       |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
