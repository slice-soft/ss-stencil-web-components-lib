# Conventions, and the traps behind them

Rules specific to this codebase, each with the reason it exists. Most were found
the expensive way; the point of writing them down is that nobody finds them
twice. Add to this file when you learn something the next person would otherwise
have to discover.

## Encapsulation: `scoped` or `shadow`

The rule is in `docs/atoms.md`: use `scoped` when native light-DOM behaviour
matters, `shadow` when encapsulation matters and no cross-element behaviour is
needed. Three consequences are not obvious:

- **A `scoped` component cannot style its slotted children.** Stencil applies its
  scope class only to what the component renders itself, never to what the caller
  slots in, so `.my-thing > ss-avatar { … }` matches nothing. Styling the
  caller's children requires `shadow` and `::slotted`.
- **A `shadow` component can render `scoped` atoms safely.** Their styles are
  adopted into the enclosing shadow root, so an atom does not lose its look by
  being rendered inside one. (Verified: two adopted stylesheets on the host.)
- **Hiding a slotted custom element needs `!important`.** `reset.css` sets
  `:defined { display: revert }` at document level, and for a slotted element the
  document is its own tree, which outranks a `::slotted` rule from the shadow
  tree. Only an important declaration inverts that order. Other properties —
  margin, box-shadow — apply normally.

## Coordinate children through props

No component exposes `::part`, so nothing outside a component can reach a border
radius, a colour or a state inside its shadow root. A wrapper that needs a child
to render differently **sets a prop on it**.

`join` is the worked example: `ss-input-group` cannot flatten the corner where an
addon meets the field, so `ss-input` takes `join="start" | "end" | "both"` and the
group sets it. `ss-button-group attached` does the same for a segmented row.

Forward only what the wrapper was actually given, and clear only what it set
itself — `ss-field` tracks this so it never silently re-enables a control the
caller disabled.

## Accessibility

- **Assert against the accessibility tree, not attributes.** An `aria-*`
  attribute pointing at an element in another tree looks correct and associates
  nothing: the control comes back with an empty name or description while the
  markup reads fine. `axNodeByRole` in `src/test/utils.ts` reads what the browser
  actually exposes. Puppeteer normalises role names — `role="img"` arrives as
  `image` — and a live region (`role="alert"`) has no name; it is announced by
  its content.
- **IDREFs do not cross a shadow boundary, in either direction.** `for` moves
  focus into a form-associated host but does not *name* the control inside it.
  `utils/a11y` assigns element references instead, which do cross.
- **Put the relationship on the element that takes focus**, not on a wrapper
  around it. A wrapper is never reached by assistive technology.

## The spec DOM is not a browser

`newSpecPage` runs on mock-doc. These are missing, and each one silently makes a
test pass without testing anything:

| Missing | Consequence | Where to test instead |
| --------- | ------------- | ----------------------- |
| `ElementInternals` | Form association does nothing | e2e |
| `stopImmediatePropagation` | Behaves as `stopPropagation`, so it cannot show that a listener on the same element is skipped | e2e |
| `slotchange` | Never fires. Read slots from the light DOM before rendering if the behaviour is core | either |
| `classList.toggle(name, force)` | The force argument is ignored, so the class flips on every call | use `add`/`remove` |
| focus tracking | `focus()` does not move `document.activeElement` | e2e |

Checking a capability by reading a property off mock-doc's `ElementInternals`
stand-in logs a console error for every access. Use `'setFormValue' in internals`
instead — the `has` trap is not instrumented.

## Rendering

- **Scoped rendering relocates slotted content** into the rendered tree, so
  `this.el.children` after the first render holds what the component drew, not
  what the caller passed. Search the subtree, and use
  `el.closest('<tag>') === this.el` so a nested instance does not claim it.
- **Measure-then-position stays out of the render cycle.** Writing coordinates to
  the element directly avoids a re-render per scroll frame; ask for a render only
  when something that appears in the markup changes, such as the resolved side.

## Tests and tooling

- **`npx tsc --noEmit` catches what eslint and the build do not.** A required
  `@Prop` breaks `ss-typography`'s dynamic tag, which resolves against every
  generated custom-element type; a private method named `valueOf` breaks the
  decorators. It runs as part of `npm run lint`.
- **`testing.maxWorkers` in `stencil.config.ts` does nothing.** Stencil reads the
  CLI flag. Confirm with `grep 'jest args'` in the output — it prints the workers
  actually used. The `test` script passes `--max-workers` for this reason.
- **The app-load wait is 30s, hard-coded, per call.** The suite outgrew it, so
  `newTestPage` raises it. The ceiling is jest's own per-test timeout, which
  Stencil derives from an environment variable it overwrites — 45s — so the wait
  cannot usefully go above that. Worker count and load headroom are both needed;
  neither alone was enough.
- **`setContent` declares no charset.** Non-ASCII in test markup arrives
  mis-decoded; write it as an HTML entity.
