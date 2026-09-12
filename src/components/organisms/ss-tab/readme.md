# ss-tab



<!-- Auto Generated Below -->


## Overview

One tab of an `ss-tabs`: its label, and the panel shown while it is selected.

The button the reader presses is drawn by `ss-tabs`, in its tab list. What
stays here is the panel, so the content sits where the caller wrote it and
only the label travels. `ss-tabs` tells each panel whether it is showing and
which tab names it — the same coordination by props the rest of the library
uses.

## Properties

| Property   | Attribute  | Description                                                                                            | Type      | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------ | --------- | ----------- |
| `disabled` | `disabled` | Disables the tab; it cannot be selected and the arrow keys skip it.                                    | `boolean` | `false`     |
| `label`    | `label`    | Text of the tab. Defaults to the value.                                                                | `string`  | `undefined` |
| `panelId`  | `panel-id` | Id of the panel, which the tab points at. Set by `ss-tabs`.                                            | `string`  | `undefined` |
| `selected` | `selected` | Whether this panel is showing. Set by `ss-tabs`.                                                       | `boolean` | `false`     |
| `tabId`    | `tab-id`   | Id of the tab that names this panel. Set by `ss-tabs`.                                                 | `string`  | `undefined` |
| `value`    | `value`    | Value that identifies the tab; `ss-tabs` selects by it and reports it. Defaults to the tab's position. | `string`  | `undefined` |


## Slots

| Slot | Description          |
| ---- | -------------------- |
|      | The panel's content. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
