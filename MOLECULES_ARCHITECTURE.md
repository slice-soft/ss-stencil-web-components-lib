# 0. Molecules Architecture

This document specifies design only; it does not implement components or refactor atoms. The reference is `main @ 41e0eff`, package
`@slice-soft/ss-stencil-web-components-lib` version `0.2.2`. Findings come from the supplied `molecules-findings.md` dossier, with targeted source checks and corrections recorded below.
This file lives at the repository root by explicit instruction, although architectural documentation normally uses lowercase `docs/*.md`.

## 1. Current structure

The source tree contains 18 atoms, 18 component specs, and **9 component e2e files**. The dossier says 7 e2e files; the source contains 9.

```text
src/
  components/
    atoms/
      ss-avatar/
      ss-badge/
      ss-button/
      ss-checkbox/
      ss-combobox/
      ss-divider/
      ss-icon/
      ss-input/
      ss-label/
      ss-link/
      ss-radio/
      ss-select/
      ss-slider/
      ss-spinner/
      ss-switch/
      ss-textarea/
      ss-tooltip/
      ss-typography/
        # Each atom directory contains <tag>.tsx, <tag>.scss, readme.md,
        # and test/<tag>.spec.tsx; e2e files exist for 9 atoms.
  types/
    control-events.d.ts
    size.d.ts
    typography.d.ts
    variant.d.ts
  utils/
    style.ts
    style.spec.ts
  test/
    utils.ts
  global/
    global.scss
    reset.css
    styles/_mixins.scss
  index.ts
  index.html
  components.d.ts
```

The e2e-covered atoms are `ss-button`, `ss-checkbox`, `ss-input`, `ss-radio`, `ss-select`, `ss-slider`, `ss-switch`, `ss-tooltip`, and `ss-typography`.
`components.d.ts` and each component's `readme.md` are generated. `src/index.html` is the 1093-line visual development harness, with token-set selection and a theme toggle.
`src/global/global.scss` imports the reset and contains comments; it does not define tokens. Development token sets live at `test/token-set-01/tokens.css` and
`test/token-set-02/tokens.css`. Architectural references are `docs/atoms.md`, `docs/distribution.md`, and `docs/pending-token-proposals.md`.

| Configuration          | Current setting and consequence                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Stencil namespace      | `ss-stencil-web-components-lib`                                                                                                                 |
| Global styles / Sass   | `src/global/global.scss`; `sass()` plugin                                                                                                       |
| `dist`                 | `esmLoaderPath: '../loader'`                                                                                                                    |
| `dist-custom-elements` | `customElementsExportBehavior: 'auto-define-custom-elements'`                                                                                   |
| `docs-readme`          | Generates component documentation with the configured footer                                                                                    |
| `www`                  | Development harness; copies the two token sets for development only                                                                             |
| `docs-vscode`          | Generates `vscode-data.json`                                                                                                                    |
| Browser tests / reload | `browserHeadless: 'shell'`; `reloadStrategy: 'pageReload'`                                                                                      |
| Framework targets      | Disabled; the React target is commented out. Separate React/Angular/Vue packages are planned because sibling output paths failed in CI          |
| TypeScript             | `noUnusedLocals`, `noUnusedParameters`, `experimentalDecorators`; `jsx: react`, `jsxFactory: h`, ES2022 target/lib, `moduleResolution: bundler` |
| ESLint                 | Version 9 flat config; ignores component specs and e2e files; TSX rule exempts `h`                                                              |
| Prettier               | `printWidth: 180`, `singleQuote: true`, `arrowParens: avoid`, `trailingComma: all`, `tabWidth: 2`                                               |
| Tests                  | `npm test` runs `stencil test --spec --e2e --coverage`                                                                                          |
| CI                     | `.github/workflows/requeriments.yml` calls `slice-soft/ss-pipeline/.github/workflows/ci-node.yml@v0` on PRs to main                             |
| Release                | `deploy.yml` calls `release-stencil-lib.yml@v0` on pushes to main                                                                               |
| Entry point            | `src/index.ts` exports only types and explicitly prohibits component exports                                                                    |

### What does not exist

| Area                               | Finding                                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Molecules / organisms              | None — neither source directory exists                                                                                           |
| Storybook                          | None — no stories or Storybook harness; use `src/index.html` through `www`                                                       |
| Published framework wrappers       | None — direct custom-element consumption is the documented integration                                                           |
| Component barrel                   | None — `src/index.ts` is type-only                                                                                               |
| `helpers/`, `shared/`, `internal/` | None — the established utility location is `src/utils/<topic>.ts` with an adjacent spec                                          |
| Public methods                     | None — zero `@Method` declarations                                                                                               |
| Host JSX                           | None — zero `<Host>` uses                                                                                                        |
| Decorated DOM listeners            | None — zero `@Listen` declarations                                                                                               |
| Styling parts                      | None — no `::part` or `exportparts` in the 18 atoms                                                                              |
| Existing molecule implementation   | None — `docs/pending-token-proposals.md:17` reserves `--ss-z-index-*` roles for future layers; it is not implemented composition |

## 2. Atom inventory

| Mode           | Count | Tags                                                                                                                                         |
| -------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `shadow: true` | 11    | `ss-avatar`, `ss-badge`, `ss-button`, `ss-divider`, `ss-icon`, `ss-input`, `ss-link`, `ss-slider`, `ss-spinner`, `ss-textarea`, `ss-tooltip` |
| `scoped: true` | 7     | `ss-checkbox`, `ss-combobox`, `ss-label`, `ss-radio`, `ss-select`, `ss-switch`, `ss-typography`                                              |

All atoms accept `xId` (`x-id`) and `inlineStyles` (`inline-styles`), use a private BEM `getClasses()`, and apply
`resolveInlineStyles(this.inlineStyles)` to the rendered root. Each has a same-name SCSS file. No atom imports another component.
All current `@Event()` declarations omit options: `bubbles`, `composed`, and `cancelable` are all `true`.
`Required` below means a required component prop, not the control's `required` state; none of the existing atom props is mandatory.
`undefined` means no initializer. Types and defaults below are checked against declarations, expanding the dossier's shorthand.

| Shared type                | Contract                                                                         |
| -------------------------- | -------------------------------------------------------------------------------- |
| `Size`                     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'`                         |
| `Variant`                  | Existing 11-value semantic color union in `src/types/variant.d.ts`               |
| `InlineStyles`             | `string \| Record<string, string>`; HTML CSS string or framework property object |
| `SsInputValueEvent`        | `{ xId?: string; value: string }`                                                |
| `SsCheckedChangeEvent`     | `{ xId?: string; name?: string; value?: string; checked: boolean }`              |
| `SsSelectChangeEvent`      | `{ xId?: string; name?: string; value: string \| string[] }`                     |
| `SsSliderValueEvent`       | `{ xId?: string; name?: string; value: number }`                                 |
| `SsLinkClickEvent`         | `{ xId?: string; href?: string }`                                                |
| `SsBadgeDismissEvent`      | `{ xId?: string }`                                                               |
| `SsAvatarImageEvent`       | `{ xId?: string; src?: string }`                                                 |
| `SsTooltipOpenChangeEvent` | `{ xId?: string; open: boolean }`                                                |

### 2.1. `ss-button`

Path: `src/components/atoms/ss-button/ss-button.tsx`. Mode: `shadow: true`. Responsibility: Interactive trigger for primary/secondary actions and icon buttons.

**Props**

| Prop                 | Type           | Required | Default     | Description                                                                                            |
| -------------------- | -------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `xId`                | `string`       | No       | `undefined` | Id applied to the button element; emitted as the ssClick detail.                                       |
| `label`              | `string`       | No       | `undefined` | Text rendered inside the button when no slot content is provided; also the aria-label fallback.        |
| `accessibilityLabel` | `string`       | No       | `undefined` | Accessible label for screen readers; falls back to label.                                              |
| `type`               | `ButtonType`   | No       | `'button'`  | Native button type: button, submit or reset.                                                           |
| `disabled`           | `boolean`      | No       | `false`     | Disables the button.                                                                                   |
| `loading`            | `boolean`      | No       | `false`     | Shows the loading state and disables the button.                                                       |
| `oneClick`           | `boolean`      | No       | `true`      | After ssClick fires, button is disabled for disableDuration ms                                         |
| `disableDuration`    | `number`       | No       | `1000`      | Duration in milliseconds of the temporary disabled state (oneClick) or loading feedback after a click. |
| `size`               | `Size`         | No       | `'md'`      | Size of the button.                                                                                    |
| `variant`            | `Variant`      | No       | `'primary'` | Color variant of the button.                                                                           |
| `xStyle`             | `ButtonStyle`  | No       | `'solid'`   | Visual style: solid, outline or ghost.                                                                 |
| `inlineStyles`       | `InlineStyles` | No       | `undefined` | Inline CSS styles applied to the button element.                                                       |
| `shape`              | `ButtonShape`  | No       | `'rounded'` | Shape of the button: rounded, pill, circle or square.                                                  |
| `fullWidth`          | `boolean`      | No       | `false`     | Expands the button to the full width of its container.                                                 |
| `status`             | `ButtonStatus` | No       | `'active'`  | Button status: active, disabled or loading; disabled and loading also disable the button.              |
| `iconPosition`       | `IconPosition` | No       | `'right'`   | Position of the icon slot relative to the label: left, right or only (hides the label).                |

**Events**

| Event     | Payload               | When          | bubbles/composed/cancelable |
| --------- | --------------------- | ------------- | --------------------------- |
| `ssClick` | `string \| undefined` | Enabled click | true / true / true          |

**Slots**

| Slot      | Expected content                      | Constraints                                                     |
| --------- | ------------------------------------- | --------------------------------------------------------------- |
| icon      | Leading, trailing, or standalone icon | Position follows `iconPosition`; detected through the light DOM |
| (default) | Button content                        | Falls back to `label`                                           |

**Public methods:** None — no `@Method` declaration.

**Internal state:** `@State isTemporarilyDisabled`, `@State feedbackStatus?: ButtonStatus`; private `disableTimeout` and `statusTimeout`, cleared in `disconnectedCallback()`.

**Actual render:** `<button>` with `id`, `type`, `disabled`, `aria-disabled`, `aria-busy`, `aria-label`, and disabled-dependent `tabindex`; icon and label slots.

**Styles:** `ss-button.scss`. Solid/outline/ghost semantic variants use `btn-variant`; sizes use `$atom-control-sizes`; focus ring uses the shared mixin.

**Accessibility:** Native button semantics; accessible name is `accessibilityLabel` or `label`. Disabled handling calls `preventDefault()` and `stopPropagation()`.

**Dependencies:** `@stencil/core`, `../../../types/variant`, `../../../utils/style`, `../../../types/size`. Component dependencies: None — no component import.

⚠️ `oneClick=true` disables for `disableDuration=1000` ms by default. `disabled`, `loading`, `status`, and temporary state overlap in `currentStatus`/`isDisabled` (`ss-button.tsx:70-78`). `ssClick` emits the raw `xId`, the only scalar event detail; focus events elsewhere also do not use normalized payload objects.

### 2.2. `ss-input`

Path: `src/components/atoms/ss-input/ss-input.tsx`. Mode: `shadow: true`. Responsibility: Native text input with the 14 `SsInputType` values.

**Props**

| Prop                 | Type           | Required | Default     | Description                                                                   |
| -------------------- | -------------- | -------- | ----------- | ----------------------------------------------------------------------------- |
| `xId`                | `string`       | No       | `undefined` | Id applied to the native input; also included in event details.               |
| `name`               | `string`       | No       | `undefined` | Name of the native input for form submission.                                 |
| `type`               | `SsInputType`  | No       | `'text'`    | Native input type.                                                            |
| `color`              | `Variant`      | No       | `'primary'` | Color variant of the input.                                                   |
| `value`              | `string`       | No       | `undefined` | Current value of the input.                                                   |
| `placeholder`        | `string`       | No       | `undefined` | Placeholder text shown when the input is empty.                               |
| `disabled`           | `boolean`      | No       | `false`     | Disables the input.                                                           |
| `readonly`           | `boolean`      | No       | `false`     | Makes the input read-only.                                                    |
| `required`           | `boolean`      | No       | `false`     | Marks the input as required for form validation.                              |
| `invalid`            | `boolean`      | No       | `false`     | Applies error styling and sets aria-invalid without changing native validity. |
| `autocomplete`       | `string`       | No       | `undefined` | Native autocomplete attribute of the input.                                   |
| `min`                | `string`       | No       | `undefined` | Minimum value for numeric and date inputs.                                    |
| `max`                | `string`       | No       | `undefined` | Maximum value for numeric and date inputs.                                    |
| `step`               | `string`       | No       | `undefined` | Step granularity for numeric and date inputs.                                 |
| `minLength`          | `number`       | No       | `undefined` | Minimum number of characters allowed.                                         |
| `maxLength`          | `number`       | No       | `undefined` | Maximum number of characters allowed.                                         |
| `accessibilityLabel` | `string`       | No       | `undefined` | Accessible label for screen readers.                                          |
| `describedBy`        | `string`       | No       | `undefined` | Id of the element that describes the input, set as aria-describedby.          |
| `inlineStyles`       | `InlineStyles` | No       | `undefined` | Inline CSS styles applied to the input element.                               |
| `size`               | `Size`         | No       | `'md'`      | Size of the input.                                                            |
| `fullWidth`          | `boolean`      | No       | `false`     | Expands the input to the full width of its container.                         |
| `xStyle`             | `InputStyle`   | No       | `'solid'`   | Visual style of the input.                                                    |

**Events**

| Event       | Payload             | When                                     | bubbles/composed/cancelable |
| ----------- | ------------------- | ---------------------------------------- | --------------------------- |
| `ssInput`   | `SsInputValueEvent` | Native input (while dragging for slider) | true / true / true          |
| `ssChange`  | `SsInputValueEvent` | Native change                            | true / true / true          |
| `ssInvalid` | `SsInputValueEvent` | Native invalid                           | true / true / true          |
| `ssFocus`   | `FocusEvent`        | Native focus                             | true / true / true          |
| `ssBlur`    | `FocusEvent`        | Native blur                              | true / true / true          |

**Slots**

| Slot | Expected content | Constraints                 |
| ---- | ---------------- | --------------------------- |
| None | —                | The render contains no slot |

**Public methods:** None — no `@Method` declaration.

**Internal state:** None — `value` is not internally controlled; there is no `@State`.

**Actual render:** `<input>` with native constraints and event handlers; `aria-invalid` is conditional on `invalid`, `aria-label` comes from `accessibilityLabel`, and `aria-describedby` from `describedBy`.

**Styles:** `ss-input.scss`. Control sizes, semantic colors and solid/outline/ghost input styling follow the shared control conventions.

**Accessibility:** No label is rendered. The caller must supply an accessible name. `invalid` does not change native validity.

**Dependencies:** `@stencil/core`, `../../../utils/style`, `../../../types/size`, `../../../types/variant`, `../../../types/control-events`. Component dependencies: None — no component import.

⚠️ The demo never consumes `describedBy`, but `src/components/atoms/ss-input/test/ss-input.spec.tsx:89-98` does test it, contrary to the dossier. An external label does not reach the input inside its shadow root simply because its parent is scoped.

### 2.3. `ss-textarea`

Path: `src/components/atoms/ss-textarea/ss-textarea.tsx`. Mode: `shadow: true`. Responsibility: Native multiline input.

**Props**

| Prop                 | Type             | Required | Default      | Description                                                             |
| -------------------- | ---------------- | -------- | ------------ | ----------------------------------------------------------------------- |
| `xId`                | `string`         | No       | `undefined`  | Id applied to the native textarea; also included in event details.      |
| `name`               | `string`         | No       | `undefined`  | Name of the native textarea for form submission.                        |
| `value`              | `string`         | No       | `undefined`  | Current value of the textarea.                                          |
| `placeholder`        | `string`         | No       | `undefined`  | Placeholder text shown when the textarea is empty.                      |
| `color`              | `Variant`        | No       | `'primary'`  | Color variant of the textarea.                                          |
| `xStyle`             | `InputStyle`     | No       | `'solid'`    | Visual style of the textarea.                                           |
| `size`               | `Size`           | No       | `'md'`       | Size of the textarea.                                                   |
| `rows`               | `number`         | No       | `3`          | Number of visible text rows.                                            |
| `cols`               | `number`         | No       | `undefined`  | Native cols attribute: visible width in characters.                     |
| `disabled`           | `boolean`        | No       | `false`      | Disables the textarea.                                                  |
| `readonly`           | `boolean`        | No       | `false`      | Makes the textarea read-only.                                           |
| `required`           | `boolean`        | No       | `false`      | Marks the textarea as required for form validation.                     |
| `invalid`            | `boolean`        | No       | `false`      | Applies error styling and sets aria-invalid.                            |
| `fullWidth`          | `boolean`        | No       | `false`      | Expands the textarea to the full width of its container.                |
| `resize`             | `TextareaResize` | No       | `'vertical'` | Allowed resize direction: none, vertical, horizontal or both.           |
| `minLength`          | `number`         | No       | `undefined`  | Minimum number of characters allowed.                                   |
| `maxLength`          | `number`         | No       | `undefined`  | Maximum number of characters allowed.                                   |
| `accessibilityLabel` | `string`         | No       | `undefined`  | Accessible label for screen readers.                                    |
| `describedBy`        | `string`         | No       | `undefined`  | Id of the element that describes the textarea, set as aria-describedby. |
| `inlineStyles`       | `InlineStyles`   | No       | `undefined`  | Inline CSS styles applied to the textarea element.                      |

