# Component capacity (phase 2) — design

## Intent

Phase 2 of "improve the components" (phase 1 was motion, ss-design-system
2.14.0–2.15.0, lib 0.7.2–0.7.3). Three components learn to do more, without
changing how anything looks when the new capability is not used:

1. `ss-input` takes icons inside its field and a clear button.
2. `ss-card` can be a link as a whole.
3. A new `ss-search-select`: a select you type into to filter.

The user's governing principle, in their words: **the component only shows**
(single responsibility). It never fetches, debounces or talks to a server. It
displays what it is given and reports what the person did; whoever hosts it
(the shell) owns data and side effects. Filtering what the component already
holds counts as showing; getting new data does not.

## Goals

- The three capabilities above, accessible (WAI-ARIA patterns, keyboard,
  screen readers), themed by component tokens like every other component, and
  correct under every `data-style` and both themes.
- Nothing changes for a consumer who does not opt in: the five wave
  computed-style snapshots stay unchanged except where noted below.
- `ss-search-select` works with no JavaScript for a fixed list (options as
  children), and with data from anywhere (options as a property).

## Non-goals

- Fetching, debouncing, cancelling stale requests, caching, error handling for
  remote options: the shell's job. The component emits `ssSearch` and shows a
  `loading` state when told to.
- Option groups, rich option content (icons, avatars, descriptions), creating
  new options from typed text, virtualised lists for thousands of options.
  Possible later; out of scope now.
- Replacing `ss-select` (native) or `ss-combobox` (free text over a
  `<datalist>`). Both stay as they are.

## Anti-goals

- A card that is a giant clickable `div` with an invented role and keyboard
  handling. The interactive role stays on a real `<a>`.
- A search-select that loses the labels of selected options when the shell
  replaces `options` with new search results.
- Any prop whose meaning depends on the visual style.

## Approaches considered (search select)

1. **New component `ss-search-select` (+ `ss-option`)** — chosen. Built on the
   existing overlay layer (`anchorTo`, `onResize`, `onDismiss`). `ss-select` and
   `ss-combobox` are untouched.
2. Rewrite `ss-combobox` into it — rejected: breaks current free-text users.
3. A `searchable` prop on `ss-select` — rejected: one component with two
   unrelated implementations inside, against the single-responsibility rule the
   user set.

The user also chose: single selection by default, `multiple` for several;
the component filters what it holds by default, `filter="none"` turns that off;
options come as `<ss-option>` children **or** an `options` array, the array
winning when both are present.

## 1. `ss-input`: icons and clear

- Slots `start` and `end`, drawn **inside** the field's border, vertically
  centred, decorative by default (the consumer adds a label if an icon means
  something). Distinct from `ss-input-group`, whose addons sit outside the field.
- `clearable` (boolean): a clear button at the end, shown only while there is a
  value and the input is neither disabled nor readonly. Pressing it empties the
  value, emits `ssInput` and `ssChange` with `''`, updates the form value, and
  keeps focus in the input. It is a real `<button type="button">`, out of the
  tab order (`tabindex="-1"`: a keyboard user empties a text field the usual
  way, select all and delete; the button is a pointer affordance and should not
  add a tab stop to every field), with an accessible name from `clear-label`
  (default `"Clear"`, for translation). Escape does **not** clear: a plain text
  input does not, and inside a modal or popover Escape belongs to the
  `onDismiss` stack.
- What goes in the slots: icons and short text (a unit such as "kg", a domain
  such as "@example.com"). Not interactive controls — a button next to a field
  is `ss-input-group`'s end addon. The slot wrappers take `pointer-events: none`
  so a press goes to the input. The input's inline padding is the slot's
  **measured** width plus `input.icon-gap` (observed with `onResize`), so text
  wider than an icon never overlaps what is typed. The shadow tree does not
  hide the slots from assistive technology: whether an icon is decorative is
  the slotted element's business (`ss-icon` has `decorative` and `label`).
- **Builder's call, recommended:** keep the border on the `<input>` and overlay
  the icons and the button absolutely inside it, adding inline padding to the
  input only while a slot is filled or the button is shown. A wrapper that takes
  over the border would move every input property in the wave-1 snapshot and
  the `join` contract; the overlay leaves both untouched when unused.
- Tokens (ss-design-system): `input.icon-size`, `input.icon-color`,
  `input.icon-gap` (space between icon and text), `input.clear-*` (color,
  hover color, size), referencing `control.*` / `color.*` roles.

## 2. `ss-card`: the whole card as a link

- `href` (and `target`, `rel`) make the card a link. The card's docstring says
  today it has no click behaviour on purpose, so the role stays on a real
  element: the card renders one `<a>` in its shadow root and stretches its hit
  area over the whole card (the "stretched link" technique: the link's
  `::after` covers the card, which is `position: relative` since 2.13.0).
- Interactive content inside the card (buttons, links in the footer) keeps
  working: it is lifted above the stretched area with `::slotted(...)` rules
  (`position: relative; z-index`) for slotted interactive elements —
  `ss-button`, `ss-link`, `ss-dropdown`, `ss-popover`, `a`, `button`, and any
  element marked `data-card-action`. Only top-level slotted elements can be
  reached (`::slotted` does not see deeper), so an action nested inside a
  slotted wrapper needs `data-card-action` on that wrapper; documented. Plain
  text, including the header, stays under the link, so pressing it navigates.
- Accessible name: the link is named by the header slot's text
  (`ariaLabelledByElements`, through `utils/a11y`, since an IDREF does not cross
  the shadow boundary), or by `accessibility-label` when given or when there is
  no header.
