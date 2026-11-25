# Status

Where the component layers stand. Update this when you finish a piece of work;
it is what a session with no memory of the last one reads first.

Last updated: 2026-11-24 · 87 test suites, 709 tests.

## What exists

**Atoms (21)** — avatar, badge, button, checkbox, combobox, divider, icon, input,
label, link, option, progress, radio, select, skeleton, slider, spinner, switch,
textarea, tooltip, typography.

**Molecules (11)** — alert, avatar-group, breadcrumb, breadcrumb-item,
button-group, card, checkbox-group, field, input-group, pagination, radio-group.

**Organisms (15)** — accordion, accordion-item, drawer, dropdown, dropdown-item,
modal, nav, nav-item, popover, search-select, tab, table, tabs, toast, toaster.

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
| 5 | Tests on the released design tokens | Tests and the local playground use a committed copy of ss-design-system (`test/tokens/design-system/`) for the structure, refreshed by `npm run tokens:sync`, which copies a local design-system build (`../ss-design-system/dist/css`) — nothing is downloaded; `test/tokens.config.json` records its version. No test touches the network. On top of it, `test/brands/test-base/` replaces every brand-level value with generic ones, so no real brand's values reach a test (`brands.spec.ts` enforces it); `neon-purple` and `organic-emerald` are variations on top of test-base, checked for button contrast in both themes |
| 5 | Token layer lint | `npm run lint` fails on any `var(--ss-*)` a component reads outside its own tokens. Since wave 5 it holds every component, with no list of exceptions (`scripts/token-layers.config.json` is gone). Plan: `docs/superpowers/plans/2026-11-23-lib-tokens-foundation-wave1.md` |
| 5 | Playground is local only | `src/index.html` is a bare page: the committed token copy (`/test-tokens/design-system/`) + build scripts, no external URL (`brands.spec.ts` checks). The playground moved to `src/playground.html`, git-ignored; `stencil.config.ts` serves it when present and it reads the token version from `test/tokens.config.json`. It was never published (the release ships `dist/` and `loader/` only); its last tracked copy is `6268ae5:src/index.html` |
| 6 | Wave 1 on component tokens | `ss-button`, `ss-input`, `ss-textarea`, `ss-select`, `ss-combobox` read only `--ss-<component>-*`, defined in ss-design-system 2.8.0 (`tokens/components/`, with new `control.*`, `field.size.*` and `motion.duration.spin` roles). A computed-style snapshot taken before the move (`src/test/wave-1.styles.e2e.ts`, every size, variant, style, rest/hover/focus, both themes) is unchanged except the intended fix: outline and ghost button text now uses `--ss-color-*-text` (dark; tertiary and destructive have their own roles since 2.8.0) and `*-foreground` for default/secondary/quaternary, which were illegible (1.10:1 on white). `wave-1.tokens.e2e.ts` proves a component token moves only its component. `ss-input` still honors `--ss-input-border`, `-border-radius` and `-border-focus`; `ss-textarea`, `ss-select` and `ss-combobox` no longer read `--ss-input-*` overrides (they have their own tokens) |
| 6 | Theming by container | ss-design-system 2.8.0 re-declares component tokens under `[data-theme]` and the light semantic colors under `[data-theme="light"]`, so `data-theme` on any container (a dark card on a light page, or the reverse) reaches the components inside it. `wave-1.tokens.e2e.ts` checks both directions |
| 6 | The "App did not load" flake, root-caused | Pages from parallel workers share one Chrome; one worker's new page could hide another's, and a hidden page runs no animation frames, so Stencil never finished loading it. Measured 9 of 239 pages hidden with 3 workers, none with 1. `npm test` runs one worker (~250s for the full suite, 2 clean runs of 654). Details in `docs/conventions.md` |
| 7 | Wave 2 on component tokens | `ss-checkbox`, `ss-radio`, `ss-switch`, `ss-slider`, `ss-label` read only `--ss-<component>-*` (ss-design-system 2.9.0: `tokens/components/{checkbox,radio,switch,slider,label}.json`, new `choice.*` system roles, `shape.radius.subtle`, slider track roles in `control.*`). The computed-style snapshot taken before (`wave-2.styles.e2e.ts`: every size and state, rest and focused, both themes) is unchanged, value for value. `wave-2.tokens.e2e.ts`: a component token moves one component; `--ss-color-primary` reaches the three choice controls; `choice.size.md.font-size` reaches all four |
| 8 | Wave 3 on component tokens | `ss-avatar`, `ss-badge`, `ss-divider`, `ss-icon`, `ss-link`, `ss-spinner`, `ss-tooltip`, `ss-typography` read only their own tokens (ss-design-system 2.10.0). New system roles a brand can move as a whole: `type.*` (families, sizes, weights, line heights, letter spacing, ink), `space.*` (the spacing scale), `elevation.*`, `layout.layer.*`. Snapshot (`wave-3.styles.e2e.ts`) unchanged, value for value. `wave-3.tokens.e2e.ts`: `--ss-type-weight-medium` reaches badge, divider, link, tooltip and typography; `--ss-space-10` the default avatar. Every atom is now migrated |
| 9 | Wave 4 on component tokens | The molecules — `ss-alert`, `ss-avatar-group`, `ss-breadcrumb`, `ss-breadcrumb-item`, `ss-button-group`, `ss-card`, `ss-checkbox-group`, `ss-field`, `ss-input-group`, `ss-pagination`, `ss-radio-group` — read only their own tokens (ss-design-system 2.11.0; new `layout.overlap` role). Snapshot (`wave-4.styles.e2e.ts`, including the children `::slotted` styles reach) unchanged, value for value. `wave-4.tokens.e2e.ts`: `--ss-space-2` reaches card, button group and breadcrumb; `--ss-color-muted` the input group's addon. `ss-input-group`'s addons no longer read `--ss-input-*` |
| 10 | Wave 5 on component tokens | The organisms — `ss-accordion`, `ss-accordion-item`, `ss-dropdown`, `ss-dropdown-item`, `ss-modal`, `ss-nav`, `ss-nav-item`, `ss-popover`, `ss-tab`, `ss-table`, `ss-tabs`, `ss-toast`, `ss-toaster` — read only their own tokens (ss-design-system 2.12.0). New system roles: `shape.radius.menu`, `layout.overlay.{menu-min-width,panel-min-width,toast-width,backdrop-opacity}`; modal sizes read `layout.overlay.width.*`, so the `calc(dimensions-32 * n)` widths are gone. Snapshot (`wave-5.styles.e2e.ts`: every size, placement and state, hovered and focused targets, both themes) unchanged, value for value. `wave-5.tokens.e2e.ts`: `shape.radius.surface` reaches modal and popover only; `layout.overlay.width.md` the md dialog. **Every component is migrated**: the lint is strict library-wide and `_mixins.scss` is removed |
| 11 | Visual styles | `data-style="brutal|glass|clay|minimal|maximal"` on any element restyles the components inside (ss-design-system 2.13.0, `styles/*.json`: system-role overrides only). No prop depends on the style. Controls read `--ss-<c>-shadow` (none by default, never on a ghost button); card, modal and popover draw `--ss-<c>-backdrop-filter` on a `::before` layer (`backdrop-layer` in `_control.scss`) so they never become the containing block of a fixed dropdown or popover; the dropdown menu, which scrolls, carries it itself. The card is now `position: relative`. The five wave snapshots are unchanged; `styles.e2e.ts` proves scoping, a dark island inside a style, glass layering, and records each style's look. Each style is tuned through parameters (`--ss-style-<style>-<name>`) every one of its values is built on, and `data-style="base"` restores the stock look inside a styled region; `styles.e2e.ts` proves both. Values are a first pass, tuned by eye: clay's inner highlight is heavy in dark |
| 12 | Motion | Overlays grow in from their trigger and fade (popover, dropdown, tooltip; the modal from its centre, with its backdrop) and leave the same way, staying on screen until the exit plays (`@starting-style` + `allow-discrete`). Toasts slide in from the edge their toaster sits on; accordion sections open to their height (`interpolate-size`, Chromium; elsewhere they still fade); tabs fade their color. Everything reads the component's `enter-*` tokens → `motion.*` (ss-design-system 2.14.0), so each visual style moves differently. Reduced motion keeps only the fades. The button names its transitioned properties instead of `all`. Snapshot changes are closed parts only: a hidden panel, toast or section now records its exit state (opacity 0, scaled, no padding). `motion.e2e.ts` watches entrances with durations stretched to 2s |
| 13 | Tabs indicator, skeleton | One indicator per tab set, measured under the selected tab, slides to the next (`indicator-*` → `motion.duration.slide`, `motion.easing.move`; brutal cuts linear and short, clay and maximal overshoot). It starts in place — the transition is added only after the first position — and follows its tab's size through `onResize`. `onResize` now watches the border box: the content box missed a change of padding, which its own comment promised to catch, in overlays too. `ss-skeleton` (atom, shadow): `shape` text / rect / circle, `lines`; hidden from assistive technology, the loading region carries `aria-busy`; it pulses with `motion.*.pulse` and holds still with reduced motion (ss-design-system 2.15.0). Snapshots: the selected tab no longer draws its own border color |
| 14 | Input icons and clear, card as a link | Phase 2, wave 1 (spec `docs/superpowers/specs/2026-11-24-component-capacity-design.md`, plan `docs/superpowers/plans/2026-11-24-component-capacity.md`). `ss-input` has `start`/`end` slots drawn inside its border (icons or short text, not controls) and `clearable` + `clear-label`. The border stays on the `<input>`: a `div.ss-input__field` only positions the slots, and the input's inline padding grows by each slot's measured width (`--_start`/`--_end`, through `onResize`), so the wave-1 snapshot is unchanged. The clear button is out of the tab order and Escape does not clear. `ss-card` takes `href` (`target`, `rel`, `accessibility-label`): one real `<a>` whose `::after` covers the card; slotted actions are lifted above it (only direct children: a nested one needs `data-card-action` on its wrapper). Named by the label, else the header, else the content, through `ariaLabelledByElements`. `ssNavigate` is cancelable, like `ss-nav`'s `ssChange`. ss-design-system 2.16.0 |
| 15 | Search select | Phase 2, wave 2. `ss-search-select` (+ `ss-option`, data only): a WAI-ARIA combobox over a listbox it draws itself from `ss-option` children or the `options` property (which wins), so `aria-activedescendant` resolves in its own tree. It only shows: `ssSearch` on every change the person makes to the text, never debounced; `filter="contains"` (default, case- and accent-insensitive, `utils/options`) or `"none"` (show `options` as given); `loading`, `loading-label`, `empty-label`, announced in a live region. `multiple` draws chips (Backspace removes the last; each chip's remove is a `span role=button`, because `delegatesFocus` would send focus to any focusable element before the input); starting selection in HTML is `selected` on `ss-option`. Every selected label is remembered, so new search results never turn a chip into a bare value. Escape closes, a second Escape clears the text; Home/End move within an open list (otherwise the caret); typing over a shown label starts a new search (`beforeinput`, bound by hand: Stencil does not bind `onBeforeInput`); leaving the field restores the label, or clears a single selection when the text was emptied. `ss-field` names and describes it (`labelled-by`); `remove-label` translates the chips' remove names. Selection is shown by a check mark, not color alone. Form-associated (one entry per value). Snapshot: `search-select.styles.e2e.ts`. ss-design-system 2.16.0. Not yet: option groups, rich options, creating options from text |
| 16 | Progress, drawer | Phase 3, wave 1 (spec `docs/superpowers/specs/2026-11-25-new-components-design.md`, plan `docs/superpowers/plans/2026-11-25-new-components.md`). `ss-progress` (atom, shadow): `value`/`max` (a non-number value is indeterminate; the value is clamped, a non-positive `max` is 100), `shape` bar/circle, `size`, the spinner's colors, `label` or `labelled-by`, `value-text`, `show-value`. One `role="progressbar"`; indeterminate travels (bar) or turns (circle) and holds still with reduced motion. Chrome's accessibility tree reports `valuetext` as "" even for a plain div, so that one test reads the attribute. `ss-drawer` (organism, scoped like the modal): `placement` start/end/top/bottom (start/end follow the writing direction), `size`, `modal`; modal is `ss-modal`'s behaviour on an edge; `modal="false"` is a side panel — no backdrop, trap or scroll lock, focus goes in and comes back only if it was still inside, and Escape closes it only when pressed inside: `onDismiss` takes `escape: 'focus-within'`, which passes Escape typed elsewhere to the layer beneath. It slides with `translate` and has none left once open (fixed dropdowns inside are still placed against the viewport). `AxNode` (`src/test/utils.ts`) now carries `value`, `valuemin`, `valuemax`, `valuetext`, `modal`. ss-design-system 2.17.0 |

## Playground and release readiness

The playground catalog covers 42 components across 36 examples. Search includes
the names of companion components, and each example has a direct link. The theme
and token-set controls retain their selections between visits.

The browser review found horizontal overflow in the input, textarea and combobox
at 320 CSS pixels. Their intrinsic widths now respect the available space. The
playground supplies accessible names for its standalone input, textarea and
select examples. An interactive tooltip now shares Escape dismissal with its containing
dialog, so a keyboard user can dismiss it independently.

Before release, verify keyboard and screen-reader behavior across the catalog,
contrast in both token sets and themes, and consumer builds using the documented
package entry points. Use a consumer scenario to prioritize additional components
or APIs. For anchored organisms, follow `ss-popover`. For modal dialogs, follow
`ss-modal`. Add an example in the local playground (`src/playground.html`, git-ignored) alongside component specs and
browser coverage for interactive behavior.

## Open, and worth deciding before it is needed

- **Bento and richer components are the next project.** Bento is a layout
  (a grid of tiles), not a style: it belongs with the component improvements,
  designed separately. Native apps get no per-style token outputs yet; glass's
  surface is a CSS `color-mix()` with no native equivalent (see the design
  system's `docs/superpowers/specs/2026-11-24-visual-styles-design.md`).

- **Text in the primary or destructive color uses the fill role.** The
  selected tab (`tabs.selected-foreground`, `indicator-color`) and a
  destructive dropdown item (`dropdown-item.destructive-foreground`) point at
  `color.primary` / `color.destructive`, as they did before wave 5. Buttons
  moved their text to `color.*-text` in wave 1 for contrast; these two could
  follow, as a visible change of its own, with a contrast pair in the design
  system's `test/contrast-pairs.json`.

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
- **Tooltip repositioning after resize.** Tooltip follows scrolling and viewport
  resize. Popover and dropdown also observe changes to their anchor dimensions.
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

- **Overlay widths are arithmetic.** There is no width token above 128px, so the
  overlays use multiples of `--ss-dimensions-32`. Recorded in
  `docs/pending-token-proposals.md`.
- **Alignment is left-to-right only.** `align="start"` means the left edge;
  nothing reads `dir`.
- **Slot changes alone do not re-render a molecule.** Components read their slots
  before rendering; a prop change re-reads them. Where dynamic content matters,
  `slotchange` is wired to ask for a render — `ss-input-group` does this.
