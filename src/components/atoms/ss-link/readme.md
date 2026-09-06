# ss-link



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                                        | Type                                                                                                                                             | Default     |
| -------------------- | --------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `accessibilityLabel` | `accessibility-label` | Accessible label for screen readers; falls back to label.                          | `string`                                                                                                                                         | `undefined` |
| `current`            | `current`             | Value for aria-current, for example page.                                          | `string`                                                                                                                                         | `undefined` |
| `disabled`           | `disabled`            | Disables the link: removes href, blocks clicks and sets aria-disabled.             | `boolean`                                                                                                                                        | `false`     |
| `download`           | `download`            | Native download attribute; prompts a download instead of navigating.               | `string`                                                                                                                                         | `undefined` |
| `href`               | `href`                | Destination URL; omitted from the anchor while disabled.                           | `string`                                                                                                                                         | `undefined` |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the anchor element.                                   | `string \| { [x: string]: string; }`                                                                                                             | `undefined` |
| `label`              | `label`               | Link text rendered when no slot content is provided; also the aria-label fallback. | `string`                                                                                                                                         | `undefined` |
| `rel`                | `rel`                 | Custom rel attribute; defaults to noopener noreferrer when target is _blank.       | `string`                                                                                                                                         | `undefined` |
| `size`               | `size`                | Size of the link: sm, md or lg.                                                    | `"lg" \| "md" \| "sm"`                                                                                                                           | `'md'`      |
| `target`             | `target`              | Where to open the link: _self, _blank, _parent or _top.                            | `"_blank" \| "_parent" \| "_self" \| "_top"`                                                                                                     | `undefined` |
| `underline`          | `underline`           | Underline behavior: none, hover or always.                                         | `"always" \| "hover" \| "none"`                                                                                                                  | `'hover'`   |
| `variant`            | `variant`             | Color variant of the link.                                                         | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `xId`                | `x-id`                | Id applied to the anchor element; also included in the ssClick detail.             | `string`                                                                                                                                         | `undefined` |


## Events

| Event     | Description                                                                   | Type                                            |
| --------- | ----------------------------------------------------------------------------- | ----------------------------------------------- |
| `ssClick` | Emitted when the link is clicked while enabled; detail contains xId and href. | `CustomEvent<{ xId?: string; href?: string; }>` |


## Slots

| Slot | Description   |
| ---- | ------------- |
|      | Link content. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
