# ss-combobox



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                                                        | Type                                                                                                                                             | Default     |
| -------------------- | --------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `accessibilityLabel` | `accessibility-label` | Accessible label for screen readers.                                                               | `string`                                                                                                                                         | `undefined` |
| `autocomplete`       | `autocomplete`        | Native autocomplete attribute of the input.                                                        | `string`                                                                                                                                         | `undefined` |
| `color`              | `color`               | Color variant of the combobox.                                                                     | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `describedBy`        | `described-by`        | Id of the element that describes the input, set as aria-describedby.                               | `string`                                                                                                                                         | `undefined` |
| `disabled`           | `disabled`            | Disables the input.                                                                                | `boolean`                                                                                                                                        | `false`     |
| `fullWidth`          | `full-width`          | Expands the combobox to the full width of its container.                                           | `boolean`                                                                                                                                        | `false`     |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the wrapper element.                                                  | `string \| { [x: string]: string; }`                                                                                                             | `undefined` |
| `invalid`            | `invalid`             | Applies error styling and sets aria-invalid.                                                       | `boolean`                                                                                                                                        | `false`     |
| `listId`             | `list-id`             | Custom id for the internal datalist; defaults to xId-list or a generated id.                       | `string`                                                                                                                                         | `undefined` |
| `maxLength`          | `max-length`          | Maximum number of characters allowed.                                                              | `number`                                                                                                                                         | `undefined` |
| `minLength`          | `min-length`          | Minimum number of characters allowed.                                                              | `number`                                                                                                                                         | `undefined` |
| `name`               | `name`                | Name of the native input for form submission.                                                      | `string`                                                                                                                                         | `undefined` |
| `placeholder`        | `placeholder`         | Placeholder text shown when the input is empty.                                                    | `string`                                                                                                                                         | `undefined` |
| `readonly`           | `readonly`            | Makes the input read-only.                                                                         | `boolean`                                                                                                                                        | `false`     |
| `required`           | `required`            | Marks the input as required for form validation.                                                   | `boolean`                                                                                                                                        | `false`     |
| `size`               | `size`                | Size of the combobox.                                                                              | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'md'`      |
| `value`              | `value`               | Current value of the input.                                                                        | `string`                                                                                                                                         | `undefined` |
| `xId`                | `x-id`                | Id applied to the native input; also included in event details and used to derive the datalist id. | `string`                                                                                                                                         | `undefined` |
| `xStyle`             | `x-style`             | Visual style of the input field.                                                                   | `"outline" \| "solid" \| "underline"`                                                                                                            | `'solid'`   |


## Events

| Event       | Description                                                                | Type                                            |
| ----------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| `ssBlur`    | Emitted when the input loses focus; detail is the native FocusEvent.       | `CustomEvent<FocusEvent>`                       |
| `ssChange`  | Emitted on native change events; detail contains xId and value.            | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssFocus`   | Emitted when the input gains focus; detail is the native FocusEvent.       | `CustomEvent<FocusEvent>`                       |
| `ssInput`   | Emitted on native input events; detail contains xId and the current value. | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssInvalid` | Emitted on native invalid events; detail contains xId and value.           | `CustomEvent<{ xId?: string; value: string; }>` |


## Slots

| Slot | Description                                       |
| ---- | ------------------------------------------------- |
|      | Native option elements for the internal datalist. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
