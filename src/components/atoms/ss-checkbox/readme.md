# ss-checkbox



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute       | Description                                                                                 | Type                                                     | Default     |
| --------------- | --------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------- |
| `checked`       | `checked`       | Whether the checkbox is checked; updated on user interaction and reflected as an attribute. | `boolean`                                                | `false`     |
| `describedBy`   | `described-by`  | Id of the element that describes the checkbox, set as aria-describedby.                     | `string`                                                 | `undefined` |
| `disabled`      | `disabled`      | Disables the checkbox.                                                                      | `boolean`                                                | `false`     |
| `indeterminate` | `indeterminate` | Shows the indeterminate state; cleared when the user toggles the checkbox.                  | `boolean`                                                | `false`     |
| `inlineStyles`  | `inline-styles` | Inline CSS styles applied to the root label element.                                        | `string \| { [x: string]: string; }`                     | `undefined` |
| `invalid`       | `invalid`       | Applies error styling and sets aria-invalid.                                                | `boolean`                                                | `false`     |
| `label`         | `label`         | Label text rendered when no slot content is provided.                                       | `string`                                                 | `undefined` |
| `name`          | `name`          | Name of the native input for form submission.                                               | `string`                                                 | `undefined` |
| `readonly`      | `readonly`      | Prevents changes to the checked state while still allowing focus and blur events.           | `boolean`                                                | `false`     |
| `required`      | `required`      | Marks the checkbox as required for form validation.                                         | `boolean`                                                | `false`     |
| `size`          | `size`          | Size of the checkbox.                                                                       | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"` | `'md'`      |
| `value`         | `value`         | Value of the native input sent on form submission.                                          | `string`                                                 | `undefined` |
| `xId`           | `x-id`          | Id applied to the native input; also included in event details.                             | `string`                                                 | `undefined` |


## Events

| Event       | Description                                                                           | Type                                                                              |
| ----------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `ssBlur`    | Emitted when the checkbox loses focus; detail is the native FocusEvent.               | `CustomEvent<FocusEvent>`                                                         |
| `ssChange`  | Emitted when the checked state changes; detail contains xId, name, value and checked. | `CustomEvent<{ xId?: string; name?: string; value?: string; checked: boolean; }>` |
| `ssFocus`   | Emitted when the checkbox gains focus; detail is the native FocusEvent.               | `CustomEvent<FocusEvent>`                                                         |
| `ssInvalid` | Emitted on native invalid events; detail contains xId, name, value and checked.       | `CustomEvent<{ xId?: string; name?: string; value?: string; checked: boolean; }>` |


## Slots

| Slot | Description    |
| ---- | -------------- |
|      | Label content. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
