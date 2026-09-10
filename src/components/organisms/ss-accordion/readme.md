# ss-accordion



<!-- Auto Generated Below -->


## Overview

A stack of `ss-accordion-item` sections.

By default one section is open at a time: opening a section closes the one
that was open, so the reader is never left with a column of expanded text
to find their place in. `multiple` lets several stay open.

The arrow keys move between headers — Up and Down, wrapping, with Home and
End — which the WAI-ARIA accordion pattern suggests for a long stack. Tab
still goes through the headers and into each open section in page order;
the arrows are a shortcut, not a replacement.

## Properties

| Property       | Attribute       | Description                                 | Type                                 | Default     |
| -------------- | --------------- | ------------------------------------------- | ------------------------------------ | ----------- |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the container. | `string \| { [x: string]: string; }` | `undefined` |
| `multiple`     | `multiple`      | Lets several sections stay open at once.    | `boolean`                            | `false`     |
| `xId`          | `x-id`          | Id applied to the container.                | `string`                             | `undefined` |


## Slots

| Slot | Description                       |
| ---- | --------------------------------- |
|      | The `ss-accordion-item` sections. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
