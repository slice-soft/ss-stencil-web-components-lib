# New components (phase 3) — design

## Intent

Phase 3 of "improve the components" (phase 1 was motion, phase 2 capacity:
ss-design-system 2.14.0–2.16.0, lib 0.7.2–0.7.4). Four components the library
does not have:

1. `ss-progress` — how far along something is.
2. `ss-drawer` — a panel that enters from an edge of the viewport.
3. `ss-stepper` + `ss-step` — where the person is in a sequence of steps.
4. `ss-bento` + `ss-bento-item` — a grid of tiles of different sizes.

The user's goal for the library, in their words: **as versatile as possible**,
each component serving its purpose in every situation it applies to — one or
many — rather than one screen. A bento must work for a landing page and for a
dashboard; a stepper for a read-only indicator and for a navigable wizard with
errors.

The user's rules, carried over from phase 2:

- **The component only shows** (single responsibility). It displays what it is
  given and reports what the person did. Data, validation, whether a step may
  be entered, servers and errors belong to the shell that hosts it.
- **No prop depends on `data-style`.** Every look comes from component tokens
  mapped to system roles, so the five styles and both themes apply unchanged.

## Goals

- The four components, accessible (WAI-ARIA patterns, keyboard, screen
  readers), themed by component tokens (`--ss-<component>-*`, read only by that
  component, enforced by `lint:tokens`), correct under every `data-style` and
  both themes, motion through `motion.*` with reduced motion respected.
- Nothing that exists changes: the existing computed-style snapshots stay as
  they are.

## Non-goals

- Gestures: swipe to close a drawer, drag to reorder bento tiles, drag to
  resize. Possible later.
- A drawer that pushes or reflows the page (a persistent sidebar layout). The
  drawer overlays; laying the page out around a panel is the shell's.
- Deciding whether a step can be entered, validating a step, storing wizard
  data. The stepper reports the request; the shell answers it.
- Surface styling on bento tiles. A tile is a cell; what is in it (an
  `ss-card`, a chart, an image) draws itself.
- Further components (empty state, stat, timeline, file upload, date picker…):
  a list of gaps is handed to the user at the end of the phase to choose
  phase 4.

## Anti-goals

- A stepper built as a tab list. Steps are an ordered list; the current one is
  `aria-current="step"`.
- A drawer that is a second implementation of focus trapping or dismissal. It
  uses `utils/focus` (`trapFocus`) and `utils/dismiss` (`onDismiss`) exactly as
  `ss-modal` does.
- A bento whose tiles overflow its width when fewer columns fit than a tile
  spans.
- Any prop whose meaning depends on the visual style.

## Approaches considered (chosen by the user: A, A, A)

**Drawer.** (A) a separate `ss-drawer` reusing the overlay utilities —
chosen: the modal is ~185 lines, and keeping the non-modal mode out of it
keeps `ss-modal` one behaviour. (B) a `placement` on `ss-modal` — rejected: one
component that traps focus or does not, against single responsibility.

**Bento.** (A) `ss-bento` + `ss-bento-item` components on CSS grid, spacing
from `bento.*` tokens — chosen: in the token contract and the lint, typed, the
same in every framework. (B) utility classes in the design system — rejected:
outside the per-component token contract, untyped, a pattern the library does
not use.

**Stepper.** (A) steps as `ss-step` children, like tabs and breadcrumb —
chosen: each step can carry rich content and its own status, and a data-driven
shell maps its array to children. (B) a `steps` array prop — rejected: steps
become plain text. (C) both — rejected: two paths to test for what A already
covers.

## Delivery

Two waves, each released DS first, then the lib (release-please, as in phase
2): **wave 1** `ss-progress` + `ss-drawer`; **wave 2** `ss-stepper`/`ss-step`
+ `ss-bento`/`ss-bento-item`. Each wave: DS PR → DS release → `tokens:sync` in
the lib → lib PR → lib release.

## Encapsulation (builder's reference)

- `ss-progress`, `ss-stepper`, `ss-step`, `ss-bento`, `ss-bento-item`:
  **shadow**. The parents read their children through `slotchange`, so
  children a framework adds after mount are picked up — the known gap of
  scoped components that slot content (`docs/status.md`) does not apply.
- `ss-drawer`: **scoped**, for the reason `ss-modal` is: `trapFocus` must see
  the caller's controls in the light DOM.

## 1. `ss-progress` (atom)

Props:

- `value?: number` — absent (or not a finite number) means **indeterminate**.
  Clamped to `[0, max]`.
- `max: number = 100` — a non-positive or non-finite `max` is treated as 100.
- `shape: 'bar' | 'circle' = 'bar'`.
- `size: Size = 'md'` — bar thickness / circle diameter, from tokens per size.
- `color` — same set as `ss-spinner` (`Variant | 'foreground' | 'muted'`),
  default `'primary'`.
- `label: string = 'Progress'` — accessible name (translate it). Overridden by
  `labelled-by` (id reference, through `utils/a11y` `applyLabelledBy`, as
  `ss-search-select` does).
