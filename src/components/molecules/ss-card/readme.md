# ss-card



<!-- Auto Generated Below -->


## Overview

A surface that groups related content, with optional media, header and footer
regions around it.

It is layout only, unless it has an `href`: then the whole card is one link.
The role stays on a real `<a>`, never on the container: the card renders one
link and stretches its hit area over itself, so a press anywhere follows it,
while buttons and links inside (`ss-button`, `ss-link`, `ss-dropdown`,
`ss-popover`, `a`, `button`, or any element marked `data-card-action`) are
lifted above it and keep doing their own thing. Only elements slotted
directly can be lifted: an action nested in a slotted wrapper needs
`data-card-action` on the wrapper.

The link is named by `accessibility-label`, else by the header, else by the
content. A client-side router listens for `ssNavigate` and calls
`preventDefault()`; a press with a modifier key is left to the browser.

Each region collapses when nothing is slotted into it, so an unused header
leaves no gap and draws no divider.

## Properties

| Property             | Attribute             | Description                                                                       | Type                                   | Default      |
| -------------------- | --------------------- | --------------------------------------------------------------------------------- | -------------------------------------- | ------------ |
| `accessibilityLabel` | `accessibility-label` | Accessible name of the link; by default the header names it, or else the content. | `string`                               | `undefined`  |
| `fullWidth`          | `full-width`          | Expands the card to the full width of its container.                              | `boolean`                              | `false`      |
| `href`               | `href`                | Makes the whole card a link to this address.                                      | `string`                               | `undefined`  |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the container.                                       | `string \| { [x: string]: string; }`   | `undefined`  |
| `padding`            | `padding`             | Inner spacing applied to the header, content and footer regions.                  | `"lg" \| "md" \| "none" \| "sm"`       | `'md'`       |
| `rel`                | `rel`                 | Relationship of the linked page, as on an anchor.                                 | `string`                               | `undefined`  |
| `target`             | `target`              | Where the link opens, as on an anchor.                                            | `string`                               | `undefined`  |
| `xId`                | `x-id`                | Id applied to the rendered container.                                             | `string`                               | `undefined`  |
| `xStyle`             | `x-style`             | Visual style: raised off the page, outlined, or filled with a surface tone.       | `"elevated" \| "filled" \| "outlined"` | `'elevated'` |


## Events

| Event        | Description                                                                                                                   | Type                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `ssNavigate` | Emitted on a plain press of a card with an `href`; cancelable — `preventDefault()` keeps the browser from following the link. | `CustomEvent<SsCardNavigateEvent>` |


## Slots

| Slot       | Description                                           |
| ---------- | ----------------------------------------------------- |
|            | The card's content.                                   |
| `"footer"` | Actions or metadata below the content.                |
| `"header"` | A title row above the content.                        |
| `"media"`  | Full-bleed media above the content, such as an image. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
