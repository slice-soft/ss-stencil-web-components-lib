# ss-tooltip



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type                                     | Default     |
| -------------- | --------------- | ----------- | ---------------------------------------- | ----------- |
| `content`      | `content`       |             | `string`                                 | `undefined` |
| `disabled`     | `disabled`      |             | `boolean`                                | `false`     |
| `inlineStyles` | `inline-styles` |             | `string \| { [x: string]: string; }`     | `undefined` |
| `open`         | `open`          |             | `boolean`                                | `false`     |
| `placement`    | `placement`     |             | `"bottom" \| "left" \| "right" \| "top"` | `'top'`     |
| `trigger`      | `trigger`       |             | `"click" \| "hover" \| "manual"`         | `'hover'`   |
| `xId`          | `x-id`          |             | `string`                                 | `undefined` |


## Events

| Event          | Description | Type                                            |
| -------------- | ----------- | ----------------------------------------------- |
| `ssOpenChange` |             | `CustomEvent<{ xId?: string; open: boolean; }>` |


## Slots

| Slot        | Description              |
| ----------- | ------------------------ |
|             | Tooltip content.         |
| `"trigger"` | Tooltip trigger content. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
