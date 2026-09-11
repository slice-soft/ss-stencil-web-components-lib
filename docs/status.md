# Status

Where the component layers stand. Update this when you finish a piece of work;
it is what a session with no memory of the last one reads first.

Last updated: 2026-09-10 · 74 test suites, 612 tests.

## What exists

**Atoms (18)** — avatar, badge, button, checkbox, combobox, divider, icon, input,
label, link, radio, select, slider, spinner, switch, textarea, tooltip,
typography.

**Molecules (11)** — alert, avatar-group, breadcrumb, breadcrumb-item,
button-group, card, checkbox-group, field, input-group, pagination, radio-group.

**Organisms (13)** — accordion, accordion-item, dropdown, dropdown-item, modal,
nav, nav-item, popover, tab, table, tabs, toast, toaster.

**Shared helpers** — `utils/`: a11y, dismiss, focus, id, popup, position,
roving, slot, style. `types/`: control-events, join, popup, size, typography,
variant.

## Done, in the order it was built

| # | Work | Notes |
| --- | ------ | ------- |
| 0 | Form association | input, textarea and slider are `formAssociated` with `delegatesFocus`. Their `name` and `describedBy` props previously did nothing: a form submitted no value and a label focused nothing |
| 0 | Cross-root ARIA | `utils/a11y` assigns `ariaLabelledByElements` / `ariaDescribedByElements`. An IDREF does not cross a shadow boundary, so the attribute alone left controls unnamed and undescribed |
| 0 | `utils/id`, dev token sets | The two dev token sets were missing 46 `--ss-*` variables the atom stylesheets already referenced |
| 1 | field, radio-group, checkbox-group | The form molecules |
| 2 | alert, card, button-group, avatar-group, input-group, pagination, breadcrumb | Composition molecules |
| 2 | `join` contract | `types/join.d.ts`, consumed by button and input. How a wrapper makes a segmented seam without reaching into a shadow root |
| 3 | `utils/position`, `utils/focus`, `utils/dismiss` | The overlay foundation. Tooltip consumes positioning; modal consumes focus and dismissal |
| — | tooltip accessibility | Escape dismisses it, and it now describes its trigger. It previously described a wrapper that never takes focus |
| — | `tsc --noEmit` in `npm run lint` | It catches regressions eslint and the build both pass |
| 4 | Four overlay bugs, found building on them | `ss-modal` was 128px wide at every size from md up — the dimension scale stops at 128px. It trapped focus on nothing when opened after load, because it activated before the render that shows it. Its centring `transform` would have misplaced any fixed descendant. And `trapFocus` handed focus back to a shadow host, which moves it nowhere. Each has an e2e that was checked to fail with the old code put back |
| 4 | The shared overlay layer | `place()` takes `align`; `anchorTo` and `onResize` do the DOM side for everything that floats; `onDismiss` is a stack, so Escape and outside presses reach only the top layer; `utils/popup` marks the trigger; `utils/roving` holds the arrow-key logic for menus, tabs and accordions; `ss-button` takes `popup` and `expanded` |
| 4 | popover | Non-modal dialog anchored to a trigger. Focus goes in on open; Escape hands it back to the trigger; Tab or a press elsewhere closes it and leaves focus where it went. Follows the trigger if it resizes while open |
| 4 | e2e against real tokens | `useTokens(page)`. No e2e loaded the design tokens before, so every layout assertion measured lengths that had resolved to nothing |
| 4 | dropdown, dropdown-item | WAI-ARIA menu button. Focus goes into the menu on open; arrows wrap and skip disabled items, Home/End jump, a letter jumps to the next match; Enter, Space or a click picks and emits `ssSelect`. Picking or Escape hands focus back to the button; Tab closes and moves on. `role="menuitem"` sits on each item's host |
| 4 | toast, toaster | A toast is an `ss-alert` with a clock: it closes after `duration`, and the clock holds while it is hovered, has focus inside, or the tab is hidden (WCAG 2.2.1). The toaster is the fixed, named region that stacks them, with no `aria-live` of its own — each toast is already a live region |
| 4 | tabs, tab | WAI-ARIA tabs: one tab stop, arrows that wrap and skip disabled tabs, Home/End, automatic or manual activation, either orientation. `ss-tabs` draws the tab buttons from each `ss-tab`'s `label`, so tabs and panels share a tree and their IDREFs resolve; the panel stays in `ss-tab`, which asks the set to redraw when its label changes |
| 4 | accordion, accordion-item | Each item is a disclosure: a real heading (`heading-level`, 1–6) holding a button with `aria-expanded`, over a region named by it. The accordion keeps one open by default (`multiple` for several) and moves between headers with the arrows. It filters `ssOpenChange` by tag and owner, since overlays inside a section emit the same event |
| 4 | nav, nav-item | A named `nav` landmark over a list of real links, the current one marked `aria-current="page"` on the link itself. No menu roles: site navigation keeps open-in-new-tab and plain Tab. `ssChange` is cancelable, so a client-side router calls `preventDefault()` and routes; a modified click is left to the browser |
| 4 | table | Data-driven — `columns` and `rows` as properties — because a scoped component cannot style slotted cells. A real `<table>` named by its caption; sortable headers are buttons, with `aria-sort` on the cell; natural sort, empty cells last, on a copy; `manual-sort` for rows sorted elsewhere. The scroll area becomes a focusable region only while it overflows. Optional sticky header |
| 4 | e2e harness at full size | At 74 files the load flake returned and the toast's clock tests failed most full runs. jest's timeout, recorded as a fixed 45s, is raised to 90s by a setup file that runs after Stencil's, and the app-load wait to 80s. The toast tests were measuring the harness — a test's page is often a background tab, hidden and without window focus — and now pin visibility and emulate focus |