- Client-side routers: the card emits `ssNavigate` (cancelable, detail
  `{ xId, href }`) on a plain left click, exactly like `ss-nav`'s `ssChange`.
  `preventDefault()` stops the browser following the link; modified clicks
  (ctrl/meta/shift/alt, middle button) are left to the browser.
- States: hover (`card.interactive-hover-shadow` / background) and a focus ring
  on the card when its link has keyboard focus (`:focus-within` +
  `:focus-visible` on the link), from new card tokens.
- Without `href` the card is exactly today's card; the wave-4 snapshot is
  unchanged.

## 3. `ss-search-select`

### Data

- Option shape: `{ value: string; label: string; disabled?: boolean; selected?: boolean }`.
- `<ss-option value="co" disabled>Colombia</ss-option>` children are data only:
  the component reads them (value, text, disabled) and draws the list itself,
  as `ss-tabs` draws its tabs from each `ss-tab`. `ss-option` renders nothing.
- `options` property (array). When set, it wins over children.
- Children changing (added, removed, text edited) update the list
  (MutationObserver or slotchange plus `ss-option` asking for a redraw, as
  `ss-tab` does).

### Behaviour

- WAI-ARIA combobox with a listbox popup: an `<input role="combobox">` with
  `aria-expanded`, `aria-controls` and `aria-activedescendant` pointing at the
  active option, all in the component's own render tree (which is why the list
  is drawn here, not slotted: the IDREFs resolve).
- Opens on typing, on ArrowDown/ArrowUp, or on pressing the field. Arrows move
  the active option (skipping disabled), Home/End, Enter selects, Escape closes
  (a second Escape clears the typed text), Tab closes and moves on. A press
  outside closes (`onDismiss`).
- **Filtering** (`filter="contains"`, the default): case- and
  accent-insensitive substring match on the label ("peru" finds "Perú").
  `filter="none"`: show `options` exactly as given; the shell filters.
- **Search event:** `ssSearch` (`{ xId, query }`), never debounced; exactly
  when, below. `ssChange` (`{ xId, value }`, `value` a string, or a
  string array with `multiple`) when the selection changes.
- **States:** `loading` shows a spinner row with `loading-label` (default
  `"Loading…"`); no matches shows `empty-label` (default `"No results"`). Both
  are announced through a polite live region.
- **Single:** the field shows the selected option's label. Typing filters;
  closing without choosing restores the selected label — except when the text
  was emptied: closing with an empty field clears the selection (`value` →
  `''`, `ssChange`). `clearable` adds the same clear button as `ss-input`
  (emptying the text and the selection, keeping focus).
- **What the list shows when it opens:** every option (with `filter="contains"`).
  The shown label of the current selection is not a query; only text the person
  types filters.
- **What fires `ssSearch`:** only text the person changes (`input` events:
  typing, deleting, pasting, the second Escape, the clear button). The
  component's own text changes — showing a picked label, restoring it on
  close, emptying the field after a pick in `multiple` — do not fire it. On
  opening, the shell sees no event; a shell that loads remote options on open
  listens for `ssOpenChange` (`{ xId, open }`), the event every overlay in the
  library already emits.
- **Multiple:** selected options render as removable chips before the text
  (each chip's remove button named "Remove <label>"); Backspace in an empty field
  removes the last chip; the list stays open after a pick and marks picked
  options `aria-selected="true"`.
- **Value and initial selection.** `value` is a string; with `multiple` the
  property is a `string[]`. In HTML, without JavaScript, the starting selection
  is written as `selected` on `ss-option`, as on a native `<option>` — no
  comma-separated or JSON attribute. The `value` property, once set, wins over
  `selected`. Form reset restores the selection the component started with.
- **Selected labels survive new options.** The component keeps the
  `{ value, label }` of every selected option, so replacing `options` with
  search results never turns a chip or the shown label into a bare value.
  Setting `value` to something not among the known options shows the value
  itself until an option with that value appears.
- Form: `formAssociated`, `name`, `required`, `disabled` (and an ancestor
  fieldset's), reset to the initial value. With `multiple`, one form entry per
  value (`setFormValue(FormData)`).
- Common props shared with `ss-select` / `ss-input`: `size`, `x-style`,
  `color`, `invalid`, `full-width`, `placeholder`, `accessibility-label`,
  `described-by`, `inline-styles`, `x-id`.
- Motion: the list enters/leaves with the dropdown's `enter-*` tokens (motion
  phase 1); reduced motion keeps only the fade.

### Tokens

`tokens/components/search-select.json`: field tokens referencing `field.*` /
`control.*` (like `combobox`), list surface and menu tokens referencing
`material.*`, `shape.radius.menu`, `layout.overlay.menu-min-width`,
`elevation.*`, option hover/active/selected colors, chip tokens, `enter-*` →
`motion.*.menu`. Added to the library contract fixture.

## Delivery

Two pull-request pairs (ss-design-system + lib), in order:

1. `ss-input` icons/clear and the clickable `ss-card` (small, independent).
2. `ss-search-select` + `ss-option`.

Each with spec and e2e tests (keyboard, screen-reader tree via the
accessibility snapshot, form submission, every `data-style` and both themes in
the style snapshot), a playground example, and docs (`status.md`,
`atoms.md`/organism docs, ss-design-system `web.md`).

## Left to the builder

- Exact token names and values within the roles above.
- Whether `ss-search-select` is shadow or scoped (see the shadow-vs-scoped
  rationale in `docs/conventions.md`; form association favours shadow with
  `delegatesFocus`, the floating list favours whatever `ss-dropdown` uses).
- How children changes are observed.
