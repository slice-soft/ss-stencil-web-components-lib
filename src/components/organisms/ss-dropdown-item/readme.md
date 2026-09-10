# ss-dropdown-item



<!-- Auto Generated Below -->


## Overview

One action in an `ss-dropdown` menu.

The item is the host itself: `role="menuitem"` and the roving focus both sit
on the element the caller wrote, so each item is a direct child of the menu
in the accessibility tree and the menu can move focus by calling `focus()`
on it. It is never a tab stop — the menu moves focus between items.

It does nothing on its own. The menu listens for the press and reports the
item's value, so a set of items needs one listener, not one per item.

## Properties

| Property   | Attribute  | Description                                                                                  | Type                         | Default     |
| ---------- | ---------- | -------------------------------------------------------------------------------------------- | ---------------------------- | ----------- |
| `disabled` | `disabled` | Disables the item; it is skipped by the arrow keys and cannot be picked.                     | `boolean`                    | `false`     |
| `label`    | `label`    | Item text, used when no slot content is provided. Also what typing a letter matches against. | `string`                     | `undefined` |
| `value`    | `value`    | Value reported by the menu when this item is picked. Defaults to the label, then the text.   | `string`                     | `undefined` |
| `variant`  | `variant`  | Visual treatment. `destructive` marks an action that removes something.                      | `"default" \| "destructive"` | `'default'` |


## Slots

| Slot     | Description                                         |
| -------- | --------------------------------------------------- |
|          | The item's text; overrides the `label` prop.        |
| `"icon"` | A leading icon, typically an `ss-icon`. Decorative. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