- `value-text?: string` — `aria-valuetext` when a percentage is not the right
  reading ("3 of 10 files").
- `show-value: boolean = false` — draws the rounded percentage (or
  `value-text` when given): after the bar, centred in the circle. Never shown
  when indeterminate.
- `xId`, `inlineStyles`, as every component.

Behaviour:

- `role="progressbar"` with `aria-valuemin="0"`, `aria-valuemax`,
  `aria-valuenow` (only when determinate), `aria-valuetext` when given.
- A value change animates the fill (`progress.fill-duration` →
  `motion.duration.*`, `fill-easing` → `motion.easing.move`).
- Indeterminate: the bar's fill travels across the track; the circle's arc
  rotates. Reduced motion: no travel or rotation — a still partial fill
  (bar) / arc (circle) that pulses with `motion.*.pulse` like `ss-skeleton`,
  or holds still if `ss-skeleton` holds still (follow `ss-skeleton`).
- No events. Not form-associated. Not one of `ss-field`'s controls (a progress
  is not answered).

Tokens (`progress.json`): track background, fill color per color, bar
thickness per size, circle diameter and stroke width per size, radius, value
font size and color, gap between bar and value, fill and indeterminate
durations/easings.

## 2. `ss-drawer` (organism)

Props:

- `open` (mutable, reflected), `heading`, `accessibility-label`, `dismissible
  = true`, `dismiss-label = 'Close'`, `close-on-escape = true`,
  `close-on-backdrop = true`, `xId`, `inlineStyles` — same meaning as
  `ss-modal`.
- `placement: 'start' | 'end' | 'top' | 'bottom' = 'end'`. `start`/`end` are
  logical: they follow the writing direction (RTL puts `start` on the right).
- `size: Size = 'md'` — width for `start`/`end`, height for `top`/`bottom`,
  from tokens per size; never wider/taller than the viewport minus an offset
  token, so it does not cover the whole screen on a phone except where the
  token says so.
- `modal: boolean = true`.

Event: `ssOpenChange: { xId?: string; open: boolean }`, emitted only when an
interaction closes it (as `ss-modal`).

Slots: default (body), `header` (overrides `heading`), `footer` — same as
`ss-modal`.

Behaviour:

- **Modal (default):** a backdrop; `role="dialog"`, `aria-modal="true"`;
  `trapFocus` on open, focus returned on close; `onDismiss` with Escape and
  outside press per the two props; page scroll locked — all as `ss-modal`
  (activate after the render that shows it, deactivate on close and on
  disconnect).
- **Non-modal (`modal="false"`):** no backdrop, no trap, no scroll lock, the
  page stays usable. `role="dialog"` without `aria-modal`. On open, focus
  moves into the panel; on close, it goes back to where it was **only if it
  was inside the panel** (closing from elsewhere must not steal focus). It
  joins the `onDismiss` stack with `outside: 'ignore'`, so a press on the page
  neither closes it nor is swallowed by it. **Escape closes it only while focus
  is inside the panel** (the WAI-ARIA non-modal dialog norm): an Escape typed in
  the page, or meant for a popover opened from the page, must not close it.
  That needs a focus-scoped Escape in `utils/dismiss` (a new option, default
  off, so every existing overlay keeps its behaviour), with its own spec tests.
  *Call made by the designer, not the user.*
- Position: fixed to its edge, full length of that edge. The corners that face
  the page take the surface radius; the corners on the viewport edge are
  square (a bottom sheet has rounded top corners only).
- Motion: slides in from its edge and fades the backdrop
  (`drawer.enter-duration` → `motion.duration.dialog`, `enter-easing` →
  `motion.easing.enter`), leaves the same way, using `@starting-style` +
  `allow-discrete` as `ss-modal` does — including the duplicated-class rule
  for `@starting-style`, which Stencil does not scope. Reduced motion: fade
  only, no slide. No transform may remain on the panel once it is open
  (a transform makes it the containing block of fixed dropdowns inside it —
  see the comment in `ss-modal.scss`).
- Layers: the modal drawer uses the modal layers (`layout.layer.overlay` for
  the backdrop, `layout.layer.modal` for the panel); the non-modal one sits on
  `layout.layer.overlay`.

Tokens (`drawer.json`): mirror `modal.json` where they mean the same (surface,
foreground, shadow, padding, gaps, radius, backdrop, layers, enter-*, dismiss
size), plus size per size for each axis and the viewport offset.

## 3. `ss-stepper` + `ss-step` (molecule)

`ss-step` props:

- `value?: string` — identifies the step; defaults to its index as a string.
- `label?: string`, slot `description` (secondary text), slot `icon`
  (replaces the step number in the marker).
- `status?: 'complete' | 'error'` — set by the shell. When absent, the stepper
  derives it from position: before the current step **complete**, the current
  one **current**, after it **upcoming**. An explicit `status` wins over the
  derived one, so a non-linear flow can show any step complete and any step in
  error. The current step stays current even with `status="error"` (shown as
  current with an error).