## Next

**Phase 4 is built, and the suite is green at its full size.** What is left is
under "Open" — decisions worth making before they are needed — plus merging
the two pull requests in order: #46 (phases 0–3, into `main`), then #47
(phase 4, stacked on #46). Once #46 is in, `feat/organisms` has to be rebased
onto `main`, because the repo merges by squash or rebase and phase 0–3 land
with new hashes.
For anything new,
`ss-popover` is the pattern for what is anchored to a trigger and `ss-modal`
for what takes the page over. New organisms go in
`src/components/organisms/`.

Each needs the same shape as everything else: same-name TSX and SCSS, a spec, an
e2e where behaviour needs a real browser (with `useTokens` before measuring
anything), and a section in `src/index.html`.

## Open, and worth deciding before it is needed

- **The suite has three consecutive clean runs, not ten.** The last flake fix
  was held to ten. Since the timeout ceiling was raised there has been no load
  timeout in thirteen full runs, against five in the seven before; the only
  failures since were the toast's, now understood and fixed. Worth a few more
  full runs before calling it closed.
- **Scoped components do not slot children added after they render.** Found
  on `ss-toaster`, now shadow. Any scoped component that slots content is
  likely to have the same gap when a framework adds a child after mount — a
  dropdown item, a tab, an accordion section, a nav item, a breadcrumb step —
  but they have not been checked one by one. Stencil's
  `extras.experimentalSlotFixes` in `stencil.config.ts` is meant to fix it for
  all of them; it changes slot behaviour library-wide and wants a full-suite
  run before it is turned on.
- **`ss-table` cells are text.** A column's `format` shapes the text; there are
  no rich cells, row selection or column resizing. A cell that renders markup
  needs either a render-function prop, which ties the table to one framework's
  idea of a render function, or a slot per cell, which a scoped component
  cannot style. Worth designing against a real consumer.
- **No imperative toast API.** A toast is markup: showing one from code means
  creating an `ss-toast`, and a closed one stays in the DOM until removed. The
  harness demo does both in a dozen lines. A `toast()` helper or a toaster
  method would save every app writing them, but its shape — options, return
  value, queue limit — is better decided by a first real consumer.
- **`ss-tooltip` sits outside the dismissal stack.** It listens for Escape on its
  own, so Escape over a tooltip inside a dialog closes both. It also does not
  follow a trigger that resizes while it is open; popover and dropdown do,
  through `onResize`.
- **A vertical segmented group.** `join` names inline sides (`start`/`end`).
  Flattening block corners for a stacked group is a different contract, not an
  extra value, so `ss-button-group` refuses to attach when vertical.
- **`variant` versus `color`.** Three atoms take `variant`, eight take `color`,
  for the same idea. Unifying is a breaking change and needs release planning.
- **`ss-button`'s click payload** is a scalar where every other event carries an
  object. Same story: breaking.
- **`::part`.** Nothing exposes styling parts. Everything so far has been solved
  by prop coordination instead; revisit only when something genuinely cannot be.
- **`choice-control($block)` mixin and a `bem()` helper.** Both optional, both
  recorded in `MOLECULES_ARCHITECTURE.md` §13. Neither blocks anything.

## Known limits

- **The dev token sets are synced by hand.** `test/token-set-0*/tokens.css`
  mirror `ss-design-system`. A token added there has to be copied here or the
  harness renders with it undefined, silently.
- **Overlay widths are arithmetic.** There is no width token above 128px, so the
  overlays use multiples of `--ss-dimensions-32`. Recorded in
  `docs/pending-token-proposals.md`.
- **Alignment is left-to-right only.** `align="start"` means the left edge;
  nothing reads `dir`.
- **Slot changes alone do not re-render a molecule.** Components read their slots
  before rendering; a prop change re-reads them. Where dynamic content matters,
  `slotchange` is wired to ask for a render — `ss-input-group` does this.
