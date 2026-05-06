# ss-slider



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description | Type                                                                                                                                             | Default     |
| -------------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `accessibilityLabel` | `accessibility-label` |             | `string`                                                                                                                                         | `undefined` |
| `color`              | `color`               |             | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `describedBy`        | `described-by`        |             | `string`                                                                                                                                         | `undefined` |
| `disabled`           | `disabled`            |             | `boolean`                                                                                                                                        | `false`     |
| `fullWidth`          | `full-width`          |             | `boolean`                                                                                                                                        | `false`     |
| `inlineStyles`       | `inline-styles`       |             | `string \| { [x: string]: string; }`                                                                                                             | `undefined` |
| `invalid`            | `invalid`             |             | `boolean`                                                                                                                                        | `false`     |
| `max`                | `max`                 |             | `number`                                                                                                                                         | `100`       |
| `min`                | `min`                 |             | `number`                                                                                                                                         | `0`         |
| `name`               | `name`                |             | `string`                                                                                                                                         | `undefined` |
| `readonly`           | `readonly`            |             | `boolean`                                                                                                                                        | `false`     |
| `showValue`          | `show-value`          |             | `boolean`                                                                                                                                        | `false`     |
| `size`               | `size`                |             | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'md'`      |
| `step`               | `step`                |             | `number`                                                                                                                                         | `1`         |
| `value`              | `value`               |             | `number`                                                                                                                                         | `0`         |
| `valueLabel`         | `value-label`         |             | `string`                                                                                                                                         | `undefined` |
| `xId`                | `x-id`                |             | `string`                                                                                                                                         | `undefined` |


## Events

| Event       | Description | Type                                                           |
| ----------- | ----------- | -------------------------------------------------------------- |
| `ssBlur`    |             | `CustomEvent<FocusEvent>`                                      |
| `ssChange`  |             | `CustomEvent<{ xId?: string; name?: string; value: number; }>` |
| `ssFocus`   |             | `CustomEvent<FocusEvent>`                                      |
| `ssInput`   |             | `CustomEvent<{ xId?: string; name?: string; value: number; }>` |
| `ssInvalid` |             | `CustomEvent<{ xId?: string; name?: string; value: number; }>` |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
