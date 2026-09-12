# ss-badge



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                   | Type                                                                                                                                             | Default     |
| -------------- | --------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `disabled`     | `disabled`      | Applies the disabled styling and disables the dismiss button. | `boolean`                                                                                                                                        | `false`     |
| `dismissLabel` | `dismiss-label` | Accessible label for the dismiss button.                      | `string`                                                                                                                                         | `'Dismiss'` |
| `dismissible`  | `dismissible`   | Renders a dismiss button.                                     | `boolean`                                                                                                                                        | `false`     |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the rendered element.            | `string \| { [x: string]: string; }`                                                                                                             | `undefined` |
| `label`        | `label`         | Badge text rendered when no slot content is provided.         | `string`                                                                                                                                         | `undefined` |
| `pill`         | `pill`          | Rounds the badge into a pill.                                 | `boolean`                                                                                                                                        | `false`     |
| `size`         | `size`          | Size of the badge.                                            | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'sm'`      |
| `variant`      | `variant`       | Semantic colour of the badge.                                 | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `xId`          | `x-id`          | Id applied to the rendered element.                           | `string`                                                                                                                                         | `undefined` |
| `xStyle`       | `x-style`       | Visual style: a solid fill, a subtle tint, or an outline.     | `"outline" \| "solid" \| "subtle"`                                                                                                               | `'subtle'`  |


## Events

| Event       | Description                                                      | Type                             |
| ----------- | ---------------------------------------------------------------- | -------------------------------- |
| `ssDismiss` | Emitted when the dismiss button is pressed; detail contains xId. | `CustomEvent<{ xId?: string; }>` |


## Slots

| Slot     | Description            |
| -------- | ---------------------- |
|          | Badge content.         |
| `"icon"` | Optional leading icon. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
