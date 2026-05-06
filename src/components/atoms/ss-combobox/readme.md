# ss-combobox



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description | Type                                                                                                                                             | Default     |
| -------------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `accessibilityLabel` | `accessibility-label` |             | `string`                                                                                                                                         | `undefined` |
| `autocomplete`       | `autocomplete`        |             | `string`                                                                                                                                         | `undefined` |
| `color`              | `color`               |             | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `describedBy`        | `described-by`        |             | `string`                                                                                                                                         | `undefined` |
| `disabled`           | `disabled`            |             | `boolean`                                                                                                                                        | `false`     |
| `fullWidth`          | `full-width`          |             | `boolean`                                                                                                                                        | `false`     |
| `inlineStyles`       | `inline-styles`       |             | `string \| { [x: string]: string; }`                                                                                                             | `undefined` |
| `invalid`            | `invalid`             |             | `boolean`                                                                                                                                        | `false`     |
| `listId`             | `list-id`             |             | `string`                                                                                                                                         | `undefined` |
| `maxLength`          | `max-length`          |             | `number`                                                                                                                                         | `undefined` |
| `minLength`          | `min-length`          |             | `number`                                                                                                                                         | `undefined` |
| `name`               | `name`                |             | `string`                                                                                                                                         | `undefined` |
| `placeholder`        | `placeholder`         |             | `string`                                                                                                                                         | `undefined` |
| `readonly`           | `readonly`            |             | `boolean`                                                                                                                                        | `false`     |
| `required`           | `required`            |             | `boolean`                                                                                                                                        | `false`     |
| `size`               | `size`                |             | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'md'`      |
| `value`              | `value`               |             | `string`                                                                                                                                         | `undefined` |
| `xId`                | `x-id`                |             | `string`                                                                                                                                         | `undefined` |
| `xStyle`             | `x-style`             |             | `"outline" \| "solid" \| "underline"`                                                                                                            | `'solid'`   |


## Events

| Event       | Description | Type                                            |
| ----------- | ----------- | ----------------------------------------------- |
| `ssBlur`    |             | `CustomEvent<FocusEvent>`                       |
| `ssChange`  |             | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssFocus`   |             | `CustomEvent<FocusEvent>`                       |
| `ssInput`   |             | `CustomEvent<{ xId?: string; value: string; }>` |
| `ssInvalid` |             | `CustomEvent<{ xId?: string; value: string; }>` |


## Slots

| Slot | Description                                       |
| ---- | ------------------------------------------------- |
|      | Native option elements for the internal datalist. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
