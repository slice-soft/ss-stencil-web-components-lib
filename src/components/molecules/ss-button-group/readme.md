# ss-button-group



<!-- Auto Generated Below -->


## Overview

Presents a set of related actions as one group: shared sizing and styling in
one place, and an accessible name for the set.

With `attached`, the buttons become one segmented control. The seam is made
by telling each button which of its corners meet a neighbour, through `join`,
because `ss-button` renders into its own shadow root and no wrapper can reach
a border radius in there. Attaching applies to a horizontal row: a vertical
group would need to flatten block corners, which `join` does not describe.

## Properties

| Property             | Attribute             | Description                                                             | Type                                                                                                                                             | Default        |
| -------------------- | --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `accessibilityLabel` | `accessibility-label` | Accessible name for the set of actions.                                 | `string`                                                                                                                                         | `undefined`    |
| `attached`           | `attached`            | Joins the buttons into one segmented control. Horizontal groups only.   | `boolean`                                                                                                                                        | `false`        |
| `disabled`           | `disabled`            | Disables every button in the group.                                     | `boolean`                                                                                                                                        | `false`        |
| `fullWidth`          | `full-width`          | Expands the group, and its buttons, to the full width of the container. | `boolean`                                                                                                                                        | `false`        |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the container.                             | `string \| { [x: string]: string; }`                                                                                                             | `undefined`    |
| `orientation`        | `orientation`         | Lays the actions out in a row, or stacks them.                          | `"horizontal" \| "vertical"`                                                                                                                     | `'horizontal'` |
| `size`               | `size`                | Size shared by every button.                                            | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `undefined`    |
| `variant`            | `variant`             | Colour variant shared by every button.                                  | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `undefined`    |
| `xId`                | `x-id`                | Id applied to the rendered container.                                   | `string`                                                                                                                                         | `undefined`    |


## Slots

| Slot | Description                                                                |
| ---- | -------------------------------------------------------------------------- |
|      | The `ss-button` children. Other elements are laid out but not coordinated. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