**Events**

| Event       | Payload             | When                                     | bubbles/composed/cancelable |
| ----------- | ------------------- | ---------------------------------------- | --------------------------- |
| `ssInput`   | `SsInputValueEvent` | Native input (while dragging for slider) | true / true / true          |
| `ssChange`  | `SsInputValueEvent` | Native change                            | true / true / true          |
| `ssFocus`   | `FocusEvent`        | Native focus                             | true / true / true          |
| `ssBlur`    | `FocusEvent`        | Native blur                              | true / true / true          |
| `ssInvalid` | `SsInputValueEvent` | Native invalid                           | true / true / true          |

**Slots**

| Slot | Expected content | Constraints                 |
| ---- | ---------------- | --------------------------- |
| None | —                | The render contains no slot |

**Public methods:** None — no `@Method` declaration.

**Internal state:** None — no interaction state is declared.

**Actual render:** `<textarea>` with rows, cols, length constraints, disabled/readonly/required state, and the same five event concepts as `ss-input`.

**Styles:** `ss-textarea.scss`. Same control style convention as input, plus the `resize` modifier.

**Accessibility:** Uses `accessibilityLabel`, `describedBy`, and conditional `aria-invalid`; no label is rendered. Native constraints remain owned by the textarea.

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../types/variant`, `../../../utils/style`, `../../../types/control-events`. Component dependencies: None — no component import.

The API omits input `type`, `min`, `max`, `step`, and `autocomplete`; adds `rows`, `cols`, and `resize`.

### 2.4. `ss-combobox`

Path: `src/components/atoms/ss-combobox/ss-combobox.tsx`. Mode: `scoped: true`. Responsibility: Native text input backed by a datalist.

**Props**

| Prop                 | Type           | Required | Default     | Description                                                                                        |
| -------------------- | -------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `xId`                | `string`       | No       | `undefined` | Id applied to the native input; also included in event details and used to derive the datalist id. |
| `name`               | `string`       | No       | `undefined` | Name of the native input for form submission.                                                      |
| `value`              | `string`       | No       | `undefined` | Current value of the input.                                                                        |
| `placeholder`        | `string`       | No       | `undefined` | Placeholder text shown when the input is empty.                                                    |
| `color`              | `Variant`      | No       | `'primary'` | Color variant of the combobox.                                                                     |
| `xStyle`             | `InputStyle`   | No       | `'solid'`   | Visual style of the input field.                                                                   |
| `size`               | `Size`         | No       | `'md'`      | Size of the combobox.                                                                              |
| `disabled`           | `boolean`      | No       | `false`     | Disables the input.                                                                                |
| `readonly`           | `boolean`      | No       | `false`     | Makes the input read-only.                                                                         |
| `required`           | `boolean`      | No       | `false`     | Marks the input as required for form validation.                                                   |
| `invalid`            | `boolean`      | No       | `false`     | Applies error styling and sets aria-invalid.                                                       |
| `autocomplete`       | `string`       | No       | `undefined` | Native autocomplete attribute of the input.                                                        |
| `minLength`          | `number`       | No       | `undefined` | Minimum number of characters allowed.                                                              |
| `maxLength`          | `number`       | No       | `undefined` | Maximum number of characters allowed.                                                              |
| `fullWidth`          | `boolean`      | No       | `false`     | Expands the combobox to the full width of its container.                                           |
| `listId`             | `string`       | No       | `undefined` | Custom id for the internal datalist; defaults to xId-list or a generated id.                       |
| `accessibilityLabel` | `string`       | No       | `undefined` | Accessible label for screen readers.                                                               |
| `describedBy`        | `string`       | No       | `undefined` | Id of the element that describes the input, set as aria-describedby.                               |
| `inlineStyles`       | `InlineStyles` | No       | `undefined` | Inline CSS styles applied to the wrapper element.                                                  |

**Events**

| Event       | Payload             | When                                     | bubbles/composed/cancelable |
| ----------- | ------------------- | ---------------------------------------- | --------------------------- |
| `ssInput`   | `SsInputValueEvent` | Native input (while dragging for slider) | true / true / true          |
| `ssChange`  | `SsInputValueEvent` | Native change                            | true / true / true          |
| `ssFocus`   | `FocusEvent`        | Native focus                             | true / true / true          |
| `ssBlur`    | `FocusEvent`        | Native blur                              | true / true / true          |
| `ssInvalid` | `SsInputValueEvent` | Native invalid                           | true / true / true          |

**Slots**

| Slot      | Expected content           | Constraints                           |
| --------- | -------------------------- | ------------------------------------- |
| (default) | Native `<option>` elements | Placed inside the native `<datalist>` |

**Public methods:** None — no `@Method` declaration.

**Internal state:** Private `fallbackListId`; `computedListId` selects `listId`, then `${xId}-list`, then the generated fallback.

**Actual render:** `<span class="ss-combobox">` containing `<input role="combobox" aria-autocomplete="list" list=...>` and `<datalist id=...><slot /></datalist>`.

**Styles:** `ss-combobox.scss`. Input styles, sizes, semantic colors, and wrapper classes follow existing control conventions.

**Accessibility:** Native datalist supplies suggestions; the input accepts `accessibilityLabel` and `describedBy`.

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../types/variant`, `../../../types/control-events`, `../../../utils/style`. Component dependencies: None — no component import.

⚠️ `ss-combobox.tsx:7,18` uses `comboboxId++`: the first fallback is `ss-combobox-list-0`. There is no `type` prop; the render uses a text input.

### 2.5. `ss-select`

Path: `src/components/atoms/ss-select/ss-select.tsx`. Mode: `scoped: true`. Responsibility: Native select with single or multiple selection.

**Props**

| Prop                 | Type                 | Required | Default     | Description                                                                    |
| -------------------- | -------------------- | -------- | ----------- | ------------------------------------------------------------------------------ |
| `xId`                | `string`             | No       | `undefined` | Id applied to the native select; also included in event details.               |
| `name`               | `string`             | No       | `undefined` | Name of the native select for form submission.                                 |
| `value`              | `string \| string[]` | No       | `undefined` | Selected value, or an array of values when multiple is enabled.                |
| `placeholder`        | `string`             | No       | `undefined` | Text of a disabled empty option rendered first; only in single-selection mode. |
| `color`              | `Variant`            | No       | `'primary'` | Color variant of the select.                                                   |
| `xStyle`             | `SelectStyle`        | No       | `'solid'`   | Visual style: solid, outline or underline.                                     |
| `size`               | `Size`               | No       | `'md'`      | Size of the select.                                                            |
| `disabled`           | `boolean`            | No       | `false`     | Disables the select.                                                           |
| `required`           | `boolean`            | No       | `false`     | Marks the select as required for form validation.                              |
| `invalid`            | `boolean`            | No       | `false`     | Applies error styling and sets aria-invalid.                                   |
| `multiple`           | `boolean`            | No       | `false`     | Allows selecting multiple options.                                             |
| `fullWidth`          | `boolean`            | No       | `false`     | Expands the select to the full width of its container.                         |
| `accessibilityLabel` | `string`             | No       | `undefined` | Accessible label for screen readers.                                           |
| `describedBy`        | `string`             | No       | `undefined` | Id of the element that describes the select, set as aria-describedby.          |
| `inlineStyles`       | `InlineStyles`       | No       | `undefined` | Inline CSS styles applied to the select element.                               |

**Events**

| Event       | Payload               | When           | bubbles/composed/cancelable |
| ----------- | --------------------- | -------------- | --------------------------- |
| `ssChange`  | `SsSelectChangeEvent` | Native change  | true / true / true          |
| `ssFocus`   | `FocusEvent`          | Native focus   | true / true / true          |
| `ssBlur`    | `FocusEvent`          | Native blur    | true / true / true          |
| `ssInvalid` | `SsSelectChangeEvent` | Native invalid | true / true / true          |

**Slots**

| Slot      | Expected content                  | Constraints                                              |
| --------- | --------------------------------- | -------------------------------------------------------- |
| (default) | Native `<option>` or `<optgroup>` | Placeholder option is inserted only for single selection |

**Public methods:** None — no `@Method` declaration.

**Internal state:** No `@State`; private native select reference and imperative `syncValue()` in `componentDidLoad` and `componentDidUpdate`, assigning `option.selected`.

**Actual render:** `<select>` with slotted options; single mode can prepend `<option value="" disabled selected>` for the placeholder.

**Styles:** `ss-select.scss`. Semantic color, `SelectStyle`, size and full-width control styling.

**Accessibility:** Native selection and validity; `accessibilityLabel`, `describedBy`, and conditional `aria-invalid`.

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../types/variant`, `../../../utils/style`. Component dependencies: None — no component import.

⚠️ No `readonly`, consistently with native select. Array `value` requires a JavaScript property, not an HTML attribute.

### 2.6. `ss-checkbox`

Path: `src/components/atoms/ss-checkbox/ss-checkbox.tsx`. Mode: `scoped: true`. Responsibility: Native checkbox with indeterminate support.

**Props**

| Prop            | Type           | Required | Default     | Description                                                                                                        |
| --------------- | -------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `xId`           | `string`       | No       | `undefined` | Id applied to the native input; also included in event details.                                                    |
| `name`          | `string`       | No       | `undefined` | Name of the native input for form submission.                                                                      |
| `value`         | `string`       | No       | `undefined` | Value of the native input sent on form submission.                                                                 |
| `checked`       | `boolean`      | No       | `false`     | Whether the checkbox is checked; updated on user interaction and reflected as an attribute. Mutable and reflected. |
| `indeterminate` | `boolean`      | No       | `false`     | Shows the indeterminate state; cleared when the user toggles the checkbox. Mutable and reflected.                  |
| `disabled`      | `boolean`      | No       | `false`     | Disables the checkbox.                                                                                             |
| `readonly`      | `boolean`      | No       | `false`     | Prevents changes to the checked state while still allowing focus and blur events.                                  |
| `required`      | `boolean`      | No       | `false`     | Marks the checkbox as required for form validation.                                                                |
| `invalid`       | `boolean`      | No       | `false`     | Applies error styling and sets aria-invalid.                                                                       |
| `label`         | `string`       | No       | `undefined` | Label text rendered when no slot content is provided.                                                              |
| `size`          | `Size`         | No       | `'md'`      | Size of the checkbox.                                                                                              |
| `describedBy`   | `string`       | No       | `undefined` | Id of the element that describes the checkbox, set as aria-describedby.                                            |
| `inlineStyles`  | `InlineStyles` | No       | `undefined` | Inline CSS styles applied to the root label element.                                                               |

**Events**

| Event       | Payload                | When           | bubbles/composed/cancelable |
| ----------- | ---------------------- | -------------- | --------------------------- |
| `ssChange`  | `SsCheckedChangeEvent` | Native change  | true / true / true          |
| `ssFocus`   | `FocusEvent`           | Native focus   | true / true / true          |
| `ssBlur`    | `FocusEvent`           | Native blur    | true / true / true          |
| `ssInvalid` | `SsCheckedChangeEvent` | Native invalid | true / true / true          |

**Slots**

| Slot      | Expected content       | Constraints                                         |
| --------- | ---------------------- | --------------------------------------------------- |
| (default) | Checkbox label content | Falls back to `label`; supplies the accessible name |

**Public methods:** None — no `@Method` declaration.

**Internal state:** Mutable/reflected `checked` and `indeterminate`; the only `@Watch` is `indeterminate`, synchronized in both load/update lifecycles.

**Actual render:** `<label class="ss-checkbox">` containing a visually hidden checkbox input, decorative `__control`/`__mark` spans, and `__label` with the default slot.

**Styles:** `ss-checkbox.scss`. Choice-control SCSS with disabled/readonly/invalid modifiers; close duplication with radio (D8).

**Accessibility:** Wrapping native label names the input. Readonly handling restores both `checked` and `indeterminate` after preventing the change.

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../utils/style`, `../../../types/control-events`. Component dependencies: None — no component import.

⚠️ No `accessibilityLabel`; use slot or `label`. `Size` accepts all seven values but large sizes collapse in SCSS.

### 2.7. `ss-radio`

Path: `src/components/atoms/ss-radio/ss-radio.tsx`. Mode: `scoped: true`. Responsibility: Native radio button; group ownership remains outside the atom.

**Props**

| Prop           | Type           | Required | Default     | Description                                                                    |
| -------------- | -------------- | -------- | ----------- | ------------------------------------------------------------------------------ |
| `xId`          | `string`       | No       | `undefined` | Id applied to the native/root element; included in event details when present. |
| `name`         | `string`       | No       | `undefined` | Native control name.                                                           |
| `value`        | `string`       | No       | `undefined` | Native control value.                                                          |
| `checked`      | `boolean`      | No       | `false`     | Checked state; mutable and reflected.                                          |
| `disabled`     | `boolean`      | No       | `false`     | Disable interaction or apply disabled presentation.                            |
| `readonly`     | `boolean`      | No       | `false`     | Prevent changes while retaining focusability.                                  |
| `required`     | `boolean`      | No       | `false`     | Native required state.                                                         |
| `invalid`      | `boolean`      | No       | `false`     | Error styling and aria-invalid.                                                |
| `label`        | `string`       | No       | `undefined` | Text fallback for the default slot.                                            |
| `size`         | `Size`         | No       | `'md'`      | Component size.                                                                |
| `describedBy`  | `string`       | No       | `undefined` | Id references for aria-describedby.                                            |
| `inlineStyles` | `InlineStyles` | No       | `undefined` | Inline CSS string or style object applied to the rendered root.                |

**Events**

| Event       | Payload                | When           | bubbles/composed/cancelable |
| ----------- | ---------------------- | -------------- | --------------------------- |
| `ssChange`  | `SsCheckedChangeEvent` | Native change  | true / true / true          |
| `ssFocus`   | `FocusEvent`           | Native focus   | true / true / true          |
| `ssBlur`    | `FocusEvent`           | Native blur    | true / true / true          |
| `ssInvalid` | `SsCheckedChangeEvent` | Native invalid | true / true / true          |

**Slots**

| Slot      | Expected content    | Constraints                                         |
| --------- | ------------------- | --------------------------------------------------- |
| (default) | Radio label content | Falls back to `label`; supplies the accessible name |

**Public methods:** None — no `@Method` declaration.

**Internal state:** Mutable/reflected `checked`; no `@State` or `@Watch`. Readonly guard restores `checked`.

**Actual render:** `<label class="ss-radio">` containing a visually hidden radio input, decorative control/mark, and slotted label.

**Styles:** `ss-radio.scss`. Near-identical choice-control SCSS to checkbox, with circular control and different mark.

