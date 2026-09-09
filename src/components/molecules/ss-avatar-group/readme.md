# ss-avatar-group



<!-- Auto Generated Below -->


## Overview

Overlaps a set of avatars into one stack, with an optional count for the ones
it does not show.

The stack is a single unit to assistive technology: the avatars themselves are
hidden from it and the group carries one name, because hearing eight names in
a row conveys less than "8 collaborators" when the individual identities are
not actionable here.

Rendered into a shadow root so that `::slotted` can lay the avatars out. A
scoped stylesheet cannot: Stencil marks only the elements a component renders
itself with its scope class, never the children the caller slots in, so
`.ss-avatar-group ss-avatar { … }` would match nothing.

## Properties

| Property             | Attribute             | Description                                               | Type                                            | Default     |
| -------------------- | --------------------- | --------------------------------------------------------- | ----------------------------------------------- | ----------- |
| `accessibilityLabel` | `accessibility-label` | Accessible name for the stack as a whole.                 | `string`                                        | `undefined` |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the container.               | `string \| { [x: string]: string; }`            | `undefined` |
| `max`                | `max`                 | Shows at most this many avatars; the rest become a count. | `number`                                        | `undefined` |
| `shape`              | `shape`               | Shape shared by every avatar.                             | `"circle" \| "rounded" \| "square"`             | `'circle'`  |
| `size`               | `size`                | Size shared by every avatar, and by the overflow count.   | `"2xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"` | `'md'`      |
| `xId`                | `x-id`                | Id applied to the rendered container.                     | `string`                                        | `undefined` |


## Slots

| Slot | Description               |
| ---- | ------------------------- |
|      | The `ss-avatar` children. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
