# ss-select



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description | Type                                                                                                    | Default     |
| -------------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------------- | ----------- |
| `accessibilityLabel` | `accessibility-label` |             | `string`                                                                                                | `undefined` |
| `color`              | `color`               |             | `"error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `describedBy`        | `described-by`        |             | `string`                                                                                                | `undefined` |
| `disabled`           | `disabled`            |             | `boolean`                                                                                               | `false`     |
| `fullWidth`          | `full-width`          |             | `boolean`                                                                                               | `false`     |
| `inlineStyles`       | `inline-styles`       |             | `string \| { [x: string]: string; }`                                                                    | `undefined` |
| `invalid`            | `invalid`             |             | `boolean`                                                                                               | `false`     |
| `multiple`           | `multiple`            |             | `boolean`                                                                                               | `false`     |
| `name`               | `name`                |             | `string`                                                                                                | `undefined` |
| `placeholder`        | `placeholder`         |             | `string`                                                                                                | `undefined` |
| `required`           | `required`            |             | `boolean`                                                                                               | `false`     |
| `size`               | `size`                |             | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                | `'md'`      |
| `value`              | `value`               |             | `string \| string[]`                                                                                    | `undefined` |
| `xId`                | `x-id`                |             | `string`                                                                                                | `undefined` |
| `xStyle`             | `x-style`             |             | `"outline" \| "solid" \| "underline"`                                                                   | `'solid'`   |


## Events

| Event       | Description | Type                                                                       |
| ----------- | ----------- | -------------------------------------------------------------------------- |
| `ssBlur`    |             | `CustomEvent<FocusEvent>`                                                  |
| `ssChange`  |             | `CustomEvent<{ xId?: string; name?: string; value: string \| string[]; }>` |
| `ssFocus`   |             | `CustomEvent<FocusEvent>`                                                  |
| `ssInvalid` |             | `CustomEvent<{ xId?: string; name?: string; value: string \| string[]; }>` |


## Slots

| Slot | Description                         |
| ---- | ----------------------------------- |
|      | Native option or optgroup elements. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
