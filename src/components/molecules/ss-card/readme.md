# ss-card



<!-- Auto Generated Below -->


## Overview

A surface that groups related content, with optional media, header and footer
regions around it.

It is layout only: no elevation logic, no click behaviour and no events. A
card that should act as a link or a button holds one in its content, so the
accessible role stays on the element that actually has it; a clickable
container would have to invent the keyboard and role semantics that
`ss-button` and `ss-link` already provide.

Each region collapses when nothing is slotted into it, so an unused header
leaves no gap and draws no divider.

## Properties

| Property       | Attribute       | Description                                                                 | Type                                   | Default      |
| -------------- | --------------- | --------------------------------------------------------------------------- | -------------------------------------- | ------------ |
| `fullWidth`    | `full-width`    | Expands the card to the full width of its container.                        | `boolean`                              | `false`      |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the container.                                 | `string \| { [x: string]: string; }`   | `undefined`  |
| `padding`      | `padding`       | Inner spacing applied to the header, content and footer regions.            | `"lg" \| "md" \| "none" \| "sm"`       | `'md'`       |
| `xId`          | `x-id`          | Id applied to the rendered container.                                       | `string`                               | `undefined`  |
| `xStyle`       | `x-style`       | Visual style: raised off the page, outlined, or filled with a surface tone. | `"elevated" \| "filled" \| "outlined"` | `'elevated'` |


## Slots

| Slot       | Description                                           |
| ---------- | ----------------------------------------------------- |
|            | The card's content.                                   |
| `"footer"` | Actions or metadata below the content.                |
| `"header"` | A title row above the content.                        |
| `"media"`  | Full-bleed media above the content, such as an image. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
