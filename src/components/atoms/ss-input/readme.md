# ss-input



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type                                                                                                                                                           | Default     |
| -------------- | --------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `color`        | `color`         |             | `"error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"`                                                        | `'primary'` |
| `disabled`     | `disabled`      |             | `boolean`                                                                                                                                                      | `false`     |
| `fullWidth`    | `full-width`    |             | `boolean`                                                                                                                                                      | `false`     |
| `inlineStyles` | `inline-styles` |             | `string \| { [x: string]: string; }`                                                                                                                           | `undefined` |
| `name`         | `name`          |             | `string`                                                                                                                                                       | `undefined` |
| `placeholder`  | `placeholder`   |             | `string`                                                                                                                                                       | `undefined` |
| `required`     | `required`      |             | `boolean`                                                                                                                                                      | `false`     |
| `size`         | `size`          |             | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                                       | `'md'`      |
| `type`         | `type`          |             | `"date" \| "datetime-local" \| "email" \| "file" \| "hidden" \| "month" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "time" \| "url" \| "week"` | `'text'`    |
| `value`        | `value`         |             | `string`                                                                                                                                                       | `undefined` |
| `xId`          | `x-id`          |             | `string`                                                                                                                                                       | `undefined` |
| `xStyle`       | `x-style`       |             | `"outline" \| "solid" \| "underline"`                                                                                                                          | `'solid'`   |


## Events

| Event                 | Description | Type                                            |
| --------------------- | ----------- | ----------------------------------------------- |
| `ssBlur`              |             | `CustomEvent<FocusEvent>`                       |
| `ssChange`            |             | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssClick`             |             | `CustomEvent<MouseEvent>`                       |
| `ssCompositionEnd`    |             | `CustomEvent<CompositionEvent>`                 |
| `ssCompositionStart`  |             | `CustomEvent<CompositionEvent>`                 |
| `ssCompositionUpdate` |             | `CustomEvent<CompositionEvent>`                 |
| `ssContextMenu`       |             | `CustomEvent<MouseEvent>`                       |
| `ssCopy`              |             | `CustomEvent<ClipboardEvent>`                   |
| `ssCut`               |             | `CustomEvent<ClipboardEvent>`                   |
| `ssDoubleClick`       |             | `CustomEvent<MouseEvent>`                       |
| `ssDrag`              |             | `CustomEvent<DragEvent>`                        |
| `ssDragEnd`           |             | `CustomEvent<DragEvent>`                        |
| `ssDragEnter`         |             | `CustomEvent<DragEvent>`                        |
| `ssDragLeave`         |             | `CustomEvent<DragEvent>`                        |
| `ssDragOver`          |             | `CustomEvent<DragEvent>`                        |
| `ssDragStart`         |             | `CustomEvent<DragEvent>`                        |
| `ssDrop`              |             | `CustomEvent<DragEvent>`                        |
| `ssFocus`             |             | `CustomEvent<FocusEvent>`                       |
| `ssFocusIn`           |             | `CustomEvent<FocusEvent>`                       |
| `ssFocusOut`          |             | `CustomEvent<FocusEvent>`                       |
| `ssInput`             |             | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssInvalid`           |             | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssKeyDown`           |             | `CustomEvent<KeyboardEvent>`                    |
| `ssKeyPress`          |             | `CustomEvent<KeyboardEvent>`                    |
| `ssKeyUp`             |             | `CustomEvent<KeyboardEvent>`                    |
| `ssMouseDown`         |             | `CustomEvent<MouseEvent>`                       |
| `ssMouseEnter`        |             | `CustomEvent<MouseEvent>`                       |
| `ssMouseLeave`        |             | `CustomEvent<MouseEvent>`                       |
| `ssMouseMove`         |             | `CustomEvent<MouseEvent>`                       |
| `ssMouseOut`          |             | `CustomEvent<MouseEvent>`                       |
| `ssMouseOver`         |             | `CustomEvent<MouseEvent>`                       |
| `ssMouseUp`           |             | `CustomEvent<MouseEvent>`                       |
| `ssPaste`             |             | `CustomEvent<ClipboardEvent>`                   |
| `ssSelect`            |             | `CustomEvent<Event>`                            |
| `ssTouchCancel`       |             | `CustomEvent<TouchEvent>`                       |
| `ssTouchEnd`          |             | `CustomEvent<TouchEvent>`                       |
| `ssTouchMove`         |             | `CustomEvent<TouchEvent>`                       |
| `ssTouchStart`        |             | `CustomEvent<TouchEvent>`                       |
| `ssWheel`             |             | `CustomEvent<WheelEvent>`                       |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