- `disabled: boolean = false`.
- **No step body** (the user's choice): a step has no slot for its panel. The
  stepper only indicates; the shell draws the current step's content beside
  or below it. This keeps it out of the tabs pattern.

`ss-stepper` props:

- `value?: string` (mutable, reflected) — the current step. Absent: the first
  step.
- `orientation: 'horizontal' | 'vertical' = 'horizontal'`.
- `interactive: boolean = false` — read-only by default (an indicator).
  Interactive: each step that is not disabled and not current is a real
  `<button>` in the tab order.
- `accessibility-label: string = 'Steps'`.
- `complete-label = 'Completed'`, `error-label = 'Error'` — visually hidden
  status text read after each step's label (translate them).
- `summary-label = 'Step {current} of {total}'` — the compact form's text.
- `xId`, `inlineStyles`.

Event (interactive only): `ssStepChange: { xId?: string; value: string;
previous?: string }`, **cancelable**. Pressing a step emits it; if not
prevented, `value` becomes that step. The shell that must validate first
prevents it and sets `value` itself when ready — as `ss-nav`'s `ssChange` and
`ss-card`'s `ssNavigate` do.

Behaviour:

- Markup: an ordered list (`<ol>`) named by `accessibility-label`; the current
  step has `aria-current="step"`; status is in the hidden text, never color
  alone (marker: number or icon; check for complete, mark for error).
- Each step draws its marker, label, description and the connector to the next
  step (none after the last). The connector after a step is drawn **complete
  when that step is complete** (derived or explicit), otherwise upcoming — two
  connector states; an error colors the marker, not the connector. Each step
  needs only its own status for this. *Call made by the designer.*
- **Compact form:** horizontal steppers whose container is narrower than a
  token (`stepper.compact-max-width`, container query, not viewport) show only
  the current step and `summary-label` ("Step 2 of 5"). Vertical steppers do
  not compact. An interactive stepper compacts too and loses direct jumps
  there (the user's choice): the shell's own previous/next controls move
  between steps, as in any mobile wizard. Hidden steps leave the
  accessibility tree too; assistive technology reads the summary and the
  current step.
- The stepper tells each step its position, derived status, orientation and
  whether it is interactive; how (properties set by the parent on
  `slotchange` and on `value` change) is the builder's.

Tokens (`stepper.json`, `step.json`): marker size, colors per state (upcoming,
current, complete, error, disabled), connector thickness and colors, label and
description typography, gaps, focus ring, compact threshold.

## 4. `ss-bento` + `ss-bento-item` (molecule)

`ss-bento` props:

- `columns: number = 4` — the most columns it will use.
- `min-item-width?: string` — the narrowest a one-column tile may be (CSS
  length); default from a token. Fewer columns are used when the container
  cannot fit `columns` of this width; at its narrowest the bento is one column.
- `dense: boolean = false` — `grid-auto-flow: row dense`: later small tiles
  fill gaps left by large ones. Off by default because it makes visual order
  differ from reading order; documented as such.
- `xId`, `inlineStyles`.

`ss-bento-item` props: `col-span: number = 1`, `row-span: number = 1`.

Behaviour:

- CSS grid; rows `minmax(<row min height token>, auto)`; gap from tokens.
- Columns respond to the **container**, not the viewport, so the same bento
  works full-width on a landing page and inside a dashboard panel.
- **Never overflows:** a tile spanning more columns than currently fit spans
  all of them. When a single column fits, row spans reset to 1 too (a stacked
  list). The column count actually in use may be measured (`onResize`, as the
  tabs indicator does) and written to the tiles; pure CSS is fine if it holds
  the rule.
- Each item stretches its content to fill the cell (an `ss-card` inside fills
  the tile's height).
- No roles: a layout. Reading order is DOM order.

Tokens (`bento.json`): gap, row min height, default min item width. None on
the item unless the builder needs one.

## Testing (builder's reference: same practices as phase 2)

- e2e per component through `newTestPage` + `useTokens`; accessibility
  asserted on the accessibility tree (`axNodeByRole` / `axNodeNamed`);
  `setContent` with `<meta charset="utf-8">`; suite on `--max-workers=1`.
- A computed-style snapshot per new component; **no text-dependent widths** in
  snapshots (CI has no Sora).
- `motion.e2e` cases for the progress fill/indeterminate and the drawer slide,
  including reduced motion.
- `styles.e2e` cases so every new component is checked under the five styles.
- DS: the component JSON files, the contract fixture
  (`test/fixtures/library-contract.json`) regenerated, contrast pairs for new
  foreground/background roles if any.

## Docs

`docs/status.md` rows per wave, DS `docs/web.md`, playground examples (git
ignored). At the end of the phase, a ranked list of remaining gaps for the
user to choose phase 4.

## Left to the builder

Internal structure, exact token names and values (mapped to existing system
roles; new system tokens only where none fits, in `layout.*` for literals the
native outputs cannot take), how parents pass state to children, measuring vs
pure CSS in the bento, the indeterminate animation's exact shape.