**Accessibility:** Native radio grouping by shared `name` works in light DOM; the atom does not provide group label, group value, or `role="radiogroup"`.

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../utils/style`, `../../../types/control-events`. Component dependencies: None — no component import.

⚠️ Props/events lack JSDoc, as do those of `ss-badge`; radio is not the only undocumented atom. No `accessibilityLabel`. Larger `Size` values collapse in SCSS.

### 2.8. `ss-switch`

Path: `src/components/atoms/ss-switch/ss-switch.tsx`. Mode: `scoped: true`. Responsibility: Toggle switch implemented as a native checkbox.

**Props**

| Prop            | Type                  | Required | Default     | Description                                                                                                 |
| --------------- | --------------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| `xId`           | `string`              | No       | `undefined` | Id applied to the native input; also included in event details.                                             |
| `name`          | `string`              | No       | `undefined` | Name of the native input for form submission.                                                               |
| `value`         | `string`              | No       | `undefined` | Value of the native input sent on form submission.                                                          |
| `checked`       | `boolean`             | No       | `false`     | Whether the switch is on; updated on user interaction and reflected as an attribute. Mutable and reflected. |
| `disabled`      | `boolean`             | No       | `false`     | Disables the switch.                                                                                        |
| `readonly`      | `boolean`             | No       | `false`     | Prevents toggling while still allowing focus and blur events.                                               |
| `required`      | `boolean`             | No       | `false`     | Marks the switch as required for form validation.                                                           |
| `invalid`       | `boolean`             | No       | `false`     | Applies error styling and sets aria-invalid.                                                                |
| `label`         | `string`              | No       | `undefined` | Label text rendered when no slot content is provided.                                                       |
| `labelPosition` | `SwitchLabelPosition` | No       | `'end'`     | Position of the label relative to the control: start or end.                                                |
| `size`          | `Size`                | No       | `'md'`      | Size of the switch.                                                                                         |
| `describedBy`   | `string`              | No       | `undefined` | Id of the element that describes the switch, set as aria-describedby.                                       |
| `inlineStyles`  | `InlineStyles`        | No       | `undefined` | Inline CSS styles applied to the root label element.                                                        |

**Events**

| Event       | Payload                | When           | bubbles/composed/cancelable |
| ----------- | ---------------------- | -------------- | --------------------------- |
| `ssChange`  | `SsCheckedChangeEvent` | Native change  | true / true / true          |
| `ssFocus`   | `FocusEvent`           | Native focus   | true / true / true          |
| `ssBlur`    | `FocusEvent`           | Native blur    | true / true / true          |
| `ssInvalid` | `SsCheckedChangeEvent` | Native invalid | true / true / true          |

**Slots**

| Slot      | Expected content     | Constraints                                              |
| --------- | -------------------- | -------------------------------------------------------- |
| (default) | Switch label content | Falls back to `label`; `labelPosition` chooses start/end |

**Public methods:** None — no `@Method` declaration.

**Internal state:** Mutable/reflected `checked`; no `@State`. Readonly guard restores `checked`.

**Actual render:** Wrapping label with `<input type="checkbox" role="switch">`, decorative control and label content; explicit `aria-checked`.

**Styles:** `ss-switch.scss`. Choice-control size and state conventions, with label-position modifiers.

**Accessibility:** Wrapping label names the switch; `describedBy` provides description wiring; readonly retains focusability.

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../utils/style`, `../../../types/control-events`. Component dependencies: None — no component import.

⚠️ No `accessibilityLabel`; large declared `Size` values collapse in SCSS.

### 2.9. `ss-slider`

Path: `src/components/atoms/ss-slider/ss-slider.tsx`. Mode: `shadow: true`. Responsibility: Native range input with optional value output.

**Props**

| Prop                 | Type           | Required | Default     | Description                                                                       |
| -------------------- | -------------- | -------- | ----------- | --------------------------------------------------------------------------------- |
| `xId`                | `string`       | No       | `undefined` | Id applied to the native range input; also included in event details.             |
| `name`               | `string`       | No       | `undefined` | Name of the native input for form submission.                                     |
| `value`              | `number`       | No       | `0`         | Current value of the slider; updated on user interaction. Mutable; not reflected. |
| `min`                | `number`       | No       | `0`         | Minimum value.                                                                    |
| `max`                | `number`       | No       | `100`       | Maximum value.                                                                    |
| `step`               | `number`       | No       | `1`         | Step granularity of the value.                                                    |
| `color`              | `Variant`      | No       | `'primary'` | Color variant of the slider.                                                      |
| `size`               | `Size`         | No       | `'md'`      | Size of the slider.                                                               |
| `disabled`           | `boolean`      | No       | `false`     | Disables the slider.                                                              |
| `readonly`           | `boolean`      | No       | `false`     | Prevents changing the value while keeping the slider focusable.                   |
| `invalid`            | `boolean`      | No       | `false`     | Applies error styling and sets aria-invalid.                                      |
| `fullWidth`          | `boolean`      | No       | `false`     | Expands the slider to the full width of its container.                            |
| `showValue`          | `boolean`      | No       | `false`     | Renders the current value next to the slider.                                     |
| `valueLabel`         | `string`       | No       | `undefined` | Custom text rendered instead of the numeric value when showValue is enabled.      |
| `accessibilityLabel` | `string`       | No       | `undefined` | Accessible label for screen readers.                                              |
| `describedBy`        | `string`       | No       | `undefined` | Id of the element that describes the slider, set as aria-describedby.             |
| `inlineStyles`       | `InlineStyles` | No       | `undefined` | Inline CSS styles applied to the wrapper element.                                 |

**Events**

| Event       | Payload              | When                                     | bubbles/composed/cancelable |
| ----------- | -------------------- | ---------------------------------------- | --------------------------- |
| `ssInput`   | `SsSliderValueEvent` | Native input (while dragging for slider) | true / true / true          |
| `ssChange`  | `SsSliderValueEvent` | Native change                            | true / true / true          |
| `ssFocus`   | `FocusEvent`         | Native focus                             | true / true / true          |
| `ssBlur`    | `FocusEvent`         | Native blur                              | true / true / true          |
| `ssInvalid` | `SsSliderValueEvent` | Native invalid                           | true / true / true          |

**Slots**

| Slot | Expected content | Constraints                 |
| ---- | ---------------- | --------------------------- |
| None | —                | The render contains no slot |

**Public methods:** None — no `@Method` declaration.

**Internal state:** Mutable numeric `value` without reflection; private input reference; no `@State`.

**Actual render:** `<span class="ss-slider">` containing `<input type="range">` and optional `<output class="ss-slider__value">`.

**Styles:** `ss-slider.scss`. Range control sizes, semantic color and disabled/readonly/invalid modifiers.

**Accessibility:** Uses `accessibilityLabel`, `describedBy`, and `aria-readonly`; readonly guards exist in input, change, and keydown handlers (`ss-slider.tsx:84,94,104`).

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../types/variant`, `../../../utils/style`. Component dependencies: None — no component import.

⚠️ No `required`. `showValue` and `valueLabel` already introduce composition into the atom.

### 2.10. `ss-label`

Path: `src/components/atoms/ss-label/ss-label.tsx`. Mode: `scoped: true`. Responsibility: Native label association and required marker.

**Props**

| Prop           | Type           | Required | Default     | Description                                                                     |
| -------------- | -------------- | -------- | ----------- | ------------------------------------------------------------------------------- |
| `xId`          | `string`       | No       | `undefined` | Id applied to the rendered label element.                                       |
| `htmlFor`      | `string`       | No       | `undefined` | Id of the form control this label is associated with, set as the for attribute. |
| `label`        | `string`       | No       | `undefined` | Label text rendered when no slot content is provided.                           |
| `size`         | `Size`         | No       | `'md'`      | Size of the label.                                                              |
| `required`     | `boolean`      | No       | `false`     | Appends a required marker ( ) to the label.                                     |
| `disabled`     | `boolean`      | No       | `false`     | Applies the disabled styling.                                                   |
| `inlineStyles` | `InlineStyles` | No       | `undefined` | Inline CSS styles applied to the label element.                                 |

**Events**

| Event | Payload | When                           | bubbles/composed/cancelable |
| ----- | ------- | ------------------------------ | --------------------------- |
| None  | —       | No component event is declared | —                           |

**Slots**

| Slot      | Expected content           | Constraints           |
| --------- | -------------------------- | --------------------- |
| (default) | Label text or rich content | Falls back to `label` |

**Public methods:** None — no `@Method` declaration.

**Internal state:** None — `controlId` is a getter using `htmlFor || el.getAttribute('for') || undefined`.

**Actual render:** `<label id=... for={controlId}>` with slot fallback and optional `<span class="ss-label__required" aria-hidden="true">*</span>`.

**Styles:** `ss-label.scss`. Label size and disabled styling with required-marker styling.

**Accessibility:** Uses native `for`; raw `for` is supported alongside `html-for` through `@Element` (`src/index.html:542`).

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../utils/style`. Component dependencies: None — no component import.

⚠️ The required asterisk is `aria-hidden`; only the native control's `required` communicates the requirement. Label association remains subject to the control's shadow boundary.

### 2.11. `ss-icon`

Path: `src/components/atoms/ss-icon/ss-icon.tsx`. Mode: `shadow: true`. Responsibility: Size/color wrapper for SVG, image, or glyph content.

**Props**

| Prop           | Type                                              | Required | Default     | Description                                                                                   |
| -------------- | ------------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------- |
| `xId`          | `string`                                          | No       | `undefined` | Id applied to the root element.                                                               |
| `label`        | `string`                                          | No       | `undefined` | Accessible label; when provided the icon is exposed with role img instead of being hidden.    |
| `size`         | `IconSize`                                        | No       | `'md'`      | Size of the icon; inherit follows the surrounding font size.                                  |
| `color`        | `Variant \| 'foreground' \| 'muted' \| 'current'` | No       | `'current'` | Color token applied to the icon; current uses the current text color.                         |
| `decorative`   | `boolean`                                         | No       | `true`      | Hides the icon from assistive technology with aria-hidden when true and no label is provided. |
| `inlineStyles` | `InlineStyles`                                    | No       | `undefined` | Inline CSS styles applied to the root element.                                                |

**Events**

| Event | Payload | When                           | bubbles/composed/cancelable |
| ----- | ------- | ------------------------------ | --------------------------- |
| None  | —       | No component event is declared | —                           |

**Slots**

| Slot      | Expected content     | Constraints               |
| --------- | -------------------- | ------------------------- |
| (default) | SVG, image, or glyph | Caller-owned icon content |

**Public methods:** None — no `@Method` declaration.

**Internal state:** None — rendering derives from props.

**Actual render:** `<span>` with slotted content; `role="img"` and accessible label for non-decorative content.

**Styles:** `ss-icon.scss`. Icon color and size modifiers; `IconSize` extends `Size` with `inherit`.

**Accessibility:** `aria-hidden="true"` when `decorative && !label`; non-decorative icons use `label`.

**Dependencies:** `@stencil/core`, `../../../types/variant`, `../../../types/size`, `../../../utils/style`. Component dependencies: None — no component import.

⚠️ `IconSize` extends the shared size scale rather than using it unchanged.

### 2.12. `ss-spinner`

Path: `src/components/atoms/ss-spinner/ss-spinner.tsx`. Mode: `shadow: true`. Responsibility: Loading indicator.

**Props**

| Prop           | Type                                              | Required | Default     | Description                                                        |
| -------------- | ------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------ |
| `xId`          | `string`                                          | No       | `undefined` | Id applied to the root element.                                    |
| `size`         | `Size`                                            | No       | `'md'`      | Size of the spinner.                                               |
| `color`        | `Variant \| 'foreground' \| 'muted' \| 'current'` | No       | `'primary'` | Color variant of the spinner; current uses the current text color. |
| `label`        | `string`                                          | No       | `'Loading'` | Accessible label announced to screen readers.                      |
| `inlineStyles` | `InlineStyles`                                    | No       | `undefined` | Inline CSS styles applied to the root element.                     |

**Events**

| Event | Payload | When                           | bubbles/composed/cancelable |
| ----- | ------- | ------------------------------ | --------------------------- |
| None  | —       | No component event is declared | —                           |

**Slots**

| Slot | Expected content | Constraints                 |
| ---- | ---------------- | --------------------------- |
| None | —                | The render contains no slot |

**Public methods:** None — no `@Method` declaration.

**Internal state:** None — rendering derives from props.

**Actual render:** `<span role="status" aria-live="polite" aria-label=...>` with decorative `ss-spinner__track` span.

**Styles:** `ss-spinner.scss`. Spinner size and semantic/current/foreground/muted colors.

