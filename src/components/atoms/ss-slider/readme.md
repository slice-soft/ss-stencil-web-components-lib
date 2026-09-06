# ss-slider



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                                  | Type                                                                                                                                             | Default     |
| -------------------- | --------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `accessibilityLabel` | `accessibility-label` | Accessible label for screen readers.                                         | `string`                                                                                                                                         | `undefined` |
| `color`              | `color`               | Color variant of the slider.                                                 | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `describedBy`        | `described-by`        | Id of the element that describes the slider, set as aria-describedby.        | `string`                                                                                                                                         | `undefined` |
| `disabled`           | `disabled`            | Disables the slider.                                                         | `boolean`                                                                                                                                        | `false`     |
| `fullWidth`          | `full-width`          | Expands the slider to the full width of its container.                       | `boolean`                                                                                                                                        | `false`     |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the wrapper element.                            | `string \| { [x: string]: string; }`                                                                                                             | `undefined` |
| `invalid`            | `invalid`             | Applies error styling and sets aria-invalid.                                 | `boolean`                                                                                                                                        | `false`     |
| `max`                | `max`                 | Maximum value.                                                               | `number`                                                                                                                                         | `100`       |
| `min`                | `min`                 | Minimum value.                                                               | `number`                                                                                                                                         | `0`         |
| `name`               | `name`                | Name of the native input for form submission.                                | `string`                                                                                                                                         | `undefined` |
| `readonly`           | `readonly`            | Prevents changing the value while keeping the slider focusable.              | `boolean`                                                                                                                                        | `false`     |
| `showValue`          | `show-value`          | Renders the current value next to the slider.                                | `boolean`                                                                                                                                        | `false`     |
| `size`               | `size`                | Size of the slider.                                                          | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'md'`      |
| `step`               | `step`                | Step granularity of the value.                                               | `number`                                                                                                                                         | `1`         |
| `value`              | `value`               | Current value of the slider; updated on user interaction.                    | `number`                                                                                                                                         | `0`         |
| `valueLabel`         | `value-label`         | Custom text rendered instead of the numeric value when showValue is enabled. | `string`                                                                                                                                         | `undefined` |
| `xId`                | `x-id`                | Id applied to the native range input; also included in event details.        | `string`                                                                                                                                         | `undefined` |


## Events

| Event       | Description                                                                         | Type                                                           |
| ----------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `ssBlur`    | Emitted when the slider loses focus; detail is the native FocusEvent.               | `CustomEvent<FocusEvent>`                                      |
| `ssChange`  | Emitted on native change events; detail contains xId, name and value.               | `CustomEvent<{ xId?: string; name?: string; value: number; }>` |
| `ssFocus`   | Emitted when the slider gains focus; detail is the native FocusEvent.               | `CustomEvent<FocusEvent>`                                      |
| `ssInput`   | Emitted on native input events while dragging; detail contains xId, name and value. | `CustomEvent<{ xId?: string; name?: string; value: number; }>` |
| `ssInvalid` | Emitted on native invalid events; detail contains xId, name and value.              | `CustomEvent<{ xId?: string; name?: string; value: number; }>` |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
