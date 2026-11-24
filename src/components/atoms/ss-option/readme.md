# ss-option



<!-- Auto Generated Below -->


## Overview

One option of an `ss-search-select`, written in HTML. It is data only: it
draws nothing, and the select reads its value, text, `disabled` and
`selected` and draws the list itself, the way `ss-tabs` draws its tabs from
each `ss-tab`. That keeps every option in the select's own tree, where the
ids tying the field to the active option resolve.

When anything about it changes, it tells the select to read the list again.

## Properties

| Property   | Attribute  | Description                                                                 | Type      | Default     |
| ---------- | ---------- | --------------------------------------------------------------------------- | --------- | ----------- |
| `disabled` | `disabled` | Whether the option can be chosen.                                           | `boolean` | `false`     |
| `selected` | `selected` | Whether the option starts selected, as on a native option.                  | `boolean` | `false`     |
| `value`    | `value`    | Value the select reports when this option is chosen. Defaults to the label. | `string`  | `undefined` |


## Events

| Event            | Description                                                             | Type                |
| ---------------- | ----------------------------------------------------------------------- | ------------------- |
| `ssOptionChange` | Internal: the option changed and its select should read the list again. | `CustomEvent<void>` |


## Slots

| Slot | Description                  |
| ---- | ---------------------------- |
|      | The option's label, as text. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
