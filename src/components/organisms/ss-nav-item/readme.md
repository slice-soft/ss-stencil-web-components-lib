# ss-nav-item



<!-- Auto Generated Below -->


## Overview

One link in an `ss-nav`.

It renders a real `<a>`, and marks it with `aria-current="page"` when it is
the page the reader is on — on the link itself, the element that takes focus
and that a screen reader announces. `ss-nav` decides which item is current
and tells it, through `current`.

A disabled item keeps its place but is no longer a link anyone can follow:
it loses its `href`, so it drops out of the tab order, and is announced as a
disabled link.

## Properties

| Property      | Attribute     | Description                                                        | Type                         | Default        |
| ------------- | ------------- | ------------------------------------------------------------------ | ---------------------------- | -------------- |
| `current`     | `current`     | Whether this is the page the reader is on. Set by `ss-nav`.        | `boolean`                    | `false`        |
| `disabled`    | `disabled`    | Disables the item; it can no longer be followed or reached by Tab. | `boolean`                    | `false`        |
| `href`        | `href`        | Where the item leads.                                              | `string`                     | `undefined`    |
| `label`       | `label`       | Item text, used when no slot content is provided.                  | `string`                     | `undefined`    |
| `orientation` | `orientation` | Direction of the navigation it sits in. Set by `ss-nav`.           | `"horizontal" \| "vertical"` | `'horizontal'` |
| `value`       | `value`       | Value that identifies the item to `ss-nav`. Defaults to the href.  | `string`                     | `undefined`    |


## Slots

| Slot     | Description                                         |
| -------- | --------------------------------------------------- |
|          | The item's text; overrides the `label` prop.        |
| `"icon"` | A leading icon, typically an `ss-icon`. Decorative. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
