# ss-tooltip



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                                           | Type                                     | Default     |
| -------------- | --------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------- |
| `content`      | `content`       | Tooltip text rendered when no default slot content is provided.                                       | `string`                                 | `undefined` |
| `disabled`     | `disabled`      | Disables the tooltip; it stays closed and ignores interactions.                                       | `boolean`                                | `false`     |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the root element.                                                        | `string \| { [x: string]: string; }`     | `undefined` |
| `open`         | `open`          | Whether the tooltip is open; updated by hover and click interactions and reflected as an attribute.   | `boolean`                                | `false`     |
| `placement`    | `placement`     | Placement relative to the trigger: top, right, bottom or left.                                        | `"bottom" \| "left" \| "right" \| "top"` | `'top'`     |
| `trigger`      | `trigger`       | Interaction that toggles the tooltip: hover (also focus), click, or manual (controlled through open). | `"click" \| "hover" \| "manual"`         | `'hover'`   |
| `xId`          | `x-id`          | Id applied to the root element; also included in the ssOpenChange detail.                             | `string`                                 | `undefined` |


## Events

| Event          | Description                                                                                                                 | Type                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `ssOpenChange` | Emitted when an interaction changes the open state, not when the open prop is set externally; detail contains xId and open. | `CustomEvent<{ xId?: string; open: boolean; }>` |


## Slots

| Slot        | Description              |
| ----------- | ------------------------ |
|             | Tooltip content.         |
| `"trigger"` | Tooltip trigger content. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
