# ss-avatar



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                              | Type                                            | Default     |
| -------------- | --------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------- |
| `alt`          | `alt`           | Alt text for the image; also used as the accessible label of the avatar.                 | `string`                                        | `undefined` |
| `initials`     | `initials`      | Initials shown as fallback when no image is available and no slot content is provided.   | `string`                                        | `undefined` |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the root element.                                           | `string \| { [x: string]: string; }`            | `undefined` |
| `loading`      | `loading`       | Native image loading behavior; lazy defers loading until the image is near the viewport. | `"eager" \| "lazy"`                             | `'lazy'`    |
| `shape`        | `shape`         | Shape of the avatar: circle, rounded or square.                                          | `"circle" \| "rounded" \| "square"`             | `'circle'`  |
| `size`         | `size`          | Size of the avatar.                                                                      | `"2xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"` | `'md'`      |
| `src`          | `src`           | Image URL to display; the fallback content is shown when omitted or when loading fails.  | `string`                                        | `undefined` |
| `xId`          | `x-id`          | Id applied to the root element; also included in event details.                          | `string`                                        | `undefined` |


## Events

| Event     | Description                                                             | Type                                           |
| --------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| `ssError` | Emitted when the image fails to load; detail contains xId and src.      | `CustomEvent<{ xId?: string; src?: string; }>` |
| `ssLoad`  | Emitted when the image loads successfully; detail contains xId and src. | `CustomEvent<{ xId?: string; src?: string; }>` |


## Slots

| Slot | Description                                  |
| ---- | -------------------------------------------- |
|      | Fallback content when no image is available. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
