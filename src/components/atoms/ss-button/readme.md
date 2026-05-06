# ss-button



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                    | Type                                                                                                                                             | Default     |
| -------------------- | --------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `accessibilityLabel` | `accessibility-label` |                                                                | `string`                                                                                                                                         | `undefined` |
| `disableDuration`    | `disable-duration`    |                                                                | `number`                                                                                                                                         | `1000`      |
| `disabled`           | `disabled`            |                                                                | `boolean`                                                                                                                                        | `false`     |
| `fullWidth`          | `full-width`          |                                                                | `boolean`                                                                                                                                        | `false`     |
| `iconPosition`       | `icon-position`       |                                                                | `"left" \| "only" \| "right"`                                                                                                                    | `'right'`   |
| `inlineStyles`       | `inline-styles`       |                                                                | `string \| { [x: string]: string; }`                                                                                                             | `undefined` |
| `label`              | `label`               |                                                                | `string`                                                                                                                                         | `undefined` |
| `loading`            | `loading`             |                                                                | `boolean`                                                                                                                                        | `false`     |
| `oneClick`           | `one-click`           | After ssClick fires, button is disabled for disableDuration ms | `boolean`                                                                                                                                        | `true`      |
| `shape`              | `shape`               |                                                                | `"circle" \| "pill" \| "rounded" \| "square"`                                                                                                    | `'rounded'` |
| `size`               | `size`                |                                                                | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'md'`      |
| `status`             | `status`              |                                                                | `"active" \| "disabled" \| "loading"`                                                                                                            | `'active'`  |
| `type`               | `type`                |                                                                | `"button" \| "reset" \| "submit"`                                                                                                                | `'button'`  |
| `variant`            | `variant`             |                                                                | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `xId`                | `x-id`                |                                                                | `string`                                                                                                                                         | `undefined` |
| `xStyle`             | `x-style`             |                                                                | `"ghost" \| "outline" \| "solid"`                                                                                                                | `'solid'`   |


## Events

| Event     | Description | Type                  |
| --------- | ----------- | --------------------- |
| `ssClick` |             | `CustomEvent<string>` |


## Slots

| Slot     | Description                                 |
| -------- | ------------------------------------------- |
| `"icon"` | Icon slot (left, right, or icon-only mode). |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
