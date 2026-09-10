# ss-dropdown



<!-- Auto Generated Below -->


## Overview

A button that opens a list of actions.

It follows the WAI-ARIA menu button pattern, because that is what a screen
reader announces a `menu` as and what its users will press: the menu takes
focus when it opens; arrows move through the items and wrap; Home and End
jump to the ends; a typed letter moves to the next item starting with it;
Enter or Space picks one. Picking an item, or Escape, closes the menu and
hands focus back to the button. Tab closes it and lets focus move on — the
items are not tab stops, so a menu costs one stop in the page's tab order
however long it is.

A menu is for actions. For a value a form submits, use `ss-select`.

## Properties

| Property             | Attribute             | Description                                                                                           | Type                                     | Default     |
| -------------------- | --------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------- |
| `accessibilityLabel` | `accessibility-label` | Accessible name for the menu. Defaults to the trigger's label, which is what the reader just pressed. | `string`                                 | `undefined` |
| `align`              | `align`               | Alignment along the trigger's edge: start, center or end. A menu reads best hanging from the start.   | `"center" \| "end" \| "start"`           | `'start'`   |
| `disabled`           | `disabled`            | Disables the dropdown; the menu stays closed and the trigger does nothing.                            | `boolean`                                | `false`     |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the menu.                                                                | `string \| { [x: string]: string; }`     | `undefined` |
| `open`               | `open`                | Whether the menu is showing. Updated on interaction, and reflected.                                   | `boolean`                                | `false`     |
| `placement`          | `placement`           | Side of the trigger to open on. Moves to the opposite side when there is no room.                     | `"bottom" \| "left" \| "right" \| "top"` | `'bottom'`  |
| `xId`                | `x-id`                | Id applied to the menu.                                                                               | `string`                                 | `undefined` |


## Events

| Event          | Description                                                                                                              | Type                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `ssOpenChange` | Emitted when an interaction opens or closes the menu, not when `open` is set from outside; detail contains xId and open. | `CustomEvent<{ xId?: string; open: boolean; }>` |
| `ssSelect`     | Emitted when an item is picked; detail contains xId and the item's value.                                                | `CustomEvent<SsDropdownSelectEvent>`            |


## Slots

| Slot        | Description                                                           |
| ----------- | --------------------------------------------------------------------- |
|             | The `ss-dropdown-item` entries, optionally separated by `ss-divider`. |
| `"trigger"` | The button that opens the menu, usually an `ss-button`.               |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
