# ss-step



<!-- Auto Generated Below -->


## Overview

One step of an `ss-stepper`: its marker, label and description, and the
line to the next step.

It holds no content of its own: the stepper only says where the reader is,
and the page shows the current step's content. Its position, derived state
and whether it can be pressed are set by `ss-stepper`.

## Properties

| Property   | Attribute  | Description                                                                              | Type                    | Default     |
| ---------- | ---------- | ---------------------------------------------------------------------------------------- | ----------------------- | ----------- |
| `disabled` | `disabled` | The step cannot be pressed.                                                              | `boolean`               | `false`     |
| `label`    | `label`    | Text of the step.                                                                        | `string`                | `undefined` |
| `status`   | `status`   | Set by the page: `complete` marks it done wherever it is; `error` shows a problem.       | `"complete" \| "error"` | `undefined` |
| `value`    | `value`    | Identifies the step; the stepper selects by it and reports it. Defaults to its position. | `string`                | `undefined` |


## Events

| Event          | Description                                           | Type                              |
| -------------- | ----------------------------------------------------- | --------------------------------- |
| `ssStepSelect` | Asks the stepper to make this step current. Internal. | `CustomEvent<{ index: number; }>` |
| `ssStepUpdate` | Tells the stepper its value changed. Internal.        | `CustomEvent<void>`               |


## Slots

| Slot            | Description                        |
| --------------- | ---------------------------------- |
| `"description"` | Secondary text under the label.    |
| `"icon"`        | Replaces the number in the marker. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
