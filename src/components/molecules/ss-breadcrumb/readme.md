# ss-breadcrumb



<!-- Auto Generated Below -->


## Overview

The trail of pages leading to the one being read.

The trail owns the separator, the sizing and which step is the current page;
each step draws its own separator because CSS cannot put one between slotted
children. The last step is marked as current, so a reader is told where they
are rather than being offered a link to where they already are.

## Properties

| Property             | Attribute             | Description                                                                | Type                                 | Default        |
| -------------------- | --------------------- | -------------------------------------------------------------------------- | ------------------------------------ | -------------- |
| `accessibilityLabel` | `accessibility-label` | Accessible name for the trail, so a page with two of them stays navigable. | `string`                             | `'Breadcrumb'` |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the rendered navigation element.              | `string \| { [x: string]: string; }` | `undefined`    |
| `separator`          | `separator`           | Character drawn between steps.                                             | `string`                             | `'/'`          |
| `size`               | `size`                | Size shared by every step.                                                 | `"lg" \| "md" \| "sm"`               | `'md'`         |
| `xId`                | `x-id`                | Id applied to the rendered navigation element.                             | `string`                             | `undefined`    |


## Slots

| Slot | Description                               |
| ---- | ----------------------------------------- |
|      | The `ss-breadcrumb-item` steps, in order. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
