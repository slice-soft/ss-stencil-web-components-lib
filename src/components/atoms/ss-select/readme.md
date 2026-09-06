# ss-select



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                                    | Type                                                                                                                                             | Default     |
| -------------------- | --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `accessibilityLabel` | `accessibility-label` | Accessible label for screen readers.                                           | `string`                                                                                                                                         | `undefined` |
| `color`              | `color`               | Color variant of the select.                                                   | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `describedBy`        | `described-by`        | Id of the element that describes the select, set as aria-describedby.          | `string`                                                                                                                                         | `undefined` |
| `disabled`           | `disabled`            | Disables the select.                                                           | `boolean`                                                                                                                                        | `false`     |
| `fullWidth`          | `full-width`          | Expands the select to the full width of its container.                         | `boolean`                                                                                                                                        | `false`     |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the select element.                               | `string \| { [x: string]: string; }`                                                                                                             | `undefined` |
| `invalid`            | `invalid`             | Applies error styling and sets aria-invalid.                                   | `boolean`                                                                                                                                        | `false`     |
| `multiple`           | `multiple`            | Allows selecting multiple options.                                             | `boolean`                                                                                                                                        | `false`     |
| `name`               | `name`                | Name of the native select for form submission.                                 | `string`                                                                                                                                         | `undefined` |
| `placeholder`        | `placeholder`         | Text of a disabled empty option rendered first; only in single-selection mode. | `string`                                                                                                                                         | `undefined` |
| `required`           | `required`            | Marks the select as required for form validation.                              | `boolean`                                                                                                                                        | `false`     |
| `size`               | `size`                | Size of the select.                                                            | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'md'`      |
| `value`              | `value`               | Selected value, or an array of values when multiple is enabled.                | `string \| string[]`                                                                                                                             | `undefined` |
| `xId`                | `x-id`                | Id applied to the native select; also included in event details.               | `string`                                                                                                                                         | `undefined` |
| `xStyle`             | `x-style`             | Visual style: solid, outline or underline.                                     | `"outline" \| "solid" \| "underline"`                                                                                                            | `'solid'`   |


## Events

| Event       | Description                                                                                                    | Type                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `ssBlur`    | Emitted when the select loses focus; detail is the native FocusEvent.                                          | `CustomEvent<FocusEvent>`                                                  |
| `ssChange`  | Emitted when the selection changes; detail contains xId, name and value (a string, or an array when multiple). | `CustomEvent<{ xId?: string; name?: string; value: string \| string[]; }>` |
| `ssFocus`   | Emitted when the select gains focus; detail is the native FocusEvent.                                          | `CustomEvent<FocusEvent>`                                                  |
| `ssInvalid` | Emitted on native invalid events; detail contains xId, name and value (a string, or an array when multiple).   | `CustomEvent<{ xId?: string; name?: string; value: string \| string[]; }>` |


## Slots

| Slot | Description                         |
| ---- | ----------------------------------- |
|      | Native option or optgroup elements. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
