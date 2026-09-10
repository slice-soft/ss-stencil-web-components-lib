# Status

Where the component layers stand. Update this when you finish a piece of work;
it is what a session with no memory of the last one reads first.

Last updated: 2026-09-10 · 56 test suites, 428 tests.

## What exists

**Atoms (18)** — avatar, badge, button, checkbox, combobox, divider, icon, input,
label, link, radio, select, slider, spinner, switch, textarea, tooltip,
typography.

**Molecules (11)** — alert, avatar-group, breadcrumb, breadcrumb-item,
button-group, card, checkbox-group, field, input-group, pagination, radio-group.

**Organisms (1)** — modal.

**Shared helpers** — `utils/`: a11y, dismiss, focus, id, position, slot, style.
`types/`: control-events, join, size, typography, variant.

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

## Next

**Phase 4 — the rest of the overlay layer.** The foundation is built and proven;
`ss-modal` is the pattern to copy. In rough order of how much is already
demonstrated: dropdown/menu, popover, toast, tabs, accordion, nav, table. New
organisms go in `src/components/organisms/`.

Each needs the same shape as everything else: same-name TSX and SCSS, a spec, an
e2e where behaviour needs a real browser, and a section in `src/index.html`.

## Open, and worth deciding before it is needed

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
- **Slot changes alone do not re-render a molecule.** Components read their slots
  before rendering; a prop change re-reads them. Where dynamic content matters,
  `slotchange` is wired to ask for a render — `ss-input-group` does this.
