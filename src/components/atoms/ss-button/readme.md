# ss-button



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                                                            | Type                                                                                                                                             | Default     |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `accessibilityLabel` | `accessibility-label` | Accessible label for screen readers; falls back to label.                                              | `string`                                                                                                                                         | `undefined` |
| `disableDuration`    | `disable-duration`    | Duration in milliseconds of the temporary disabled state (oneClick) or loading feedback after a click. | `number`                                                                                                                                         | `1000`      |
| `disabled`           | `disabled`            | Disables the button.                                                                                   | `boolean`                                                                                                                                        | `false`     |
| `fullWidth`          | `full-width`          | Expands the button to the full width of its container.                                                 | `boolean`                                                                                                                                        | `false`     |
| `iconPosition`       | `icon-position`       | Position of the icon slot relative to the label: left, right or only (hides the label).                | `"left" \| "only" \| "right"`                                                                                                                    | `'right'`   |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the button element.                                                       | `string \| { [x: string]: string; }`                                                                                                             | `undefined` |
| `label`              | `label`               | Text rendered inside the button when no slot content is provided; also the aria-label fallback.        | `string`                                                                                                                                         | `undefined` |
| `loading`            | `loading`             | Shows the loading state and disables the button.                                                       | `boolean`                                                                                                                                        | `false`     |
| `oneClick`           | `one-click`           | After ssClick fires, button is disabled for disableDuration ms                                         | `boolean`                                                                                                                                        | `true`      |
| `shape`              | `shape`               | Shape of the button: rounded, pill, circle or square.                                                  | `"circle" \| "pill" \| "rounded" \| "square"`                                                                                                    | `'rounded'` |
| `size`               | `size`                | Size of the button.                                                                                    | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'md'`      |
| `status`             | `status`              | Button status: active, disabled or loading; disabled and loading also disable the button.              | `"active" \| "disabled" \| "loading"`                                                                                                            | `'active'`  |
| `type`               | `type`                | Native button type: button, submit or reset.                                                           | `"button" \| "reset" \| "submit"`                                                                                                                | `'button'`  |
| `variant`            | `variant`             | Color variant of the button.                                                                           | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `xId`                | `x-id`                | Id applied to the button element; emitted as the ssClick detail.                                       | `string`                                                                                                                                         | `undefined` |
| `xStyle`             | `x-style`             | Visual style: solid, outline or ghost.                                                                 | `"ghost" \| "outline" \| "solid"`                                                                                                                | `'solid'`   |


## Events

| Event     | Description                                                          | Type                  |
| --------- | -------------------------------------------------------------------- | --------------------- |
| `ssClick` | Emitted when the button is clicked while enabled; detail is the xId. | `CustomEvent<string>` |


## Slots

| Slot     | Description                                 |
| -------- | ------------------------------------------- |
| `"icon"` | Icon slot (left, right, or icon-only mode). |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
