# ss-skeleton



<!-- Auto Generated Below -->


## Overview

A placeholder that holds the place of content still loading, in roughly its
shape, and pulses slowly while it waits.

It is hidden from assistive technology: a placeholder has nothing to say.
Mark the region that is loading with `aria-busy="true"` instead, and remove
it when the content arrives.

The size comes from the layout around it or from `inlineStyles` (`width`,
`height`). Text lines are one line of the surrounding font tall, and the
last of several is shorter, as a paragraph's last line is.

## Properties

| Property       | Attribute       | Description                                                                                             | Type                                 | Default     |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------- |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the root element; `width` and `height` size it.                            | `string \| { [x: string]: string; }` | `undefined` |
| `lines`        | `lines`         | Number of text lines. Only for the text shape.                                                          | `number`                             | `1`         |
| `shape`        | `shape`         | Shape of the content it stands for: lines of text, a block (an image, a card), or a circle (an avatar). | `"circle" \| "rect" \| "text"`       | `'text'`    |
| `xId`          | `x-id`          | Id applied to the root element.                                                                         | `string`                             | `undefined` |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
