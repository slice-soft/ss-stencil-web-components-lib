# ss-switch



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type                                                     | Default     |
| --------------- | ---------------- | ----------- | -------------------------------------------------------- | ----------- |
| `checked`       | `checked`        |             | `boolean`                                                | `false`     |
| `describedBy`   | `described-by`   |             | `string`                                                 | `undefined` |
| `disabled`      | `disabled`       |             | `boolean`                                                | `false`     |
| `inlineStyles`  | `inline-styles`  |             | `string \| { [x: string]: string; }`                     | `undefined` |
| `invalid`       | `invalid`        |             | `boolean`                                                | `false`     |
| `label`         | `label`          |             | `string`                                                 | `undefined` |
| `labelPosition` | `label-position` |             | `"end" \| "start"`                                       | `'end'`     |
| `name`          | `name`           |             | `string`                                                 | `undefined` |
| `readonly`      | `readonly`       |             | `boolean`                                                | `false`     |
| `required`      | `required`       |             | `boolean`                                                | `false`     |
| `size`          | `size`           |             | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"` | `'md'`      |
| `value`         | `value`          |             | `string`                                                 | `undefined` |
| `xId`           | `x-id`           |             | `string`                                                 | `undefined` |


## Events

| Event       | Description | Type                                                                              |
| ----------- | ----------- | --------------------------------------------------------------------------------- |
| `ssBlur`    |             | `CustomEvent<FocusEvent>`                                                         |
| `ssChange`  |             | `CustomEvent<{ xId?: string; name?: string; value?: string; checked: boolean; }>` |
| `ssFocus`   |             | `CustomEvent<FocusEvent>`                                                         |
| `ssInvalid` |             | `CustomEvent<{ xId?: string; name?: string; value?: string; checked: boolean; }>` |


## Slots

| Slot | Description    |
| ---- | -------------- |
|      | Label content. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
