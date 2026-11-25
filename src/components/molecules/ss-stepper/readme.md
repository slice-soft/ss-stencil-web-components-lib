# ss-stepper



<!-- Auto Generated Below -->


## Overview

Where the reader is in a sequence of steps.

It only shows: the page decides which step is current, which are done or
in error, and whether a step may be entered. Interactive, it reports a press
with a cancelable `ssStepChange`; the page that must check first prevents it
and sets `value` itself when ready.

A horizontal stepper narrower than `--ss-stepper-compact-max-width` shows
only the current step and "Step 2 of 5". The width is measured, since a
container query cannot read a custom property: an invisible probe as wide
as the token is observed with the host, so the threshold is right even when
the tokens arrive after the stepper renders.

## Properties

| Property             | Attribute             | Description                                                               | Type                                 | Default                       |
| -------------------- | --------------------- | ------------------------------------------------------------------------- | ------------------------------------ | ----------------------------- |
| `accessibilityLabel` | `accessibility-label` | Accessible name of the list. Translate it.                                | `string`                             | `'Steps'`                     |
| `completeLabel`      | `complete-label`      | Read after a completed step's label. Translate it.                        | `string`                             | `'Completed'`                 |
| `errorLabel`         | `error-label`         | Read after the label of a step in error. Translate it.                    | `string`                             | `'Error'`                     |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the root element.                            | `string \| { [x: string]: string; }` | `undefined`                   |
| `interactive`        | `interactive`         | Steps are buttons that ask to become current. Off: a read-only indicator. | `boolean`                            | `false`                       |
| `orientation`        | `orientation`         | Lays the steps out in a row or a column.                                  | `"horizontal" \| "vertical"`         | `'horizontal'`                |
| `summaryLabel`       | `summary-label`       | The compact form's text; `{current}` and `{total}` are filled in.         | `string`                             | `'Step {current} of {total}'` |
| `value`              | `value`               | The current step's value. Absent: the first step.                         | `string`                             | `undefined`                   |
| `xId`                | `x-id`                | Id applied to the list.                                                   | `string`                             | `undefined`                   |


## Events

| Event          | Description                                                                                         | Type                             |
| -------------- | --------------------------------------------------------------------------------------------------- | -------------------------------- |
| `ssStepChange` | Emitted when a step is pressed (interactive only). Cancelable: prevent it to keep the current step. | `CustomEvent<SsStepChangeEvent>` |


## Slots

| Slot | Description         |
| ---- | ------------------- |
|      | `ss-step` elements. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
