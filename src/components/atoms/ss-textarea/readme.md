# ss-textarea



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                             | Type                                                                                                                                             | Default      |
| -------------------- | --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `accessibilityLabel` | `accessibility-label` | Accessible label for screen readers.                                    | `string`                                                                                                                                         | `undefined`  |
| `color`              | `color`               | Color variant of the textarea.                                          | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'`  |
| `cols`               | `cols`                | Native cols attribute: visible width in characters.                     | `number`                                                                                                                                         | `undefined`  |
| `describedBy`        | `described-by`        | Id of the element that describes the textarea, set as aria-describedby. | `string`                                                                                                                                         | `undefined`  |
| `disabled`           | `disabled`            | Disables the textarea.                                                  | `boolean`                                                                                                                                        | `false`      |
| `fullWidth`          | `full-width`          | Expands the textarea to the full width of its container.                | `boolean`                                                                                                                                        | `false`      |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the textarea element.                      | `string \| { [x: string]: string; }`                                                                                                             | `undefined`  |
| `invalid`            | `invalid`             | Applies error styling and sets aria-invalid.                            | `boolean`                                                                                                                                        | `false`      |
| `maxLength`          | `max-length`          | Maximum number of characters allowed.                                   | `number`                                                                                                                                         | `undefined`  |
| `minLength`          | `min-length`          | Minimum number of characters allowed.                                   | `number`                                                                                                                                         | `undefined`  |
| `name`               | `name`                | Name of the native textarea for form submission.                        | `string`                                                                                                                                         | `undefined`  |
| `placeholder`        | `placeholder`         | Placeholder text shown when the textarea is empty.                      | `string`                                                                                                                                         | `undefined`  |
| `readonly`           | `readonly`            | Makes the textarea read-only.                                           | `boolean`                                                                                                                                        | `false`      |
| `required`           | `required`            | Marks the textarea as required for form validation.                     | `boolean`                                                                                                                                        | `false`      |
| `resize`             | `resize`              | Allowed resize direction: none, vertical, horizontal or both.           | `"both" \| "horizontal" \| "none" \| "vertical"`                                                                                                 | `'vertical'` |
| `rows`               | `rows`                | Number of visible text rows.                                            | `number`                                                                                                                                         | `3`          |
| `size`               | `size`                | Size of the textarea.                                                   | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'md'`       |
| `value`              | `value`               | Current value of the textarea.                                          | `string`                                                                                                                                         | `undefined`  |
| `xId`                | `x-id`                | Id applied to the native textarea; also included in event details.      | `string`                                                                                                                                         | `undefined`  |
| `xStyle`             | `x-style`             | Visual style of the textarea.                                           | `"outline" \| "solid" \| "underline"`                                                                                                            | `'solid'`    |


## Events

| Event       | Description                                                             | Type                                            |
| ----------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| `ssBlur`    | Emitted when the textarea loses focus; detail is the native FocusEvent. | `CustomEvent<FocusEvent>`                       |
| `ssChange`  | Emitted on native change events; detail contains xId and value.         | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssFocus`   | Emitted when the textarea gains focus; detail is the native FocusEvent. | `CustomEvent<FocusEvent>`                       |
| `ssInput`   | Emitted on native input events; detail contains xId and value.          | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssInvalid` | Emitted on native invalid events; detail contains xId and value.        | `CustomEvent<{ xId?: string; value: string; }>` |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
