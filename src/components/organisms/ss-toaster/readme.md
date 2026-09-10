# ss-toaster



<!-- Auto Generated Below -->


## Overview

The corner of the screen toasts appear in.

It pins its toasts to one corner, above everything else, and stacks them in
the order they were added. It is a named region, so a screen reader user can
jump to the notifications and back again. The announcement itself comes from
each toast's own live region, which is why the toaster sets no `aria-live`:
a live region inside another announces the same message twice.

The region ignores the pointer, so its empty area never blocks the page under
it; the toasts take the pointer back.

## Properties

| Property             | Attribute             | Description                                                                | Type                                                                                            | Default           |
| -------------------- | --------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------- |
| `accessibilityLabel` | `accessibility-label` | Accessible name for the region, which is what a screen reader lists it as. | `string`                                                                                        | `'Notifications'` |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the region.                                   | `string \| { [x: string]: string; }`                                                            | `undefined`       |
| `placement`          | `placement`           | Corner of the viewport the toasts are pinned to.                           | `"bottom-center" \| "bottom-end" \| "bottom-start" \| "top-center" \| "top-end" \| "top-start"` | `'bottom-end'`    |
| `xId`                | `x-id`                | Id applied to the region.                                                  | `string`                                                                                        | `undefined`       |


## Slots

| Slot | Description              |
| ---- | ------------------------ |
|      | The `ss-toast` elements. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
