# ss-nav



<!-- Auto Generated Below -->


## Overview

A site's navigation: a named landmark holding a list of links, one of them
marked as the page the reader is on.

Every item is a real link, so it opens in a new tab, can be copied, and is
reached by Tab like any other — site navigation is not an application menu,
and giving it menu roles would take those away and change what the keys do.

An app that routes on the client listens for `ssChange` and calls
`preventDefault()` on it: the browser then does not follow the link, and the
app routes instead. The current item moves either way. A modified click —
Ctrl, Cmd, Shift or Alt, which the reader uses to open a new tab or window —
is left to the browser and changes nothing here.

## Properties

| Property             | Attribute             | Description                                                                                                      | Type                                 | Default        |
| -------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------- |
| `accessibilityLabel` | `accessibility-label` | Accessible name for the landmark, so a page with two navigations tells them apart.                               | `string`                             | `'Main'`       |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the navigation element.                                                             | `string \| { [x: string]: string; }` | `undefined`    |
| `orientation`        | `orientation`         | Direction the items run in.                                                                                      | `"horizontal" \| "vertical"`         | `'horizontal'` |
| `value`              | `value`               | Value of the current item, marked as the page the reader is on. Updated when an item is followed, and reflected. | `string`                             | `undefined`    |
| `xId`                | `x-id`                | Id applied to the navigation element; also included in the ssChange detail.                                      | `string`                             | `undefined`    |


## Events

| Event      | Description                                                                                                             | Type                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `ssChange` | Emitted when an item is followed; detail contains xId, the item's value and its href. Cancel it to route on the client. | `CustomEvent<SsNavChangeEvent>` |


## Slots

| Slot | Description                        |
| ---- | ---------------------------------- |
|      | The `ss-nav-item` links, in order. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
