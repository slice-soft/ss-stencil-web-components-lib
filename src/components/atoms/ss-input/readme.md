# ss-input



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                                   | Type                                                                                                                                                           | Default     |
| -------------------- | --------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `accessibilityLabel` | `accessibility-label` | Accessible label for screen readers.                                          | `string`                                                                                                                                                       | `undefined` |
| `autocomplete`       | `autocomplete`        | Native autocomplete attribute of the input.                                   | `string`                                                                                                                                                       | `undefined` |
| `color`              | `color`               | Color variant of the input.                                                   | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"`               | `'primary'` |
| `describedBy`        | `described-by`        | Id of the element that describes the input, set as aria-describedby.          | `string`                                                                                                                                                       | `undefined` |
| `disabled`           | `disabled`            | Disables the input.                                                           | `boolean`                                                                                                                                                      | `false`     |
| `fullWidth`          | `full-width`          | Expands the input to the full width of its container.                         | `boolean`                                                                                                                                                      | `false`     |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the input element.                               | `string \| { [x: string]: string; }`                                                                                                                           | `undefined` |
| `invalid`            | `invalid`             | Applies error styling and sets aria-invalid without changing native validity. | `boolean`                                                                                                                                                      | `false`     |
| `max`                | `max`                 | Maximum value for numeric and date inputs.                                    | `string`                                                                                                                                                       | `undefined` |
| `maxLength`          | `max-length`          | Maximum number of characters allowed.                                         | `number`                                                                                                                                                       | `undefined` |
| `min`                | `min`                 | Minimum value for numeric and date inputs.                                    | `string`                                                                                                                                                       | `undefined` |
| `minLength`          | `min-length`          | Minimum number of characters allowed.                                         | `number`                                                                                                                                                       | `undefined` |
| `name`               | `name`                | Name of the native input for form submission.                                 | `string`                                                                                                                                                       | `undefined` |
| `placeholder`        | `placeholder`         | Placeholder text shown when the input is empty.                               | `string`                                                                                                                                                       | `undefined` |
| `readonly`           | `readonly`            | Makes the input read-only.                                                    | `boolean`                                                                                                                                                      | `false`     |
| `required`           | `required`            | Marks the input as required for form validation.                              | `boolean`                                                                                                                                                      | `false`     |
| `size`               | `size`                | Size of the input.                                                            | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                                       | `'md'`      |
| `step`               | `step`                | Step granularity for numeric and date inputs.                                 | `string`                                                                                                                                                       | `undefined` |
| `type`               | `type`                | Native input type.                                                            | `"date" \| "datetime-local" \| "email" \| "file" \| "hidden" \| "month" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "time" \| "url" \| "week"` | `'text'`    |
| `value`              | `value`               | Current value of the input.                                                   | `string`                                                                                                                                                       | `undefined` |
| `xId`                | `x-id`                | Id applied to the native input; also included in event details.               | `string`                                                                                                                                                       | `undefined` |
| `xStyle`             | `x-style`             | Visual style of the input.                                                    | `"outline" \| "solid" \| "underline"`                                                                                                                          | `'solid'`   |


## Events

| Event       | Description                                                          | Type                                            |
| ----------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `ssBlur`    | Emitted when the input loses focus; detail is the native FocusEvent. | `CustomEvent<FocusEvent>`                       |
| `ssChange`  | Emitted on native change events; detail contains xId and value.      | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssFocus`   | Emitted when the input gains focus; detail is the native FocusEvent. | `CustomEvent<FocusEvent>`                       |
| `ssInput`   | Emitted on native input events; detail contains xId and value.       | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssInvalid` | Emitted on native invalid events; detail contains xId and value.     | `CustomEvent<{ xId?: string; value: string; }>` |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
