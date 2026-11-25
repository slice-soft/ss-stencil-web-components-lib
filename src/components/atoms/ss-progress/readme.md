# ss-progress



<!-- Auto Generated Below -->


## Overview

How far along something is: a bar or a circle, with a value, or
indeterminate when the value is not known.

It only shows. Whoever hosts it owns the number and when it changes.

## Properties

| Property       | Attribute       | Description                                                                           | Type                                                                                                                                                                        | Default      |
| -------------- | --------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `color`        | `color`         | Color of the fill.                                                                    | `"brand" \| "default" \| "destructive" \| "error" \| "foreground" \| "info" \| "muted" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'`  |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the root element.                                        | `string \| { [x: string]: string; }`                                                                                                                                        | `undefined`  |
| `label`        | `label`         | Accessible name. Translate it.                                                        | `string`                                                                                                                                                                    | `'Progress'` |
| `labelledBy`   | `labelled-by`   | Id of an element in the page that names it; wins over `label`.                        | `string`                                                                                                                                                                    | `undefined`  |
| `max`          | `max`           | The value that means done. Non-positive values fall back to 100.                      | `number`                                                                                                                                                                    | `100`        |
| `shape`        | `shape`         | A horizontal bar or a circle.                                                         | `"bar" \| "circle"`                                                                                                                                                         | `'bar'`      |
| `showValue`    | `show-value`    | Draws the rounded percentage (or `value-text`) next to the bar, or inside the circle. | `boolean`                                                                                                                                                                   | `false`      |
| `size`         | `size`          | Thickness of the bar, or diameter of the circle.                                      | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                                                    | `'md'`       |
| `value`        | `value`         | Current value, from 0 to `max`. Absent: indeterminate.                                | `number`                                                                                                                                                                    | `undefined`  |
| `valueText`    | `value-text`    | Read instead of the percentage, such as "3 of 10 files".                              | `string`                                                                                                                                                                    | `undefined`  |
| `xId`          | `x-id`          | Id applied to the progressbar element.                                                | `string`                                                                                                                                                                    | `undefined`  |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
