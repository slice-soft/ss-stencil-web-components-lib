# ss-input



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description | Type                                                                                                                                                           | Default     |
| -------------------- | --------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `accessibilityLabel` | `accessibility-label` |             | `string`                                                                                                                                                       | `undefined` |
| `autocomplete`       | `autocomplete`        |             | `string`                                                                                                                                                       | `undefined` |
| `color`              | `color`               |             | `"error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"`                                                        | `'primary'` |
| `describedBy`        | `described-by`        |             | `string`                                                                                                                                                       | `undefined` |
| `disabled`           | `disabled`            |             | `boolean`                                                                                                                                                      | `false`     |
| `fullWidth`          | `full-width`          |             | `boolean`                                                                                                                                                      | `false`     |
| `inlineStyles`       | `inline-styles`       |             | `string \| { [x: string]: string; }`                                                                                                                           | `undefined` |
| `invalid`            | `invalid`             |             | `boolean`                                                                                                                                                      | `false`     |
| `max`                | `max`                 |             | `string`                                                                                                                                                       | `undefined` |
| `maxLength`          | `max-length`          |             | `number`                                                                                                                                                       | `undefined` |
| `min`                | `min`                 |             | `string`                                                                                                                                                       | `undefined` |
| `minLength`          | `min-length`          |             | `number`                                                                                                                                                       | `undefined` |
| `name`               | `name`                |             | `string`                                                                                                                                                       | `undefined` |
| `placeholder`        | `placeholder`         |             | `string`                                                                                                                                                       | `undefined` |
| `readonly`           | `readonly`            |             | `boolean`                                                                                                                                                      | `false`     |
| `required`           | `required`            |             | `boolean`                                                                                                                                                      | `false`     |
| `size`               | `size`                |             | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                                       | `'md'`      |
| `step`               | `step`                |             | `string`                                                                                                                                                       | `undefined` |
| `type`               | `type`                |             | `"date" \| "datetime-local" \| "email" \| "file" \| "hidden" \| "month" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "time" \| "url" \| "week"` | `'text'`    |
| `value`              | `value`               |             | `string`                                                                                                                                                       | `undefined` |
| `xId`                | `x-id`                |             | `string`                                                                                                                                                       | `undefined` |
| `xStyle`             | `x-style`             |             | `"outline" \| "solid" \| "underline"`                                                                                                                          | `'solid'`   |


## Events

| Event       | Description | Type                                            |
| ----------- | ----------- | ----------------------------------------------- |
| `ssBlur`    |             | `CustomEvent<FocusEvent>`                       |
| `ssChange`  |             | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssFocus`   |             | `CustomEvent<FocusEvent>`                       |
| `ssInput`   |             | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssInvalid` |             | `CustomEvent<{ xId?: string; value: string; }>` |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
