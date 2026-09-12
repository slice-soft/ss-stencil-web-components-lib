# ss-accordion-item



<!-- Auto Generated Below -->


## Overview

A heading that shows and hides the section under it.

It follows the WAI-ARIA disclosure pattern the accordion is built from: the
heading holds a button that says whether the section is expanded and which
region it controls, and the region is named by that button. The heading is a
real heading, so a screen reader user moving through a page by headings
still finds every section — collapsed ones included. Pick `heading-level` to
fit the page's outline.

It works alone as a single disclosure. Inside an `ss-accordion` it also takes
part in single-open behaviour and arrow-key movement between headers.

## Properties

| Property       | Attribute       | Description                                                                   | Type                                 | Default     |
| -------------- | --------------- | ----------------------------------------------------------------------------- | ------------------------------------ | ----------- |
| `disabled`     | `disabled`      | Disables the header; the section keeps its current state.                     | `boolean`                            | `false`     |
| `heading`      | `heading`       | Heading text, used when no heading slot content is provided.                  | `string`                             | `undefined` |
| `headingLevel` | `heading-level` | Level of the heading element, 1 to 6, so the section fits the page's outline. | `number`                             | `3`         |
| `inlineStyles` | `inline-styles` | Inline CSS styles applied to the item's container.                            | `string \| { [x: string]: string; }` | `undefined` |
| `open`         | `open`          | Whether the section is expanded. Updated on interaction, and reflected.       | `boolean`                            | `false`     |
| `value`        | `value`         | Value that identifies the item in events.                                     | `string`                             | `undefined` |
| `xId`          | `x-id`          | Id applied to the item's container; also included in the ssOpenChange detail. | `string`                             | `undefined` |


## Events

| Event          | Description                                                                            | Type                                                            |
| -------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `ssOpenChange` | Emitted when the header is pressed; detail contains xId, value and the new open state. | `CustomEvent<{ xId?: string; value?: string; open: boolean; }>` |


## Slots

| Slot        | Description                                         |
| ----------- | --------------------------------------------------- |
|             | The section's content.                              |
| `"heading"` | Rich heading content; overrides the `heading` prop. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
