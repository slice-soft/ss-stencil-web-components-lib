# ss-radio



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                                        | Type                                                     | Default     |
| -------------- | --------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------- |
| `checked`      | `checked`       | Whether this radio is the selected one; updated on user interaction and reflected as an attribute. | `boolean`                                                | `false`     |
| `describedBy`  | `described-by`  | Id of the element that describes the radio, set as aria-describedby.                               | `string`                                                 | `undefined` |
| `disabled`     | `disabled`      | Disables the radio.                                                                                | `boolean`                                                | `false`     |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the rendered label element.                                           | `string \| { [x: string]: string; }`                     | `undefined` |
| `invalid`      | `invalid`       | Applies error styling and sets aria-invalid.                                                       | `boolean`                                                | `false`     |
| `label`        | `label`         | Label text rendered when no slot content is provided.                                              | `string`                                                 | `undefined` |
| `name`         | `name`          | Name shared by the radios that form one group; what makes the browser treat them as a set.         | `string`                                                 | `undefined` |
| `readonly`     | `readonly`      | Prevents selection while still allowing focus and blur events.                                     | `boolean`                                                | `false`     |
| `required`     | `required`      | Marks the radio required; one required radio makes its whole native group required.                | `boolean`                                                | `false`     |
| `size`         | `size`          | Size of the radio.                                                                                 | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"` | `'md'`      |
| `value`        | `value`         | Value submitted with the form when this radio is the selected one.                                 | `string`                                                 | `undefined` |
| `xId`          | `x-id`          | Id applied to the native input; also included in event details.                                    | `string`                                                 | `undefined` |


## Events

| Event       | Description                                                                            | Type                                                                              |
| ----------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `ssBlur`    | Emitted when the radio loses focus; detail is the native FocusEvent.                   | `CustomEvent<FocusEvent>`                                                         |
| `ssChange`  | Emitted when the radio becomes selected; detail contains xId, name, value and checked. | `CustomEvent<{ xId?: string; name?: string; value?: string; checked: boolean; }>` |
| `ssFocus`   | Emitted when the radio gains focus; detail is the native FocusEvent.                   | `CustomEvent<FocusEvent>`                                                         |
| `ssInvalid` | Emitted on native invalid events; detail contains xId, name, value and checked.        | `CustomEvent<{ xId?: string; name?: string; value?: string; checked: boolean; }>` |


## Slots

| Slot | Description    |
| ---- | -------------- |
|      | Label content. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
