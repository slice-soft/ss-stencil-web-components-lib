# ss-search-select



<!-- Auto Generated Below -->


## Overview

A select you type into to filter: a WAI-ARIA combobox over a listbox.

It only shows. The options come from `ss-option` children or from the
`options` property (which wins when set), wherever the caller got them. By
default it filters what it holds, ignoring case and accents; with
`filter="none"` it shows `options` exactly as given, for a host that searches
elsewhere. It reports every change the person makes to the text as
`ssSearch`, never debounced — waiting, fetching, cancelling and errors are
the host's — and shows `loading` when told to.

The list is drawn here from that data rather than slotted, so the field and
the active option share a tree and `aria-activedescendant` resolves. Every
selected option's label is remembered, so replacing `options` with new
search results never turns the field's text into a bare value.

Keyboard: ArrowDown/ArrowUp open the list and move through it, skipping
disabled options; Enter chooses; Escape closes, and a second Escape clears
the text; Tab closes and moves on. Leaving the field restores the selected
label, or clears the selection when the text was emptied.

## Properties

| Property             | Attribute             | Description                                                                              | Type                                                                                                                                             | Default        |
| -------------------- | --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `accessibilityLabel` | `accessibility-label` | Accessible name of the field and its list.                                               | `string`                                                                                                                                         | `undefined`    |
| `clearLabel`         | `clear-label`         | Accessible name of the clear button.                                                     | `string`                                                                                                                                         | `'Clear'`      |
| `clearable`          | `clearable`           | Shows a button that empties the text and the selection.                                  | `boolean`                                                                                                                                        | `false`        |
| `color`              | `color`               | Color variant of the field.                                                              | `"brand" \| "default" \| "destructive" \| "error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'`    |
| `describedBy`        | `described-by`        | Ids of elements, in the host's tree, that describe the field.                            | `string`                                                                                                                                         | `undefined`    |
| `disabled`           | `disabled`            | Disables the field.                                                                      | `boolean`                                                                                                                                        | `false`        |
| `emptyLabel`         | `empty-label`         | Text shown and announced when no option matches.                                         | `string`                                                                                                                                         | `'No results'` |
| `filter`             | `filter`              | Whether the list is filtered by the typed text here (contains) or shown as given (none). | `"contains" \| "none"`                                                                                                                           | `'contains'`   |
| `fullWidth`          | `full-width`          | Expands the field to the full width of its container.                                    | `boolean`                                                                                                                                        | `false`        |
| `inlineStyles`       | `inline-styles`       | Inline CSS styles applied to the field.                                                  | `string \| { [x: string]: string; }`                                                                                                             | `undefined`    |
| `invalid`            | `invalid`             | Marks the field as invalid.                                                              | `boolean`                                                                                                                                        | `false`        |
| `labelledBy`         | `labelled-by`         | Ids of elements, in the host's tree, that name the field — how `ss-field` names it.      | `string`                                                                                                                                         | `undefined`    |
| `loading`            | `loading`             | Shows the loading text in the list, while the host fetches options.                      | `boolean`                                                                                                                                        | `false`        |
| `loadingLabel`       | `loading-label`       | Text shown and announced while `loading`.                                                | `string`                                                                                                                                         | `'Loading…'`   |
| `multiple`           | `multiple`            | Allows choosing several options, shown as removable chips.                               | `boolean`                                                                                                                                        | `false`        |
| `name`               | `name`                | Name submitted with the surrounding form.                                                | `string`                                                                                                                                         | `undefined`    |
| `options`            | `options`             | The options, as data. When set, it wins over `ss-option` children.                       | `SelectOption[]`                                                                                                                                 | `undefined`    |
| `placeholder`        | `placeholder`         | Placeholder shown while the field is empty.                                              | `string`                                                                                                                                         | `undefined`    |
| `removeLabel`        | `remove-label`        | First word of each chip's remove name, before the option's label ("Remove Colombia").    | `string`                                                                                                                                         | `'Remove'`     |
| `required`           | `required`            | Requires a selection before the form submits.                                            | `boolean`                                                                                                                                        | `false`        |
| `size`               | `size`                | Size of the field.                                                                       | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                         | `'md'`         |
| `value`              | `value`               | The selected value. Updated on interaction.                                              | `string \| string[]`                                                                                                                             | `undefined`    |
| `xId`                | `x-id`                | Id applied to the field's input; also included in event details.                         | `string`                                                                                                                                         | `undefined`    |
| `xStyle`             | `x-style`             | Visual style of the field.                                                               | `"outline" \| "solid" \| "underline"`                                                                                                            | `'solid'`      |


## Events

| Event          | Description                                                                                       | Type                                         |
| -------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `ssBlur`       | Emitted when the field loses focus.                                                               | `CustomEvent<FocusEvent>`                    |
| `ssChange`     | Emitted when the selection changes; detail contains xId and the value (an array with `multiple`). | `CustomEvent<SsSearchSelectChangeEvent>`     |
| `ssFocus`      | Emitted when the field gains focus.                                                               | `CustomEvent<FocusEvent>`                    |
| `ssOpenChange` | Emitted when the list opens or closes; detail contains xId and open.                              | `CustomEvent<SsSearchSelectOpenChangeEvent>` |
| `ssSearch`     | Emitted on every change the person makes to the text; detail contains xId and the query.          | `CustomEvent<SsSearchSelectSearchEvent>`     |


## Slots

| Slot | Description                                                     |
| ---- | --------------------------------------------------------------- |
|      | The `ss-option` elements, when the options are written in HTML. |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