**Accessibility:** Live status announcement defaults to `Loading`; track is `aria-hidden`.

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../types/variant`, `../../../utils/style`. Component dependencies: None — no component import.

### 2.13. `ss-badge`

Path: `src/components/atoms/ss-badge/ss-badge.tsx`. Mode: `shadow: true`. Responsibility: Inline status label with optional dismissal.

**Props**

| Prop           | Type           | Required | Default     | Description                                                                    |
| -------------- | -------------- | -------- | ----------- | ------------------------------------------------------------------------------ |
| `xId`          | `string`       | No       | `undefined` | Id applied to the native/root element; included in event details when present. |
| `label`        | `string`       | No       | `undefined` | Text fallback for the default slot.                                            |
| `variant`      | `Variant`      | No       | `'primary'` | Semantic color variant.                                                        |
| `xStyle`       | `BadgeStyle`   | No       | `'subtle'`  | Visual style.                                                                  |
| `size`         | `Size`         | No       | `'sm'`      | Component size.                                                                |
| `pill`         | `boolean`      | No       | `false`     | Use pill shape.                                                                |
| `disabled`     | `boolean`      | No       | `false`     | Disable interaction or apply disabled presentation.                            |
| `dismissible`  | `boolean`      | No       | `false`     | Render the dismiss button.                                                     |
| `dismissLabel` | `string`       | No       | `'Dismiss'` | Accessible label of the dismiss button.                                        |
| `inlineStyles` | `InlineStyles` | No       | `undefined` | Inline CSS string or style object applied to the rendered root.                |

**Events**

| Event       | Payload               | When                   | bubbles/composed/cancelable |
| ----------- | --------------------- | ---------------------- | --------------------------- |
| `ssDismiss` | `SsBadgeDismissEvent` | Enabled dismiss action | true / true / true          |

**Slots**

| Slot      | Expected content | Constraints                             |
| --------- | ---------------- | --------------------------------------- |
| (default) | Badge content    | Falls back to `label`                   |
| icon      | Leading icon     | Detected with light-DOM `querySelector` |

**Public methods:** None — no `@Method` declaration.

**Internal state:** None — no `@State`; `@Element` inspects the icon slot.

**Actual render:** `<span>` with optional icon span, label span and optional `<button type="button" aria-label={dismissLabel}>x</button>`.

**Styles:** `ss-badge.scss`. Solid/subtle/outline variants, size, pill, and disabled modifiers.

**Accessibility:** Dismiss button has a customizable accessible label and does not emit dismissal while disabled.

**Dependencies:** `@stencil/core`, `../../../types/size`, `../../../types/variant`, `../../../utils/style`. Component dependencies: None — no component import.

⚠️ Default size is `sm`, unlike other atoms with a size default. Props/events lack JSDoc. Dismiss content is a hardcoded `x`, and the atom already composes an action.

### 2.14. `ss-avatar`

Path: `src/components/atoms/ss-avatar/ss-avatar.tsx`. Mode: `shadow: true`. Responsibility: Image or initials fallback with size and shape.

**Props**

| Prop           | Type                | Required | Default     | Description                                                                              |
| -------------- | ------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------- |
| `xId`          | `string`            | No       | `undefined` | Id applied to the root element; also included in event details.                          |
| `src`          | `string`            | No       | `undefined` | Image URL to display; the fallback content is shown when omitted or when loading fails.  |
| `alt`          | `string`            | No       | `undefined` | Alt text for the image; also used as the accessible label of the avatar.                 |
| `initials`     | `string`            | No       | `undefined` | Initials shown as fallback when no image is available and no slot content is provided.   |
| `size`         | `AvatarSize`        | No       | `'md'`      | Size of the avatar.                                                                      |
| `shape`        | `AvatarShape`       | No       | `'circle'`  | Shape of the avatar: circle, rounded or square.                                          |
| `loading`      | `'eager' \| 'lazy'` | No       | `'lazy'`    | Native image loading behavior; lazy defers loading until the image is near the viewport. |
| `inlineStyles` | `InlineStyles`      | No       | `undefined` | Inline CSS styles applied to the root element.                                           |

**Events**

| Event     | Payload              | When                | bubbles/composed/cancelable |
| --------- | -------------------- | ------------------- | --------------------------- |
| `ssLoad`  | `SsAvatarImageEvent` | Image load succeeds | true / true / true          |
| `ssError` | `SsAvatarImageEvent` | Image load fails    | true / true / true          |

**Slots**

| Slot      | Expected content | Constraints                                                  |
| --------- | ---------------- | ------------------------------------------------------------ |
| (default) | Fallback content | Used when there is no usable image; falls back to `initials` |

**Public methods:** None — no `@Method` declaration.

**Internal state:** `@State imageFailed` selects fallback after image error.

**Actual render:** `<span role="img" aria-label={alt || initials}>` containing `<img>` or an `aria-hidden` fallback span with slot/initials.

**Styles:** `ss-avatar.scss`. Avatar size, shape and fallback modifiers.

**Accessibility:** Accessible label comes from `alt || initials`; the image uses `alt`.

**Dependencies:** `@stencil/core`, `../../../utils/style`. Component dependencies: None — no component import.

⚠️ `AvatarSize` ends at `2xl`; it does not include `3xl`.

### 2.15. `ss-link`

Path: `src/components/atoms/ss-link/ss-link.tsx`. Mode: `shadow: true`. Responsibility: Native navigation anchor with disabled and underline states.

**Props**

| Prop                 | Type            | Required | Default     | Description                                                                        |
| -------------------- | --------------- | -------- | ----------- | ---------------------------------------------------------------------------------- |
| `xId`                | `string`        | No       | `undefined` | Id applied to the anchor element; also included in the ssClick detail.             |
| `href`               | `string`        | No       | `undefined` | Destination URL; omitted from the anchor while disabled.                           |
| `label`              | `string`        | No       | `undefined` | Link text rendered when no slot content is provided; also the aria-label fallback. |
| `target`             | `LinkTarget`    | No       | `undefined` | Where to open the link: \_self, \_blank, \_parent or \_top.                        |
| `rel`                | `string`        | No       | `undefined` | Custom rel attribute; defaults to noopener noreferrer when target is \_blank.      |
| `download`           | `string`        | No       | `undefined` | Native download attribute; prompts a download instead of navigating.               |
| `variant`            | `Variant`       | No       | `'primary'` | Color variant of the link.                                                         |
| `size`               | `LinkSize`      | No       | `'md'`      | Size of the link: sm, md or lg.                                                    |
| `underline`          | `LinkUnderline` | No       | `'hover'`   | Underline behavior: none, hover or always.                                         |
| `disabled`           | `boolean`       | No       | `false`     | Disables the link: removes href, blocks clicks and sets aria-disabled.             |
| `accessibilityLabel` | `string`        | No       | `undefined` | Accessible label for screen readers; falls back to label.                          |
| `current`            | `string`        | No       | `undefined` | Value for aria-current, for example page.                                          |
| `inlineStyles`       | `InlineStyles`  | No       | `undefined` | Inline CSS styles applied to the anchor element.                                   |

**Events**

| Event     | Payload            | When          | bubbles/composed/cancelable |
| --------- | ------------------ | ------------- | --------------------------- |
| `ssClick` | `SsLinkClickEvent` | Enabled click | true / true / true          |

**Slots**

| Slot      | Expected content | Constraints           |
| --------- | ---------------- | --------------------- |
| (default) | Link content     | Falls back to `label` |

**Public methods:** None — no `@Method` declaration.

**Internal state:** None — computed `rel` and disabled presentation derive from props.

**Actual render:** `<a>` with href omitted when disabled, computed rel, `aria-disabled`, `aria-current`, and disabled `tabindex=-1`.

**Styles:** `ss-link.scss`. Semantic variants, underline mode, and the narrower `LinkSize` scale.

**Accessibility:** Adds `noopener noreferrer` for `_blank`; supports `accessibilityLabel`; disabled link cannot navigate.

**Dependencies:** `@stencil/core`, `../../../types/variant`, `../../../utils/style`. Component dependencies: None — no component import.

⚠️ `LinkSize` supports only `sm`, `md`, and `lg`. Its `ssClick` detail is an object, unlike button.

### 2.16. `ss-divider`

Path: `src/components/atoms/ss-divider/ss-divider.tsx`. Mode: `shadow: true`. Responsibility: Horizontal or vertical separator.

**Props**

| Prop           | Type                 | Required | Default        | Description                                                                                     |
| -------------- | -------------------- | -------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `xId`          | `string`             | No       | `undefined`    | Id applied to the root element.                                                                 |
| `orientation`  | `DividerOrientation` | No       | `'horizontal'` | Orientation of the divider: horizontal or vertical.                                             |
| `spacing`      | `DividerSpacing`     | No       | `'md'`         | Outer margin along the divider axis: none, sm, md or lg.                                        |
| `decorative`   | `boolean`            | No       | `true`         | When true the divider is purely visual; when false it gets role separator and aria-orientation. |
| `label`        | `string`             | No       | `undefined`    | Label text rendered between the lines when no slot content is provided.                         |
| `inlineStyles` | `InlineStyles`       | No       | `undefined`    | Inline CSS styles applied to the root element.                                                  |

**Events**

| Event | Payload | When                           | bubbles/composed/cancelable |
| ----- | ------- | ------------------------------ | --------------------------- |
| None  | —       | No component event is declared | —                           |

**Slots**

| Slot      | Expected content | Constraints                                                                        |
| --------- | ---------------- | ---------------------------------------------------------------------------------- |
| (default) | Separator label  | Rendered when label exists or the divider is non-decorative; falls back to `label` |

**Public methods:** None — no `@Method` declaration.

**Internal state:** None — rendering derives from props.

**Actual render:** `<div>` with two `ss-divider__line` spans and an optional slotted `ss-divider__label` span.

**Styles:** `ss-divider.scss`. Orientation and spacing modifiers use existing tokens.

**Accessibility:** `role="separator"` only when non-decorative, with `aria-orientation`.

**Dependencies:** `@stencil/core`, `../../../utils/style`. Component dependencies: None — no component import.

### 2.17. `ss-tooltip`

Path: `src/components/atoms/ss-tooltip/ss-tooltip.tsx`. Mode: `shadow: true`. Responsibility: Positioned tooltip with caller-owned trigger and content.

**Props**

| Prop           | Type               | Required | Default     | Description                                                                                                                |
| -------------- | ------------------ | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `xId`          | `string`           | No       | `undefined` | Id applied to the root element; also included in the ssOpenChange detail.                                                  |
| `open`         | `boolean`          | No       | `false`     | Whether the tooltip is open; updated by hover and click interactions and reflected as an attribute. Mutable and reflected. |
| `content`      | `string`           | No       | `undefined` | Tooltip text rendered when no default slot content is provided.                                                            |
| `placement`    | `TooltipPlacement` | No       | `'top'`     | Placement relative to the trigger: top, right, bottom or left.                                                             |
| `trigger`      | `TooltipTrigger`   | No       | `'hover'`   | Interaction that toggles the tooltip: hover (also focus), click, or manual (controlled through open).                      |
| `disabled`     | `boolean`          | No       | `false`     | Disables the tooltip; it stays closed and ignores interactions.                                                            |
| `inlineStyles` | `InlineStyles`     | No       | `undefined` | Inline CSS styles applied to the root element.                                                                             |

**Events**

| Event          | Payload                    | When                                                              | bubbles/composed/cancelable |
| -------------- | -------------------------- | ----------------------------------------------------------------- | --------------------------- |
| `ssOpenChange` | `SsTooltipOpenChangeEvent` | Interaction changes open state; external assignment does not emit | true / true / true          |

**Slots**

| Slot      | Expected content | Constraints                                              |
| --------- | ---------------- | -------------------------------------------------------- |
| trigger   | Trigger element  | Hover/focus, click, or manual behavior follows `trigger` |
| (default) | Tooltip content  | Falls back to `content`                                  |

**Public methods:** None — no `@Method` declaration.

**Internal state:** Mutable/reflected `open`; private `contentId` uses the template literal `` `ss-tooltip-${++tooltipId}` ``; no `@State`.

**Actual render:** Wrapper span with hover/focus handlers in hover mode; trigger span with conditional `aria-describedby` and click handler; content span with `role="tooltip"` and `aria-hidden`.

**Styles:** `ss-tooltip.scss`. `z-index: var(--ss-z-index-tooltip)`; pure CSS placement without collision detection or flipping.

**Accessibility:** `ssOpenChange` is emitted only for interaction-driven changes through `setOpen`, not external prop assignments.

**Dependencies:** `@stencil/core`, `../../../utils/style`. Component dependencies: None — no component import.

⚠️ No Escape dismissal, focus management, or collision handling. `ss-tooltip.tsx:4,20` pre-increments, so its first generated id is `ss-tooltip-1`.

### 2.18. `ss-typography`

Path: `src/components/atoms/ss-typography/ss-typography.tsx`. Mode: `scoped: true`. Responsibility: All generic text: paragraphs, headings, inline semantics, code, helper/error text and captions.

**Props**

| Prop            | Type               | Required | Default        | Description                                                                                                                                                                                             |
| --------------- | ------------------ | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `xId`           | `string`           | No       | `undefined`    | Id applied to the rendered element.                                                                                                                                                                     |
| `as`            | `TypographyTag`    | No       | `'p'`          | HTML tag to render; ignored when level is set.                                                                                                                                                          |
| `level`         | `TypographyLevel`  | No       | `undefined`    | Heading level (1–6). Sets the rendered tag to h{level} and applies display font, bold weight, tight line-height, and a size scaled to the level. All defaults are overridable via the individual props. |
| `family`        | `TypographyFamily` | No       | `undefined`    | Font family. Defaults to display when level is set, mono when as is code, sans otherwise.                                                                                                               |
| `fontSize`      | `TypographySize`   | No       | `undefined`    | Font size. Defaults to the level-based size when level is set, md otherwise.                                                                                                                            |
| `align`         | `TextAlign`        | No       | `'left'`       | Text alignment.                                                                                                                                                                                         |
| `color`         | `TypographyColor`  | No       | `'foreground'` | Text color; foreground uses the semantic foreground token and adapts to dark mode.                                                                                                                      |
| `fontWeight`    | `FontWeight`       | No       | `undefined`    | Font weight. Defaults to bold when level is set, regular otherwise.                                                                                                                                     |
| `lineHeight`    | `LineHeight`       | No       | `undefined`    | Line height. Defaults to tight when level is set, normal otherwise.                                                                                                                                     |
| `letterSpacing` | `LetterSpacing`    | No       | `'normal'`     | Letter spacing.                                                                                                                                                                                         |
| `inlineStyles`  | `InlineStyles`     | No       | `undefined`    | Inline CSS styles applied to the rendered element.                                                                                                                                                      |
| `truncate`      | `boolean`          | No       | `false`        | Truncates overflowing text with an ellipsis on a single line.                                                                                                                                           |
| `transform`     | `TextTransform`    | No       | `'normal'`     | Text transform, for example uppercase.                                                                                                                                                                  |

**Events**

| Event | Payload | When                           | bubbles/composed/cancelable |
| ----- | ------- | ------------------------------ | --------------------------- |
| None  | —       | No component event is declared | —                           |

**Slots**

| Slot      | Expected content   | Constraints                                |
| --------- | ------------------ | ------------------------------------------ |
| (default) | Typography content | Rendered inside the effective semantic tag |

**Public methods:** None — no `@Method` declaration.

**Internal state:** None — five effective getters derive tag, font size, font weight, line height, and family through `LEVEL_SIZE` and props.

**Actual render:** Dynamic tag: `level` overrides `as`; heading defaults use display/bold/tight and level-specific size, while `as="code"` selects mono without a heading override.

**Styles:** `ss-typography.scss`. Typography token modifiers for family, size, weight, line height, spacing, alignment, color, transform and truncation.

**Accessibility:** Uses semantic native tags. `docs/atoms.md` assigns helper text to `color="muted"` and errors to `color="error"`.

**Dependencies:** `@stencil/core`, `../../../types/variant`, `../../../types/size`, `../../../utils/style`, `../../../types/typography`. Component dependencies: None — no component import.

⚠️ `TypographySize` extends `Size` with `4xl`. The dossier says four effective getters but lists five; source declares five.

## 3. Detected conventions

| Area                        | Established convention                                                                                                                       | Application to molecules                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Naming                      | `ss-<kebab>` tag, `Ss<PascalCase>` class, directory and filename equal to tag                                                                | Keep the same convention under `molecules/`                                          |
| Attributes                  | camelCase props become kebab-case: `x-id`, `x-style`, `label-position`, `inline-styles`, `full-width`, `accessibility-label`, `described-by` | Keep attribute-friendly scalar configuration                                         |
| Global attribute collisions | `xId` and `xStyle` avoid overloading native `id` and `style`; six atoms declare `xStyle`                                                     | Keep `xId`; no proposed molecule needs `xStyle`                                      |
| Events                      | `ss` plus PascalCase; named payload types use `Ss<Concept>Event`                                                                             | One normalized object event per aggregate concept                                    |
| Type location               | Shared control contracts in `src/types/control-events.d.ts`; component-local unions and payloads exported from their `.tsx`                  | Share a type only when multiple components actually use it                           |
| BEM                         | Tag is the block, `__element` is internal structure, `--modifier` is prop/state presentation                                                 | Private `getClasses()` returning a class map; BEM is not the public API              |
| Slots                       | `<slot>{this.label}</slot>` and similar fallbacks; consumer owns rich content                                                                | Provide prop fallback and named content slot where justified                         |
| Mutable props               | `checked`, `indeterminate`, `open` are mutable/reflected; slider numeric `value` is mutable without reflection                               | Radio group `value` follows the mutable/reflected string precedent                   |
| `@State`                    | Interaction-only rendering state, such as `imageFailed`, temporary disable and feedback                                                      | Keep consumer-controlled values public; generated ids and resolved controls internal |
| `@Element`                  | Button/badge inspect icon content; label reads raw `for`                                                                                     | Light-DOM inspection is a precedent, not a general requirement                       |
| `@Watch`                    | Only checkbox `indeterminate`, whose native state is not an attribute                                                                        | Do not add watchers without a concrete synchronization need                          |
| Lifecycles                  | Select value and checkbox indeterminate synchronize in `componentDidLoad` and `componentDidUpdate`                                           | Use the same lifecycle points for proposed child coordination                        |
| Cleanup                     | Button clears its timers in `disconnectedCallback`                                                                                           | Preserve cleanup where interaction introduces resources                              |
| Styles                      | Same-name SCSS, semantic `--ss-*` tokens, local Sass size maps and shared mixins                                                             | Reuse tokens and `resolveInlineStyles`; do not create a new styling contract         |
| Tests                       | Component `test/*.spec.tsx` uses `newSpecPage`, `getRoot`, `getElement`; e2e uses `newE2EPage`, `spyOnEvent`, `toHaveReceivedEventDetail`    | Same component-local test layout; utility specs stay adjacent                        |
| Docs                        | Generated `readme.md`, prop/event JSDoc and class `@slot`; architecture under lowercase `docs/*.md`                                          | Do not manually maintain generated readmes                                           |

The dossier describes token-only styling, including `--ss-sizing-none`, `--ss-sizing-full`, and `--ss-colors-transparent` in place of common literals.
The reusable mixins are `focus-ring`, `atom-disabled`, `atom-control-base`, `atom-control-sizes`, `atom-accent-variants`, `btn-variant`, and `input-variant`, with
`$atom-control-sizes`. No component exposes styling parts.

⚠️ JSDoc coverage has two exceptions, `ss-radio` and `ss-badge`. The event-object convention has the scalar button exception and the raw `FocusEvent` exceptions;
those raw event details should not be described as normalized `{ xId, ... }` payloads.

## 4. Duplication analysis

| Finding                               | Evidence                                                                               | Classification                              | Rationale and decision                                                                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 — Unique ids                       | `ss-combobox.tsx:7,18`; `ss-tooltip.tsx:4,20`                                          | Shared utility                              | Same non-UI concept implemented twice, with post-increment versus pre-increment. Add `src/utils/id.ts` for new molecules; atom migration is separate                           |
| D2 — Label/control/description wiring | Eight `describedBy` declarations; `src/index.html:541-548`, especially `542-543`       | Molecule candidate                          | Demo repeats label/control and required state; invalid controls have no composed error message. `ss-field` supplies ids, descriptions and coordinated state                    |
| D3 — Radio grouping                   | `src/index.html:918-928`, `934-940`                                                    | Molecule candidate                          | Twelve radios repeat group names without group role, label, value or aggregate event. Add `ss-radio-group`                                                                     |
| D4 — `emitValue()`                    | Eight control atoms                                                                    | Keep internal                               | Bodies read different sources and build different payloads. A common name is not a shared operation; extraction would add branching                                            |
| D5 — Readonly guards                  | `ss-checkbox.tsx:86`, `ss-radio.tsx:52`, `ss-switch.tsx:73`, `ss-slider.tsx:84,94,104` | Keep internal                               | Six guards in four atoms restore different native properties; slider also blocks keyboard interaction                                                                          |
| D6 — BEM `getClasses()`               | All 18 atoms                                                                           | Shared utility candidate, deferred P2       | A `bem(block, mods)` helper is possible, but conditional and compound modifiers vary. Keep inline maps in new molecules; do not block implementation on a library-wide rewrite |
| D7 — Inline styles                    | All 18 atoms call `resolveInlineStyles`                                                | Already resolved                            | `src/utils/style.ts` is the abstraction; reuse it                                                                                                                              |
| D8 — Checkbox/radio SCSS              | Same-name SCSS files, approximately 85% alike according to the dossier                 | Keep internal now; optional shared mixin P2 | Radius, check clip-path, indeterminate handling and mark color differ. `choice-control($block)` is plausible but not required by molecules                                     |
| D9 — Focus/blur details               | Eight atoms emit raw `FocusEvent`                                                      | Keep internal/public API unchanged          | Published API; molecules must not duplicate these events. The dossier's count of seven is corrected to eight                                                                   |
| D10 — Size scales                     | `AvatarSize`, `LinkSize`, `IconSize`, `TypographySize`; choice-control SCSS            | Keep existing contracts; no abstraction     | Different supported ranges and collapsed large choice sizes do not justify a new scale. Molecules use `Size`                                                                   |
| D11 — `variant` versus `color`        | Three variant-based atoms and eight color-based atoms                                  | Keep published API unchanged; P2 debt       | Renaming is breaking. Use `variant` for any future own color intent and `color` only for direct forwarding; these three molecules need neither                                 |

D2's evidence is **no demo consumer**, not zero test coverage: `ss-input.spec.tsx:89-98` sets `described-by` and asserts `aria-describedby`.
The existing `invalid` API applies state and styling; there is no field-level error-message composition in the demo.

### No Abstraction Needed

| Pattern                                                 | Decision                         | Why                                                                                                                                 |
| ------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| D4 payload builders                                     | None — keep internal             | Different event sources, optional fields and numeric/string/checked semantics                                                       |
| D5 readonly guards                                      | None — keep internal             | Checkbox restores indeterminate as well as checked; radio/switch restore checked; slider restores stringified value and blocks keys |
| D8 choice styling in this phase                         | None — no prerequisite refactor  | Molecules do not require the extraction, and existing atoms are outside scope                                                       |
| D9 focus/blur re-emission                               | None — no molecule wrapper event | Original events already bubble; an additional emission only duplicates them                                                         |
| D10 size normalization                                  | None — no new common scale       | Existing public unions differ; recording that is more accurate than promising uniform rendering                                     |
| Inline style extraction                                 | None — already resolved          | Use the existing utility                                                                                                            |
| Helper/error text atom                                  | None — already covered           | `ss-typography` owns generic text, explicitly including helper/error text                                                           |
| Shared keyboard behavior                                | None                             | Only slider's readonly key blocker exists; proposed radio navigation remains native                                                 |
| Custom validation                                       | None                             | The repository delegates validity to native controls                                                                                |
| Value formatting / cross-component event transformation | None in current code             | No such reusable implementation was found; proposed group aggregation is new design                                                 |
| Component-to-component imports                          | None                             | Current composition is caller-owned slot content in the demo                                                                        |

## 5. Props / slots / events / state strategy

The existing demo configures atoms through HTML attributes. `InlineStyles = string | Record<string, string>` preserves that path while accepting property objects in frameworks.
Slots already carry option elements, tooltip triggers, labels, icons, and avatar fallbacks. `ss-field` therefore receives its control through the default slot; it does not choose
and instantiate a control from a `control="input"` prop.

| Mechanism               | Existing example                                                   | Proposed application                                                      |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Scalar prop             | `ss-input.required`, `ss-label.label`, `ss-button.size`            | Label/helper/error strings, group name, orientation and state             |
| Prop plus slot fallback | Button/label/checkbox/radio/switch/badge/link content              | `label`, `helper`, `error` slots override matching text props             |
| Structural slot         | Select options, combobox datalist options, tooltip trigger         | One field control, N radio or checkbox children                           |
| Normalized event        | `SsInputValueEvent`, `SsCheckedChangeEvent`                        | Group change payload with group `xId`, name and aggregate value           |
| Mutable public state    | Reflected `checked` and `open`; non-reflected numeric slider value | Reflected string radio-group value; checkbox array remains property-based |
| Internal state          | Avatar image failure and button feedback                           | Resolved child references and generated ids                               |

An array value is an explicit exception to attribute serialization, already present in `ss-select`; the checkbox group keeps that precedent rather than inventing CSV encoding.
The scalar button `ssClick` payload is not a precedent for new events. Field events remain the child's original events; no forwarding API is needed for observation.

| Operational guide        | Apply when                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Use props when…          | A typed scalar or closed option belongs in HTML configuration and generated API documentation                                 |
| Use slots when…          | The caller owns rich text, icons, native options, or the actual control; a component selector prop would hide the child's API |
| Use events when…         | A user action or state change matters to the consumer; emit one object payload per concept with `xId`                         |
| Use internal state when… | A value is only rendering/coordination state, such as a generated id or failed image; consumer-controlled values remain props |
| Avoid slots when…        | The value is a closed typed option such as size or orientation, or the slot has no concrete consumer                          |
| Avoid forwarding when…   | The consumer can already set the prop directly on the slotted atom; forward only coordinated state                            |

For example, `<ss-field><ss-input size="lg" placeholder="Email"></ss-input></ss-field>` needs no field `placeholder` prop.
The field's own `size` coordinates label/message presentation, not the full input API; it does not automatically change the slotted input's size in the dossier's forwarding table.

## 6. Prop forwarding

### Classification by molecule

| Molecule            | Class       | Contract                                                                                                                                                        |
| ------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ss-field`          | Own         | `xId`, `label`, `helperText`, `errorText`, `required`, `invalid`, `disabled`, `size`, `orientation`, `inlineStyles`                                             |
| `ss-field`          | Forwarded   | Label text/size; label and control required/disabled; control invalid; derived control id and description                                                       |
| `ss-field`          | Derived     | `controlId` from control `xId` or generation; `${controlId}-helper`, `${controlId}-error`; active description ids; `showError`                                  |
| `ss-field`          | Internal    | Id seed and resolved first control reference                                                                                                                    |
| `ss-field`          | Not exposed | Control-specific values, constraints, appearance and behavior; see below                                                                                        |
| `ss-radio-group`    | Own         | `xId`, required `name`, mutable/reflected `value`, `label`, `helperText`, `errorText`, `required`, `invalid`, `disabled`, `orientation`, `size`, `inlineStyles` |
| `ss-radio-group`    | Forwarded   | Shared name, disabled, size; derived checked; required on first radio                                                                                           |
| `ss-radio-group`    | Derived     | `checked = value === radio.value`, group label/helper/error ids, description id list                                                                            |
| `ss-radio-group`    | Internal    | List of light-DOM `ss-radio` children                                                                                                                           |
| `ss-radio-group`    | Not exposed | Per-radio label/value/invalid/describedBy and group readonly                                                                                                    |
| `ss-checkbox-group` | Own         | Parallel group API: optional `name`, array `value`, plus optional `selectAllLabel`; 13 props                                                                    |
| `ss-checkbox-group` | Forwarded   | Optional name, disabled and size to checkboxes; checked derived from aggregate membership; master label from `selectAllLabel`                                   |
| `ss-checkbox-group` | Derived     | Child checked states, master indeterminate, group description and label ids                                                                                     |
| `ss-checkbox-group` | Internal    | Light-DOM checkbox list and generated ids, following the parallel group design                                                                                  |
| `ss-checkbox-group` | Not exposed | Child-specific configuration and an independently controlled master indeterminate state                                                                         |

### Props not exposed

| Molecule            | Atom prop not re-exposed                                          | Reason                                                                                  |
| ------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `ss-field`          | `type`, `placeholder`, `value`, `name`                            | Directly configurable on the chosen control; the field does not own input semantics     |
| `ss-field`          | `min`, `max`, `step`, `minLength`, `maxLength`, `autocomplete`    | Native constraints and input behavior belong to the control                             |
| `ss-field`          | `rows`, `cols`, `resize`, `multiple`, `listId`                    | Specific to only some controls; forwarding creates a union of unrelated APIs            |
| `ss-field`          | `xStyle`, `color`, `fullWidth`, `readonly`                        | Appearance/behavior is already available on the slotted element                         |
| `ss-field`          | Child `inlineStyles`, `accessibilityLabel`                        | Container styling and control naming are distinct; do not silently copy container props |
| `ss-radio-group`    | `readonly`                                                        | Not proposed as group behavior; remains on individual atoms                             |
| `ss-radio-group`    | Individual `value`, `label`                                       | Caller owns each option; group `value` and `label` have different meanings              |
| `ss-radio-group`    | Individual `invalid`, `describedBy`                               | Group owns group error and description; no per-radio forwarding facade                  |
| `ss-checkbox-group` | Individual `value`, `label`, `readonly`, `invalid`, `describedBy` | Same separation as radio group; caller configures individual atoms                      |
| `ss-checkbox-group` | Master `indeterminate`                                            | Derived from aggregate selection, not a second public source of truth                   |
| All three           | `variant`, `xStyle`                                               | No own color/style variants are justified by the dossier                                |

For custom-element controls, forwarding must use the actual atom API: `xId`/`x-id` and `describedBy`/`described-by` reach the rendered native input.
Writing only `id` or `aria-describedby` on the custom-element host does not invoke those props. Native controls instead receive `id` and `aria-describedby` directly.
This corrects the dossier's shorthand in AD-3; it does not add a new public API. The field coordinates only props a chosen control supports: slider has no `required`.

## 7. Event forwarding

| Source / concept                               | Decision                                              | Molecule event | Payload / behavior                                                                            |
| ---------------------------------------------- | ----------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| Field child `ssInput`, `ssChange`, `ssInvalid` | Propagate unchanged                                   | None           | Original bubbling/composed custom event reaches the consumer                                  |
| Child `ssFocus`, `ssBlur`                      | Hide from the molecule's declared API; do not re-emit | None           | Original events still bubble. “Hide” does not mean stopping them                              |
| Radio child `ssChange`                         | Combine + transform                                   | `ssChange`     | `SsRadioGroupChangeEvent`; stop child propagation before emitting the group event             |
| Radio child `ssInvalid`                        | Combine                                               | `ssInvalid`    | Proposed `SsRadioGroupChangeEvent`; avoid duplicate child/group invalid notifications         |
| Checkbox child change                          | Combine + transform                                   | `ssChange`     | `SsCheckboxGroupChangeEvent`, containing aggregate array value                                |
| Checkbox group invalid                         | Combine, following parallel group API                 | `ssInvalid`    | `SsCheckboxGroupChangeEvent`; exact group validity semantics are not specified in the dossier |
| Renamed child events                           | Rename: None                                          | None           | No consumer requires a renamed event                                                          |
| Field readiness                                | Own event: None                                       | None           | Do not introduce `ssFieldReady`; it has no demonstrated consumer in v1                        |

All proposed group events use the existing `true / true / true` bubbles/composed/cancelable defaults. Stopping propagation is necessary for events that are actually replaced;
otherwise one interaction reaches an ancestor twice with two different payload shapes. Direct listeners on the child still receive its own event; the change is at the group boundary.
Do not intercept the group's own emitted event as though it came from a child.

```ts
export interface SsRadioGroupChangeEvent {
  xId?: string;
  name: string;
  value: string;
}

export interface SsCheckboxGroupChangeEvent {
  xId?: string;
  name?: string;
  value: string[];
}
```

⚠️ These are the dossier's proposed payloads. Radio `value` is optional before selection, yet the proposed invalid payload requires a string even when required validation fails
because nothing is selected. The dossier provides no empty-value rule; that must be resolved before implementation rather than silently inventing a sentinel.
The checkbox invalid behavior is likewise incomplete. No current atom implements this group aggregation.

## 8. Proposed molecules

These are design proposals, not existing tags. Property defaults below are those specified by the dossier or inherited through its explicit parallel-group API.
Where that parallelism does not define a valid native behavior, the gap is recorded rather than implemented by assumption.

### 8.1. `ss-field` — P0

Tag: `ss-field`. Path: `src/components/molecules/ss-field/ss-field.tsx`. Mode: `scoped: true` to keep the generated label and light-DOM controls in the same tree.
Its single responsibility is associating a form control with label, help and error content, including generated ids and coordinated accessibility state.

Evidence: eight atoms expose `describedBy`, no `src/index.html` usage exists, and label/control markup repeats at `src/index.html:541-548`.
At `src/index.html:542-543`, required state is written on both label and control. No field composition supplies an error message for invalid controls.
The input spec does test description forwarding, so this is a missing composition consumer, not a wholly untested atom prop.

```text
ss-field (scoped)
├── ss-label           if label prop or label slot exists
├── default slot       one caller-owned form control
├── ss-typography      helper, as="small", color="muted", helperId
└── ss-typography      error, as="small", color="error", errorId, role="alert"
```

The label retains its native `<label>` and required marker; typography retains all generic text rendering; the control retains value, native validation and events.
The field adds association, description ordering, coordinated required/disabled/invalid state, layout and DOM order.

**Own props**

| Prop           | Type                         | Required | Default      | Description                                      |
| -------------- | ---------------------------- | -------- | ------------ | ------------------------------------------------ |
| `xId`          | `string`                     | No       | `undefined`  | Container id and generated-id seed               |
| `label`        | `string`                     | No       | `undefined`  | Label slot fallback                              |
| `helperText`   | `string`                     | No       | `undefined`  | Helper slot fallback                             |
| `errorText`    | `string`                     | No       | `undefined`  | Error slot fallback, visible only while invalid  |
| `required`     | `boolean`                    | No       | `false`      | Label marker and supported native required state |
| `invalid`      | `boolean`                    | No       | `false`      | Control invalid state and error visibility       |
| `disabled`     | `boolean`                    | No       | `false`      | Label attenuation and control disable            |
| `size`         | `Size`                       | No       | `'md'`       | Label and auxiliary text size                    |
| `orientation`  | `'vertical' \| 'horizontal'` | No       | `'vertical'` | Label/control layout                             |
| `inlineStyles` | `InlineStyles`               | No       | `undefined`  | Container styles                                 |

**Forwarded props**

| Molecule prop         | Target atom                  | Target prop                | Reason                                                          |
| --------------------- | ---------------------------- | -------------------------- | --------------------------------------------------------------- |
| `label`               | `ss-label`                   | `label`                    | Preserve native label ownership and fallback                    |
| `required`            | `ss-label`                   | `required`                 | Required marker                                                 |
| `required`            | Slotted control              | `required`, when supported | Remove duplicate consumer state (`src/index.html:542-543`)      |
| `disabled`            | `ss-label`                   | `disabled`                 | Match disabled presentation                                     |
| `disabled`            | Slotted control              | `disabled`                 | Coordinate one state source                                     |
| `size`                | `ss-label`                   | `size`                     | Label sizing; no automatic control-size forwarding is specified |
| `invalid`             | Slotted control              | `invalid`                  | Let the control render its own `aria-invalid`                   |
| Derived `describedBy` | Slotted control              | `describedBy`              | Associate active helper/error ids                               |
| Derived `controlId`   | Slotted control / `ss-label` | `xId` / `htmlFor`          | Connect native id and label target                              |

Typography uses `fontSize`, not `size`; the dossier states auxiliary sizing intent but provides no exact size-to-message mapping. Do not invent one.
For native controls, use native attributes instead of atom props. No value or style mutation is part of the field's child-coordination contract.

**Slots**

| Slot        | Expected content                                                                                                                            | Constraints                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `(default)` | Exactly one `ss-input`, `ss-textarea`, `ss-select`, `ss-combobox`, `ss-slider`, `ss-checkbox`, `ss-switch`, or native input/select/textarea | If several controls are supplied, wire only the first |
| `label`     | Rich label content                                                                                                                          | Overrides `label`                                     |
| `helper`    | Rich helper content                                                                                                                         | Overrides `helperText`                                |
| `error`     | Rich error content                                                                                                                          | Overrides `errorText`; visible only while invalid     |

The dossier also lists a slotted `ss-radio-group`; this is discouraged in v1 because groups already provide label/help/error composition.
Checkbox/switch use with an empty own label is proposed to avoid duplicate labels, but accessible naming must still be verified for that concrete composition.

**Events:** None — no own events are needed; original control events bubble.

**Internal state:** Proposed `@State controlId` and `@State resolvedControl?: HTMLElement`, with helper/error ids derived from the resolved control id.
Use `src/utils/id.ts` when an explicit id is absent. Resolve and wire the first control in `componentDidLoad`; synchronize again in `componentDidUpdate`, following select and checkbox.
The dossier alternates between field `xId` as seed and child `xId` as first choice; preserve an explicit child id. Exact fallback seed precedence beyond that is not specified.

**Variants:** Seven `Size` values, vertical/horizontal orientation, invalid/disabled/required state. No own color variant or `xStyle`.

**Accessibility:** Description ordering is helper first, then active error; omit the attribute if neither exists. The error has `role="alert"`.
The control owns `aria-invalid`; required state reaches the native control, while the label's asterisk stays `aria-hidden`. No focus management is proposed.
The dossier's `showError = invalid && !!errorText` does not cover an error supplied only through its supported slot; implementation must include active slot content when resolving
error visibility and description ids. No slot-detection algorithm is supplied.

✅ **Boundary limitation — resolved.** `ss-input`, `ss-textarea`, and `ss-slider` keep their own shadow roots, and a scoped field still does not make their inner controls
light-DOM nodes. Three mechanisms close the gap, each verified against a real browser rather than against the markup:

1. **Focus.** Phase 0 made the three atoms `formAssociated` with `shadow: { delegatesFocus: true }`, so a `<label for>` pointing at the **host id** focuses the inner control.
2. **Description.** `aria-describedby` is an IDREF and does not resolve into a shadow root — measured, the control's accessible description came back empty while the attribute
   looked correct. `utils/a11y.ts` now assigns `ariaDescribedByElements`, which does cross the boundary.
3. **Name.** The same is true in the other direction, and the dossier never raised it: `for` moves focus but does not *name* a control across the boundary. The field therefore
   also assigns `ariaLabelledByElements`, through a `labelledBy` prop added to the three shadow atoms.

A light-DOM control needs none of this: `ss-field` points the label's `for` at the id it puts on the atom's rendered control, and native labelling applies. The e2e suite asserts
the accessible name and description the browser exposes for the control node itself, because asserting on attributes passes even when the relationship never crosses the boundary.

**Host-level validation is still not re-exposed:** the form sees validity through `ElementInternals`, but `checkValidity()` and `validity` are not available on the host, because
exposing them needs `@Method`, which no component in this library declares.

**Conceptual use with props**

```html
<ss-field label="Email address" helper-text="We'll never share it." error-text="Enter a valid email" required invalid>
  <ss-input type="email" name="email" x-style="outline" full-width></ss-input>
</ss-field>
```

**Conceptual use with slots**

```html
<ss-field required>
  <span slot="label">Email <ss-badge label="new" size="xs"></ss-badge></span>
  <ss-input type="email" name="email" full-width></ss-input>
  <span slot="helper">Use your corporate email</span>
</ss-field>
```

These preserve the dossier's proposed usage; they are not evidence that shadow-boundary association already works.

### 8.2. `ss-radio-group` — P0

Tag: `ss-radio-group`. Path: `src/components/molecules/ss-radio-group/ss-radio-group.tsx`. Mode: `scoped: true`, retaining the existing light-DOM radio grouping model.
Its single responsibility is exposing N `ss-radio` choices as one selected value and one change event, with group semantics.

Evidence: seven `name="rd-state"` radios at `src/index.html:918-928` and five `name="rd-size"` radios at `934-940` are manually coordinated.
There is no group role, accessible group label, group value, required contract or aggregate event. Individual radios retain native input, styles and focus behavior.

```text
ss-radio-group (scoped; container role="radiogroup")
├── ss-typography      optional group label, groupLabelId
├── default slot       N × ss-radio; common name injected
├── ss-typography      helper, color="muted", helperId
└── ss-typography      error, color="error", errorId, role="alert"
```

**Own props**

| Prop           | Type                         | Required | Default      | Description                           |
| -------------- | ---------------------------- | -------- | ------------ | ------------------------------------- |
| `xId`          | `string`                     | No       | `undefined`  | Container id                          |
| `name`         | `string`                     | Yes      | None         | Common native radio name              |
| `value`        | `string`                     | No       | `undefined`  | Selected value; mutable and reflected |
| `label`        | `string`                     | No       | `undefined`  | Group label fallback                  |
| `helperText`   | `string`                     | No       | `undefined`  | Helper fallback                       |
| `errorText`    | `string`                     | No       | `undefined`  | Error fallback while invalid          |
| `required`     | `boolean`                    | No       | `false`      | Required group                        |
| `invalid`      | `boolean`                    | No       | `false`      | Group error state                     |
| `disabled`     | `boolean`                    | No       | `false`      | Disable all radios                    |
| `orientation`  | `'vertical' \| 'horizontal'` | No       | `'vertical'` | Choice layout                         |
| `size`         | `Size`                       | No       | `'md'`       | Common radio size                     |
| `inlineStyles` | `InlineStyles`               | No       | `undefined`  | Container styling                     |

**Forwarded props**

| Molecule prop | Target atom      | Target prop                               | Reason                                               |
| ------------- | ---------------- | ----------------------------------------- | ---------------------------------------------------- |
| `name`        | Every `ss-radio` | `name`                                    | Establish the native group                           |
| `value`       | Every `ss-radio` | Derived `checked = value === radio.value` | One selected value                                   |
| `disabled`    | Every `ss-radio` | `disabled`                                | Disable the entire group                             |
| `size`        | Every `ss-radio` | `size`                                    | Consistent choice sizing                             |
| `required`    | First `ss-radio` | `required`                                | One required radio provides native group requirement |

**Slots**

| Slot        | Expected content      | Constraints                                      |
| ----------- | --------------------- | ------------------------------------------------ |
| `(default)` | N `ss-radio` children | Other element types are ignored for coordination |
| `label`     | Rich group label      | Overrides `label`                                |
| `helper`    | Rich help             | Overrides `helperText`                           |
| `error`     | Rich error            | Overrides `errorText`; only while invalid        |

**Events**

| Event       | Payload                   | When                                                                      | bubbles/composed/cancelable |
| ----------- | ------------------------- | ------------------------------------------------------------------------- | --------------------------- |
| `ssChange`  | `SsRadioGroupChangeEvent` | Selection changes                                                         | true / true / true          |
| `ssInvalid` | `SsRadioGroupChangeEvent` | Native group validity fails; empty-value payload rule remains unspecified | true / true / true          |

Stop child change propagation before group emission. Aggregate invalid events must likewise avoid duplicate ancestor notifications.

**Internal state:** Light-DOM radio list; `groupLabelId`, `helperId`, `errorId` generated with `utils/id`; synchronized on load and update, following `ss-select.syncValue()`.
The public `value` drives derived checked state. No separate public per-child checked collection is proposed.

**Variants:** Vertical/horizontal, shared `Size`, required/disabled/invalid. No own color or style variants.

**Accessibility:** Container `role="radiogroup"`, `aria-labelledby`, composed `aria-describedby`, `aria-required`, and `aria-invalid`.
Native same-name radio navigation supplies arrow handling; do not introduce roving tabindex or a shared keyboard utility.
Keep the proposed scoped topology. The dossier's broader claim that adding a shadow wrapper necessarily moves every slotted radio into a different tree is too categorical;
slot projection alone does not change a child's tree ownership. The practical decision remains to preserve the current light-DOM grouping and test it.

**Conceptual use with props**

```html
<ss-radio-group name="plan" value="pro" label="Choose a plan" helper-text="You can change it later" required>
  <ss-radio value="free">Free</ss-radio>
  <ss-radio value="pro">Pro</ss-radio>
  <ss-radio value="team">Team</ss-radio>
</ss-radio-group>
```

**Conceptual use with slots**

```html
<ss-radio-group name="plan" value="pro" required>
  <span slot="label">Choose a plan</span>
  <ss-radio value="free">Free</ss-radio>
  <ss-radio value="pro">Pro</ss-radio>
  <ss-radio value="team">Team</ss-radio>
  <span slot="helper">You can change it later</span>
</ss-radio-group>
```

### 8.3. `ss-checkbox-group` — P1

Tag: `ss-checkbox-group`. Proposed path, following the stated folder convention: `src/components/molecules/ss-checkbox-group/ss-checkbox-group.tsx`.
Mode: `scoped: true`, parallel to radio group. Its single responsibility is a checkbox set represented by one `string[]` value, with group messages and optional select-all behavior.

**Evidence is medium and weaker than field/radio group.** The demo repeats `name="cb-demo"` on eight checkboxes at `src/index.html:891-899`.
`ss-checkbox.tsx:26,61-66` supplies indeterminate state and dedicated synchronization, but there is no real parent/children checkbox-group consumer.
Indeterminate supports the proposed master checkbox; its existence alone is not proof of product demand for select-all.

```text
ss-checkbox-group (scoped)
├── ss-typography      optional group label
├── ss-checkbox        optional master, enabled by selectAllLabel
├── default slot       N × ss-checkbox
├── ss-typography      helper, color="muted"
└── ss-typography      error, color="error", role="alert"
```

This expands the dossier's explicitly parallel API and dependency graph. Its exact container role, group-required algorithm and master-selection edge cases are not specified.

**Own props**

| Prop             | Type                         | Required | Default            | Description                                                |
| ---------------- | ---------------------------- | -------- | ------------------ | ---------------------------------------------------------- |
| `xId`            | `string`                     | No       | `undefined`        | Container id                                               |
| `name`           | `string`                     | No       | `undefined`        | Optional common name                                       |
| `value`          | `string[]`                   | No       | None — unspecified | Aggregate selected values; assign as a property            |
| `label`          | `string`                     | No       | `undefined`        | Group label fallback                                       |
| `helperText`     | `string`                     | No       | `undefined`        | Helper fallback                                            |
| `errorText`      | `string`                     | No       | `undefined`        | Error fallback while invalid                               |
| `required`       | `boolean`                    | No       | `false`            | Parallel group state; native enforcement is not defined    |
| `invalid`        | `boolean`                    | No       | `false`            | Group error state                                          |
| `disabled`       | `boolean`                    | No       | `false`            | Disable the group                                          |
| `orientation`    | `'vertical' \| 'horizontal'` | No       | `'vertical'`       | Choice layout                                              |
| `size`           | `Size`                       | No       | `'md'`             | Common checkbox size                                       |
| `inlineStyles`   | `InlineStyles`               | No       | `undefined`        | Container styling                                          |
| `selectAllLabel` | `string`                     | No       | `undefined`        | Enables a master checkbox with derived indeterminate state |

Unlike radio's scalar value, the dossier does not specify an array initializer or reflection contract. Do not infer array attribute serialization from the parallel API.

**Forwarded props**

| Molecule prop             | Target atom                    | Target prop       | Reason                                            |
| ------------------------- | ------------------------------ | ----------------- | ------------------------------------------------- |
| `name`                    | Slotted `ss-checkbox` children | `name`            | Optional shared naming                            |
| `value`                   | Slotted `ss-checkbox` children | Derived `checked` | Membership in the aggregate selection             |
| `disabled`                | Checkbox children / master     | `disabled`        | Group disable                                     |
| `size`                    | Checkbox children / master     | `size`            | Common sizing                                     |
| `selectAllLabel`          | Master `ss-checkbox`           | `label`           | Label the optional select-all control             |
| Derived partial selection | Master `ss-checkbox`           | `indeterminate`   | Represent mixed selection using the existing atom |

The dossier's summary says five forwarded props; the derived master state is additional coordination, not an extra public prop.
Do not copy radio's first-child `required` behavior: requiring one checkbox is not the same contract as requiring a radio group selection.

**Slots**

| Slot        | Expected content         | Constraints                                                          |
| ----------- | ------------------------ | -------------------------------------------------------------------- |
| `(default)` | N `ss-checkbox` children | Parallel group composition; other controls are not selection members |
| `label`     | Rich group label         | Overrides `label`                                                    |
| `helper`    | Rich help                | Overrides `helperText`                                               |
| `error`     | Rich error               | Overrides `errorText`; only while invalid                            |

**Events**

| Event       | Payload                      | When                                                                            | bubbles/composed/cancelable |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------- | --------------------------- |
| `ssChange`  | `SsCheckboxGroupChangeEvent` | Aggregate selection changes                                                     | true / true / true          |
| `ssInvalid` | `SsCheckboxGroupChangeEvent` | Parallel API proposes invalid aggregation; trigger semantics remain unspecified | true / true / true          |

**Internal state:** Child references, generated group/message ids and derived master indeterminate, inherited from the parallel group design.
Exact selection handling for disabled children, duplicate/missing values and empty lists: **None** — the dossier gives no algorithm. These are open implementation details, not existing behavior.

**Variants:** The parallel group size, orientation and required/disabled/invalid states; optional master through `selectAllLabel`. No color/style variants.

**Accessibility:** Group label/helper/error association and accessible master label follow the proposed composition. Preserve native checkbox interaction and use the atom's indeterminate support.
Exact group role and native group-required semantics: **None** — not specified; do not assign `radiogroup` to a multi-selection checkbox set by analogy.

**Conceptual use with props**

```html
<ss-checkbox-group name="cb-demo" label="Choices" select-all-label="Select all">
  <ss-checkbox value="a">A</ss-checkbox>
  <ss-checkbox value="b">B</ss-checkbox>
</ss-checkbox-group>
```

```ts
// Conceptual property assignment; an array is not an HTML attribute.
const group = document.querySelector('ss-checkbox-group');
if (group) group.value = ['a'];
```

**Conceptual use with slots**

```html
<ss-checkbox-group name="cb-demo" select-all-label="Select all">
  <span slot="label">Choices</span>
  <ss-checkbox value="a">A</ss-checkbox>
  <ss-checkbox value="b">B</ss-checkbox>
  <span slot="helper">Select the applicable choices</span>
</ss-checkbox-group>
```

### Evaluated and rejected molecules

| Candidate                                                  | Evidence                                                            | Decision and reason                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `ss-tooltip-button`                                        | Eight tooltip/button compositions at `src/index.html:844-879`       | Rejected — tooltip already provides a `trigger` slot; this adds an empty wrapper                           |
| `ss-icon-button`                                           | `src/index.html:295-297`                                            | Rejected — `ss-button iconPosition="only"` plus `icon` slot already covers it                              |
| `ss-badge-with-icon`                                       | `src/index.html:710-718`                                            | Rejected — badge already has an `icon` slot                                                                |
| `ss-button-group` / toolbar                                | Rows demonstrate button variants                                    | Deferred P2 — no real action-toolbar pattern is demonstrated                                               |
| `ss-card`, `ss-modal`, `ss-dropdown`, `ss-toast`, `ss-nav` | Only reserved z-index roles at `docs/pending-token-proposals.md:17` | Rejected for this design — documented intention, no implementation pattern; do not design these components |
| `ss-form`                                                  | None — no repository form orchestration                             | Rejected — native name/required props do not establish a form-level abstraction                            |
| `ss-slider-field`                                          | Slider already has `showValue` / `valueLabel`                       | Rejected — value output is already in the atom; `ss-field` covers remaining message composition            |

## 9. New atom candidates

Both evaluated candidates are **NOT RECOMMENDED**. This is an explicit design outcome: Phase 0 requires no new atom.

### `ss-field-message` — NOT RECOMMENDED

| Aspect            | Evaluation                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Responsibility    | Helper/error text with the appropriate size, color and alert semantics                                            |
| Problem           | Three proposed molecules repeat three or four typography props for messages                                       |
| Encapsulated HTML | `<small class="...">text</small>`                                                                                 |
| Props             | None specified — the dossier evaluates the concept but defines no new public prop contract                        |
| Events            | None — no message action or state event is justified                                                              |
| Slots             | None specified — no new slot API is designed                                                                      |
| Accessibility     | Error text would carry `role="alert"`; the molecule still owns description ids                                    |
| Consumers         | Proposed `ss-field`, `ss-radio-group`, `ss-checkbox-group`                                                        |
| Argument for      | Avoid repeating the same typography configuration                                                                 |
| Argument against  | `docs/atoms.md` explicitly assigns all generic text, including helper and error text, to `ss-typography`          |
| Maintenance cost  | Generated readme, spec, e2e, demo section and inventory entry to save a few attributes; disproportionate to value |
| Verdict           | **NOT RECOMMENDED** — use `ss-typography color="muted"` or `color="error"` within molecules                       |

### `ss-fieldset` / `ss-legend` — NOT RECOMMENDED

| Aspect            | Evaluation                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Responsibility    | Native semantic grouping of controls                                                                                           |
| Problem           | A radio set needs a group label and group semantics                                                                            |
| Encapsulated HTML | `<fieldset><legend>…</legend>…</fieldset>`                                                                                     |
| Props             | None — the dossier defines no candidate API                                                                                    |
| Events            | None — no separate event contract is justified                                                                                 |
| Slots             | None specified — a candidate slot contract was not designed                                                                    |
| Accessibility     | Native fieldset/legend semantics are the argument for it; the proposal instead uses `role="radiogroup"` with `aria-labelledby` |
| Consumers         | Proposed radio group; no existing component consumer                                                                           |
| Argument for      | Canonical native HTML grouping                                                                                                 |
| Argument against  | Adds an atom for a single molecule and fieldset border/padding/margin reset work when the group already owns its semantics     |
| Maintenance cost  | Additional public atom and browser reset burden; no quantitative estimate is supplied                                          |
| Verdict           | **NOT RECOMMENDED** — group semantics remain within the molecule                                                               |

The dossier's rationale does not establish that an ARIA container replaces every behavior of native fieldset/legend. The decision concerns the proposed radio-group responsibility,
not a claim of complete HTML behavior equivalence.

## 10. Shared utility candidates

Use `src/utils/<topic>.ts` and `src/utils/<topic>.spec.ts`, following `style.ts` and its adjacent spec. Do not add `helpers/`, `shared/`, or `internal/` directories.

| Candidate                                          | Status                       | Consumers and rationale                                                                                                  | Spec                                                                       |
| -------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| U1 — `src/utils/id.ts`                             | **Implemented in Phase 0**   | Three molecules need generated ids; combobox and tooltip already duplicate generation with different increment semantics | `src/utils/id.spec.ts`                                                     |
| U2 — `src/utils/a11y.ts`                           | **Implemented in Phase 0**   | Three proposed helper/error compositions require the same ordered description-id joining                                 | `src/utils/a11y.spec.ts`                                                   |
| U3 — `src/utils/style.ts`                          | Existing; reuse              | All 18 atoms already normalize string/object inline styles; all three molecules should do the same                       | Existing `src/utils/style.spec.ts`                                         |
| U4 — `bem()`                                       | Optional P2; not blocking    | Eighteen class maps repeat a form, but mixed and compound modifiers vary                                                 | None proposed yet; any extraction must follow the adjacent-spec convention |
| U5 — Shared keyboard handlers                      | None                         | Only slider's readonly key blocker exists (`ss-slider.tsx:103`); radio-group arrows remain native                        | None — no utility is justified                                             |
| U6 — Value normalization / formatting / validation | None                         | No custom validation or formatting implementation exists to extract                                                      | None — no utility is justified                                             |

### U1 — Ids

```ts
export function nextId(prefix: string): string;
export function resolveId(explicit: string | undefined, prefix: string): string;
```

Use one module-level counter policy. The dossier does not specify the initial number of the proposed shared sequence.
Existing evidence is `ss-combobox.tsx:7,18` (`ss-combobox-list-0` first) and `ss-tooltip.tsx:4,20` (`ss-tooltip-1` first).
Consumers are field and both groups, each requiring related control/group/message ids. Migrating the two existing atoms is optional later work: generated ids can be observed
by downstream DOM tests even though they are not documented public identifiers.

### U2 — Description composition

```ts
export function composeDescribedBy(...ids: (string | undefined | false)[]): string | undefined;
```

Join active nonempty ids with spaces and return `undefined` if none remain, avoiding `aria-describedby=""`. Preserve helper-before-error ordering.
This replaces three future copies of `filter(Boolean).join(' ') || undefined`; it is proposed duplication, not code already present in three molecules.
The small abstraction is justified by avoiding silent accessibility divergence.

### U3 — Existing inline styles

```ts
export type InlineStyles = string | Record<string, string>;
export function parseStyleString(xstyles: string): Record<string, string>;
export function resolveInlineStyles(value?: InlineStyles): Record<string, string>;
```

These signatures already exist. Reuse both the public union and resolver; do not accept only object styles in a molecule.

### U4 — BEM

The dossier proposes the conceptual call `bem(block, mods)` but no TypeScript signature or exact modifier contract.
**Proposed typed signature: None** — inventing modifier semantics would exceed the findings. New molecules keep private inline `getClasses()`.

### U5 / U6 — No candidates

**Signatures: None** — there is no shared keyboard, formatting or validation utility to specify from the evidence.

## 11. Folder structure for molecules

This is a future implementation layout; none of these files is created by this document.

```text
src/components/
  atoms/                              unchanged
  molecules/
    ss-field/
      ss-field.tsx
      ss-field.scss
      readme.md                       generated by docs-readme
      test/
        ss-field.spec.tsx
        ss-field.e2e.ts
    ss-radio-group/
      ss-radio-group.tsx
      ss-radio-group.scss
      readme.md
      test/
        ss-radio-group.spec.tsx
        ss-radio-group.e2e.ts
    ss-checkbox-group/                Phase 2; same file layout
src/utils/
  style.ts
  style.spec.ts
  id.ts
  id.spec.ts
  a11y.ts
  a11y.spec.ts
src/types/
  field-events.d.ts                   only if a payload is shared by >=2 components
```

If each group payload is used by only its own component, export it from that component's `.tsx`, then expose the type through `src/index.ts`.
`field-events.d.ts` is conditional, not a requirement merely because there are two differently named events.

| Area             | Advantage / impact                                                                                      | Disadvantage / limit                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization     | Mirrors the existing atom folder convention and makes level ownership visible                           | Moving an implementation between levels changes internal source paths                                                                              |
| Relative imports | `../../../types/size` remains correct; atoms and molecules are siblings                                 | None — contrary to one sentence in the dossier, paths do not become one level deeper                                                               |
| Exports          | Add payload type exports to type-only `src/index.ts`; component distribution stays with Stencil outputs | Do not introduce component exports into this entry point                                                                                           |
| Consumer imports | Existing loading/registration model remains; custom-element target uses auto-definition                 | No framework wrapper is created by this directory                                                                                                  |
| Build            | Stencil discovers decorators; no `stencil.config.ts` path list needs updating                           | Bundle size grows; slot composition avoids importing caller-owned controls, but directly rendered label/typography/master remain real dependencies |
| Tests            | Existing spec/e2e patterns discover new files                                                           | Add meaningful coverage for coordination, event replacement and accessibility                                                                      |
| Generated docs   | `docs-readme` handles new components                                                                    | Readmes must be generated, not manually authored                                                                                                   |
| Storybook        | None — there is no Storybook                                                                            | Do not claim a story update or integration                                                                                                         |
| Visual harness   | Add sections to `src/index.html`, served by `www`                                                       | This is future implementation work, outside this document-only task                                                                                |

The real harness section pattern is `<section><h2>…</h2><p class="section-desc">…</p><div class="card">…</div></section>` with existing token-set and theme controls.
No claim is made that slotted composition guarantees a particular emitted chunk layout; caller-owned slots avoid source imports, while direct render dependencies remain.

## 12. Matrices and dependency graph

### Atom → molecule matrix

`■` means directly rendered; `□` means caller-owned slot content, with no component import for that relationship. `—` means no proposed use.

| Atom            | `ss-field` | `ss-radio-group` | `ss-checkbox-group`             |
| --------------- | ---------- | ---------------- | ------------------------------- |
| `ss-label`      | ■          | —                | —                               |
| `ss-typography` | ■ ×2       | ■ ×3             | ■ ×3                            |
| `ss-input`      | □          | —                | —                               |
| `ss-textarea`   | □          | —                | —                               |
| `ss-select`     | □          | —                | —                               |
| `ss-combobox`   | □          | —                | —                               |
| `ss-slider`     | □          | —                | —                               |
| `ss-checkbox`   | □          | —                | □; ■ optional select-all master |
| `ss-switch`     | □          | —                | —                               |
| `ss-radio`      | —          | □                | —                               |
| `ss-button`     | —          | —                | —                               |
| `ss-icon`       | —          | —                | —                               |
| `ss-badge`      | —          | —                | —                               |
| `ss-avatar`     | —          | —                | —                               |
| `ss-link`       | —          | —                | —                               |
| `ss-divider`    | —          | —                | —                               |
| `ss-spinner`    | —          | —                | —                               |
| `ss-tooltip`    | —          | —                | —                               |

Eight atoms have no structural dependency in these proposals; they remain independent presentation/action pieces. A caller can still place a badge in rich label content, as the
conceptual field example does. That is caller composition, not a new direct dependency of the field.
The dossier's “only two directly rendered atoms” is true for the base field/radio design; select-all introduces a third atom type, `ss-checkbox`.

### API matrix

| Molecule            | Own props | Forwarded coordination                                                                  | Slots | Own events | Direct atom types          |
| ------------------- | --------- | --------------------------------------------------------------------------------------- | ----- | ---------- | -------------------------- |
| `ss-field`          | 10        | Six categories in the dossier; nine source-to-target rows in §8.1 including derived ids | 4     | 0          | 2                          |
| `ss-radio-group`    | 12        | Five mappings                                                                           | 4     | 2          | 1                          |
| `ss-checkbox-group` | 13        | Five prop mappings plus derived master indeterminate; required mapping unspecified      | 4     | 2 proposed | 2 with master; otherwise 1 |

These counts are not additive: own props can also be forwarded, and one prop may have two targets. Existing checked counts are 22 props for `ss-input`, 20 for `ss-textarea`,
15 for `ss-select`, and 16 for `ss-button`, correcting the dossier's 21/20/17/15 comparison.
Watch for `ss-field` growing beyond approximately 12 own props or acquiring a second own event; either signals likely control responsibility leaking into the wrapper.
Its v1 event count is zero, so even a first event requires demonstrated value.

### Dependency graph and rules

```text
ss-field ──render──> ss-label
         ├─render──> ss-typography
         └─slot────> caller's control

ss-radio-group ──render──> ss-typography
               └─slot────> ss-radio

ss-checkbox-group ──render──> ss-typography
                  ├─render──> ss-checkbox (optional master)
                  └─slot────> ss-checkbox

ss-field ──slot────> ss-radio-group (discouraged in v1)

all three ──utility──> style.ts, proposed id.ts, proposed a11y.ts
```

| Direction                  | Rule                 | Reason                                                                |
| -------------------------- | -------------------- | --------------------------------------------------------------------- |
| molecule → atom            | Allowed              | Normal composition direction                                          |
| atom → molecule            | Prohibited           | Preserve independent atoms; current atoms import no other component   |
| molecule → molecule        | Slot only; no import | Keep ownership with the consumer and avoid cross-import cycles        |
| field wrapping radio group | Discouraged in v1    | Both already own label/help/error; omit duplicate group label if used |

**Import cycles: None** in the proposed graph. Slot relationships do not introduce module import cycles. This does not mean arbitrary consumer DOM nesting is impossible;
“no cycles” here refers to the dependency graph. Direct cross-imports between molecules would violate the rule.

## 13. Reuse & refactoring opportunities

| Finding                                                         | Location                                                                              | Duplication                   | Proposal                                                                  | Type                  | Priority |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------- | --------------------- | -------- |
| Divergent id counters                                           | `ss-combobox.tsx:7,18`; `ss-tooltip.tsx:4,20`                                         | 2                             | `src/utils/id.ts`                                                         | Shared Utility        | P0       |
| Eight description props without demo composition                | Eight control `.tsx` files; no `src/index.html` use; input spec does cover forwarding | 8 declarations                | Wire through `ss-field`                                                   | New Molecule          | P0       |
| Invalid state without composed error message                    | Eight controls                                                                        | None — no message composer    | Field error content and description wiring                                | New Molecule          | P0       |
| Required state duplicated on label/control                      | `src/index.html:542-543`                                                              | 2 assignments                 | One `ss-field.required` source                                            | New Molecule          | P0       |
| Helper/error description joining                                | Proposed molecules, not existing code                                                 | 3 future consumers            | `src/utils/a11y.ts` / `composeDescribedBy`                                | Shared Utility        | P0       |
| Radios coordinated by repeated name                             | `src/index.html:918-928`, `934-940`                                                   | 12 elements                   | `ss-radio-group`                                                          | New Molecule          | P0       |
| Shared checkbox name; no parent/children indeterminate consumer | `src/index.html:891-899`; `ss-checkbox.tsx:26,61-66`                                  | 8 elements                    | `ss-checkbox-group`                                                       | New Molecule          | P1       |
| Checkbox/radio SCSS similarity                                  | Both component SCSS files                                                             | Approximately 85% per dossier | Optional `choice-control($block)` in `_mixins.scss`                       | Refactor              | P2       |
| Repeated BEM class-map form                                     | 18 atom `.tsx` files                                                                  | 18                            | Optional `bem()` or keep inline                                           | Refactor              | P2       |
| Button scalar click detail                                      | `ss-button.tsx:63,118`                                                                | 1 inconsistency               | Align to `{ xId }` only in a breaking release                             | Refactor              | P2       |
| `variant` / `color` naming                                      | Three versus eight atoms                                                              | 11 related APIs               | Unify only with breaking-change planning                                  | Refactor              | P2       |
| Tooltip lacks Escape/focus handling                             | `ss-tooltip.tsx`                                                                      | None — missing behavior       | Dossier proposes `@Listen('keydown')` plus focus work; separate atom task | Refactor (a11y)       | P1       |
| Missing prop/event JSDoc                                        | `ss-radio.tsx:17-33`; `ss-badge.tsx:21-32`                                            | 2 components                  | Complete JSDoc                                                            | Refactor (docs)       | P2       |
| `emitValue()`                                                   | Eight control atoms                                                                   | 8                             | None — different payload semantics                                        | No Abstraction Needed | —        |
| Readonly guards                                                 | Four atoms                                                                            | 6                             | None — different restoration behavior                                     | No Abstraction Needed | —        |
| Inline style resolution                                         | 18 atoms                                                                              | 18 call sites                 | Already resolved; reuse `resolveInlineStyles`                             | Existing Atom/Utility | —        |
| Helper/error text                                               | Proposed message rendering                                                            | None in existing molecules    | `ss-typography color="muted"/"error"`                                     | Existing Atom         | —        |

### Accessibility wiring is the missing composition consumer

**Context:** Eight atoms expose `describedBy`; the demo has no consumer of it. The input spec proves attribute forwarding, not a complete label/help/error relationship.
**Problem:** Consumers repeat required state and receive invalid styling without a corresponding field error message.
**Solution:** `ss-field` composes the existing label, typography and caller control.
**Consumers:** Product form fields; no product-specific form is inferred from the demo.
**Benefits:** Activates an existing public API and removes repeated association work without re-exposing input values or constraints.
**Trade-offs:** Child DOM coordination, update synchronization and shadow-boundary limitations. SSR/hydration and dynamic replacement cannot be assumed to work from the design alone.

### Radio group is missing as a public concept

**Context:** Twelve demo radios repeat names at `src/index.html:918-928` and `934-940`.
**Problem:** A consumer reconstructs group state from child events and supplies group labeling independently.
**Solution:** `ss-radio-group` owns one value, accessible group role/label and aggregate events while native radios keep interaction.
**Consumers:** Single-choice form controls.
**Benefits:** One name source, one selection value, one group change notification and required-group semantics.
**Trade-offs:** Replacement events require stopping child propagation at the group boundary. Ancestor listeners observe the group payload; direct child listeners still see the child event.
The proposed invalid payload must account for the no-selection case before implementation.

### Id generation is duplicated with different sequences

**Context:** Combobox generates a zero-based fallback; tooltip generates a one-based content id.
**Problem:** Each new molecule would add another independent generator without a common policy.
**Solution:** `src/utils/id.ts` and an adjacent spec.
**Consumers:** Three proposed molecules first; the two existing atoms can migrate separately.
**Benefits:** One isolated, testable generation policy and explicit-id resolution.
**Trade-offs:** Existing generated DOM ids can appear in downstream tests. Defer atom migration rather than making it a molecule prerequisite; the dossier does not establish SSR-stable generation.

## 14. Multi-framework compatibility

The dossier's integration assessment is based on `docs/distribution.md` and the disabled wrapper configuration in `stencil.config.ts`.
There are no published React/Angular/Vue wrappers in this repository's documented architecture. This is direct custom-element consumption, not a claim of tested support for every
current framework version. In particular, the dossier's React event limitation is explicitly scoped to **React <19**; it must not be generalized to all React versions.

| Environment                    | Scalar props                                | Object/array props                                                                                   | Booleans                                                    | `ss*` events                                                                       | Slots                                                                    |
| ------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Plain HTML / Astro markup      | Kebab-case attributes such as `helper-text` | JavaScript property assignment required for arrays/objects; CSS strings work through `inline-styles` | Presence or Stencil-parsed `true`/`false` attribute strings | `addEventListener('ssChange')`, preserving case                                    | Native slot content                                                      |
| React <19, no wrapper          | Scalar attributes                           | Use ref/property assignment; avoid object-to-attribute serialization                                 | Stencil interprets the string `false`                       | Ref plus `addEventListener`; do not rely on `onSsChange`                           | Supported composition pattern                                            |
| React 19+                      | None assessed separately                    | None assessed separately                                                                             | None assessed separately                                    | None assessed separately                                                           | None assessed separately; dossier gives no version-specific verification |
| Angular                        | Property binding such as `[value]`          | Property binding                                                                                     | Property binding                                            | `(ssChange)`                                                                       | Requires `CUSTOM_ELEMENTS_SCHEMA` for custom elements                    |
| Vue 3                          | `:prop` bindings                            | Property binding as described in distribution docs                                                   | Supported binding                                           | SFC event casing works; in-DOM templates lowercase names and can break `@ssChange` | Configure `isCustomElement: tag => tag.startsWith('ss-')`                |
| Other custom-element consumers | Attributes or properties                    | Properties                                                                                           | Native/custom-element binding contract                      | DOM event listeners                                                                | Native slot content                                                      |

### Concrete APIs that need integration care

1. `ss-select.value: string | string[]` already establishes property-only arrays. `ss-checkbox-group.value: string[]` must follow it; no CSV syntax is proposed.
2. `inlineStyles: string | Record<string, string>` must keep both representations through `resolveInlineStyles`; object-only molecule APIs would lose plain HTML configuration.
3. CamelCase `ssChange` and `ssOpenChange` are published conventions. Preserve case in listeners; document React <19 without wrappers and Vue in-DOM templates separately.
4. `x-id` and `x-style` avoid global attribute collisions. Molecules retain `xId` but introduce no `xStyle`; host `id` and atom `xId` are not interchangeable.
5. All three proposed molecules use scoped styles, so consumer global CSS can affect their internals. This repeats the existing light-DOM trade-off, not shadow encapsulation.
6. No current component exposes `::part` or `exportparts`. Do not promise consumer styling of shadow internals through molecule forwarding.
7. Field wiring mutates a slotted element. Re-run synchronization after updates; the dossier identifies SSR/hydration and child replacement as limits, and supplies no proof that lifecycle
   callbacks alone detect every external child replacement. Treat those integration cases as implementation checks, not established compatibility.

## 15. Anti-patterns and risks

### Already present in the code

| Finding                                                                 | Concrete risk                                                                               | Mitigation within this architecture                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Button `oneClick=true` / `disableDuration=1000`                         | An atom applies a product-like interaction throttle and can discard legitimate rapid clicks | Document the existing behavior; do not copy it into molecules                                         |
| Button overlapping disabled/loading/status/temporary state              | Multiple ways to request one effective state complicate reasoning                           | Keep existing getters as the authority; do not re-expose these paths through field/group APIs         |
| Slider output and badge dismiss button                                  | Atoms already contain some composition; badge includes literal `x`                          | Reuse their existing APIs; reject duplicate slider-field and badge wrappers                           |
| `variant`/`color`, scalar button click, divergent size unions           | Inconsistent public APIs surprise consumers                                                 | Record debt; reserve normalization for a breaking release                                             |
| Label/control required duplication and invalid styling without messages | State is easy to configure inconsistently                                                   | Proposed field coordinates supported state and message association; verify shadow controls separately |
| Tooltip lacks Escape, focus and collision handling                      | Incomplete tooltip interaction/accessibility                                                | Separate P1 atom accessibility work; do not claim the molecule layer fixes it                         |
| Choice atoms accept more size distinctions than SCSS renders            | `xl`, `2xl`, `3xl` suggest distinctions that collapse                                       | Document actual limits; do not invent another molecule size scale                                     |

### Risks the proposals could introduce

| Risk                                                         | Mitigation                                                                                                                                      |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Field becomes a god component                                | Keep control value/type/placeholder/appearance on the slot child; review growth past approximately 12 own props                                 |
| Indiscriminate forwarding                                    | Forward only coordination between children, not the union of all atom APIs                                                                      |
| Duplicate child/group events                                 | Stop replaced child events at the boundary and emit one group payload; retain original propagation where there is no replacement                |
| Field wrapping an already labeled group                      | Discourage in v1; prefer standalone group label/helper/error support                                                                            |
| Strong coupling to child DOM                                 | Use documented child props and native state attributes only; do not mutate child values/styles; synchronize and document first-control behavior |
| Empty wrappers                                               | Keep tooltip-button, icon-button, badge-with-icon and field-message rejected                                                                    |
| Premature card/toolbar/overlay abstractions                  | Wait for actual consumer patterns; reserved tokens alone do not justify a component                                                             |
| Too many visual variants                                     | No `variant` or `xStyle` in these molecule APIs                                                                                                 |
| Unsupported accessibility promises                           | Scoped parent does not remove a shadow child's boundary; resolve association limits before claiming field compatibility                         |
| Incomplete group contracts presented as implemented behavior | Keep no-selection invalid payload and checkbox required/master edge cases explicitly open until implementation design resolves them             |

The last two rows make the dossier's existing design limits explicit; they do not authorize atom changes in this task.

## 16. Architectural decisions

### AD-1 — Slot composition

**Context:** A molecule needs to host a control without absorbing the control's public API.

**Decision:** Accept the control through the default slot.

**Rationale:** Select already slots options and tooltip already slots its trigger. Caller ownership preserves direct access to the control API and avoids importing that control
into the molecule implementation.

**Alternatives:** A `control="input"` selector would require re-exposing 22 current input props; framework render-prop conventions are not the repository's custom-element contract.

**Trade-offs:** Light-DOM inspection and coordination; no compile-time guarantee of slotted child type. Directly rendered label/typography remain dependencies.

### AD-2 — Scoped molecules

**Context:** Field labels and choice grouping rely on native cross-element relationships; the atom layer already distinguishes scoped from shadow rendering.

**Decision:** Use `scoped: true` for all three proposals.

**Rationale:** Preserve light-DOM label and radio relationships rather than introducing a new boundary into the molecule's own rendered structure.

**Alternatives:** A shadow wrapper with an explicitly designed accessible-name strategy, or manual radio keyboard management, would require work not established by this repository.

**Trade-offs:** Global CSS can affect internals. A scoped field does not solve association into an existing shadow control; a shadow wrapper also does not automatically relocate
slotted light-DOM radios. These qualifications correct the dossier's unconditional statements without changing its chosen mode.

### AD-3 — Field accessibility coordination

**Context:** Label, native control and message ids must agree without manual repetition in every consumer.

**Decision:** Resolve the first slotted control and synchronize supported association/state on load and update. Use custom-element `xId`/`describedBy` props or native
`id`/`aria-describedby` attributes as appropriate; coordinate `required`, `disabled`, and `invalid` where supported.

**Rationale:** This is the proposed field's value. Existing precedents are `ss-select.syncValue()` and `ss-checkbox.syncIndeterminate()`.

**Alternatives:** Require callers to wire ids themselves, or expose generated ids for callers to bind. Both retain much of the manual composition burden.

**Trade-offs:** DOM coupling and update synchronization; only the first control is coordinated. Shadow association and external child replacement need explicit validation.
The dossier's raw-host-attribute shorthand is insufficient for current atom props.

### AD-4 — No new atoms

**Context:** Message presentation and group semantics suggested field-message and fieldset candidates.

**Decision:** Create neither candidate.

**Rationale:** `docs/atoms.md` already assigns helper/error text to typography; radio group owns the proposed ARIA grouping semantics.

**Alternatives:** `ss-field-message`, `ss-fieldset` / `ss-legend`.

**Trade-offs:** Repeat a small number of typography props instead of maintaining additional public atoms and native fieldset reset styling. Phase 0 needs no new atom.

### AD-5 — Aggregate only meaningful child events

**Context:** Atom custom events already bubble and are composed; naive re-emission produces duplicates.

**Decision:** Field has no own events. Groups emit aggregate events and stop corresponding child propagation.

**Rationale:** Aggregation changes the concept from an individual checked transition to a group value; unchanged control events add no molecule-level information.

**Alternatives:** Re-emit every event with a prefix, or leave consumers to reconstruct selection from children.

**Trade-offs:** Ancestor listeners see a group payload instead of the stopped child payload. Direct child listeners are unaffected by that ancestor-boundary decision.
Invalid aggregation must resolve missing-selection semantics before implementation.

### AD-6 — Preserve existing atom APIs

**Context:** Color naming, click detail shape and size scales are inconsistent in published version `0.2.2`.

**Decision:** Record the inconsistencies; do not change atoms in this document-only phase.

**Rationale:** Normalization would be breaking and is not necessary to describe the proposed layer.

**Alternatives:** Unify now and publish a major release.

**Trade-offs:** Molecules compose inconsistent existing APIs. The naming rule is `variant` for own chromatic intent and `color` only for like-named forwarding; these proposals
need no own color/style variants.

### AD-7 — Document location

**Context:** Architectural documents normally live in lowercase `docs/*.md`.

**Decision:** Write `MOLECULES_ARCHITECTURE.md` at the repository root.

**Rationale:** Explicit user instruction.

**Alternatives:** `docs/molecules.md` would match `docs/atoms.md` exactly, but is not the requested output.

**Trade-offs:** This file intentionally diverges from the documentation naming/location convention.

## 17. Prioritization and roadmap

| Priority | Criterion                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Addresses a current missing composition/API consumer or manually repeated demo pattern and establishes a prerequisite for subsequent pieces |
| P1       | A real but weaker pattern, or work depending on the P0 foundation                                                                           |
| P2       | Consistency debt or abstraction without current demand; can wait without blocking core composition                                          |

| #   | Piece                                              | Priority          | Supporting evidence                                                                                                                     |
| --- | -------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/utils/id.ts`                                  | P0                | Two divergent atom counters and three proposed molecule consumers                                                                       |
| 2   | `src/utils/a11y.ts`                                | P0                | Identical helper/error id composition required by all three proposed molecules                                                          |
| 3   | `ss-field`                                         | P0                | Eight description APIs without a demo composition consumer; repeated label/control and required state; invalid without composed message |
| 4   | `ss-radio-group`                                   | P0                | Twelve radios share manually repeated names without a group role/value/event                                                            |
| 5   | `ss-checkbox-group`                                | P1                | Shared demo names and existing indeterminate support; medium evidence, no actual parent/children consumer                               |
| 6   | Tooltip Escape/focus work                          | P1                | Existing interaction/accessibility gap; separate from molecule implementation                                                           |
| 7   | `choice-control($block)` mixin                     | P2                | Checkbox/radio SCSS similarity; not required by a molecule                                                                              |
| 8   | Optional `bem()`                                   | P2                | Eighteen similar class maps; may remain inline                                                                                          |
| 9   | Color naming and button click detail normalization | P2                | Breaking published API consistency changes                                                                                              |
| 10  | Radio/badge JSDoc                                  | P2                | Missing prop/event documentation after `41e0eff`                                                                                        |
| 11  | Button group and card/modal/dropdown/toast layer   | P2, evaluate only | No real product pattern; only token reservations for the future overlay layer                                                           |

### Phase 0 — Prerequisites

**Done.** `src/utils/id.ts` (`nextId`, `resolveId`) and `src/utils/a11y.ts` (`composeDescribedBy`) exist with adjacent specs. `ss-input`, `ss-textarea` and `ss-slider` are
`formAssociated` with `delegatesFocus`, so a host-targeted `<label for>` focuses them and a surrounding form submits and validates them; each has e2e coverage for submission,
typed value, label focus, reset, form validity and ancestor-fieldset disabling. The two dev token sets now define every `--ss-*` variable the atoms reference, including the full
`--ss-z-index-*` layering scale that the overlay layer will need.

**Still open before Phase 1.** Establish `src/components/molecules/`, and expose new payload types through the existing type-only entry point when their defining modules exist —
no component exports belong in `src/index.ts`. **No new atoms are required.** Migrating combobox/tooltip counters to `utils/id.ts` remains optional, non-blocking work. Three design
gaps stay unresolved and must be settled as part of the field/group design rather than during implementation: cross-root `aria-describedby` association into a shadow control, the
radio-group invalid payload when nothing is selected, and the slot-only error condition behind `showError`.

### Phase 1 — Core molecules

Implement field first to establish association conventions, then radio group. Each needs the same-name TSX/SCSS, component spec, e2e coverage and a visual section in
`src/index.html`. Verify real native association and exactly one aggregate event at an ancestor; do not merely test a mirrored implementation detail.
The ordering shares a coordination design, not a `ss-radio-group` import of `ss-field`.

### Phase 2 — Secondary molecules

Implement checkbox group after radio-group coordination is established and its open array/required/master rules are resolved. Reuse the same utilities and typography.
Tooltip accessibility work can proceed independently as a separate atom change.

### Phase 3 — Specialized work and debt

Evaluate choice-control/BEM refactors and complete JSDoc. Normalize breaking APIs only with appropriate release planning.
Evaluate button-group or reserved overlay roles only if a real product pattern appears; do not turn reserved tokens into speculative components.

**Dossier dependency order:** `1, 2 → 3 → 4 → 5` (utilities → field → radio group → checkbox group). These are implementation/design prerequisites, not molecule-to-molecule import edges.
No other listed item blocks this chain. Optional refactors and existing counter migration remain independent.

## 18. Honesty notes

The following preserves the dossier's final notes in English. Corrections to its verifiable figures and overstatements are recorded immediately afterward.

- **There is no Storybook** in this repository. Any claim about its impact would be invented. The visual harness is `src/index.html` plus the `www` output target.
- **There are no published framework wrappers.** All multi-framework analysis applies to direct custom-element consumption (source: `docs/distribution.md` and the commented
  `reactOutputTarget` in `stencil.config.ts`).
- **Zero `@Method`, zero `<Host>`, zero `@Listen`** in the current code. If a molecule needed one, it would be the first in the repository; do not present it as following an existing convention.
- **No component exposes `::part` / `exportparts`.**
- The evidence for `ss-checkbox-group` is **weaker** than for `ss-field` and `ss-radio-group`. State this rather than equating the three.
- `ss-card`, `ss-modal`, `ss-dropdown`, `ss-toast`, `ss-nav`: the **only** traceability is the `--ss-z-index-*` token reservation in
  `docs/pending-token-proposals.md:17`. It is a documented intention, not a code pattern. Do not design them.
- All dossier figures (18 atoms, eight with `describedBy`, 11 shadow / seven scoped, six readonly guards, etc.) are checkable against `main @ 41e0eff`.

### Verification corrections and limits

| Dossier statement                                                 | Checked result / documentary correction                                                                                                            |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18 atoms and no `molecules/`                                      | Confirmed                                                                                                                                          |
| Eight `describedBy` declarations; no demo usage                   | Confirmed                                                                                                                                          |
| `style.ts` is the only utility with adjacent spec                 | Confirmed; `src/test/utils.ts` is the separate test-helper file, not another production utility                                                    |
| Two counters at the cited lines                                   | Confirmed: combobox post-increment starts at 0, tooltip pre-increment starts at 1                                                                  |
| `src/index.ts` exports only types                                 | Confirmed, including its explicit prohibition on component exports                                                                                 |
| Seven e2e files                                                   | Corrected to nine                                                                                                                                  |
| No description-prop usage in specs                                | Corrected: `ss-input.spec.tsx:89-98` sets `described-by` and asserts the resulting attribute                                                       |
| Radio is the only atom without prop/event JSDoc                   | Corrected: badge also lacks it, as later dossier sections themselves acknowledge                                                                   |
| Seven atoms emit focus/blur                                       | Corrected to eight: checkbox, combobox, input, radio, select, slider, switch, textarea                                                             |
| Four typography effective getters                                 | Corrected to five; the dossier itself lists all five names                                                                                         |
| Input/button/select prop comparisons of 21/15/17                  | Corrected to 22/16/15; textarea remains 20                                                                                                         |
| Fifteen atoms use `Size`                                          | Eleven declare `size: Size` directly; avatar/link/icon use their local size types, typography uses `TypographySize`; three atoms have no size prop |
| Every non-button event uses `{ xId, ... }`                        | Raw `FocusEvent` details are additional exceptions to the normalized-object convention                                                             |
| Scoped field guarantees label click focus for all listed controls | Was not supported, and the gap was wider than stated: `for` crosses no shadow boundary for focus, name or description. Resolved by form association plus ARIA element reflection; see §8.1 |
| Write host `id` and `aria-describedby` to wire every atom         | Use atom `xId` and `describedBy` props to reach their rendered controls; native elements use native attributes                                     |
| Field size coordinates control size                               | Its actual proposed mapping forwards size to label, not to the slotted control; auxiliary typography mapping is unspecified                        |
| Only two direct atom dependencies                                 | Optional checkbox master adds a third distinct directly rendered atom type                                                                         |
| Relative imports become deeper                                    | Atoms and molecules are siblings; relative depth is unchanged                                                                                      |
| Hide focus events / child listener no longer sees change          | No re-emission does not stop bubbling; group `stopPropagation` changes ancestor observation, not direct child event delivery                       |

The dossier does not establish current framework-version behavior beyond its stated integration assumptions, SSR/hydration guarantees, exact checkbox group validity or select-all
edge cases, a radio invalid payload for no selection, a typed `bem()` contract, or a full fix for shadow-control association. Those are not filled with invented APIs.
Its approximate SCSS similarity is retained as a dossier estimate, not represented as a newly measured percentage. No repository implementation, configuration, branch or commit
is changed by this document.
