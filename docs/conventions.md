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

## Overlays

The shared pieces live in `utils/`: `position` (the geometry, plus `anchorTo`
for the DOM side), `focus`, `dismiss`, `popup` (the trigger) and `roving` (arrow
keys). `ss-popover` is the smallest complete example; `ss-dropdown` adds roving
focus on top of it.

- **Open after the render, close before it.** A panel hidden with `hidden` can
  neither take focus nor be measured, and `@Watch` runs before the render that
  shows it — activating there traps focus on nothing. That was `ss-modal`'s bug
  for any dialog opened after load. Closing is the reverse: once the render has
  hidden the panel, focus inside it is already lost to the page, so the watcher
  is the place to rescue it.
- **Give focus back to what really had it.** `document.activeElement` stops at a
  shadow host, and `focus()` on an `ss-button` host moves focus nowhere. Save
  `deepestActive()`, and hand focus back with `focusInto()`.
- **No `transform` on anything that may hold a floating element.** A transformed
  ancestor becomes the containing block for `position: fixed` descendants, so a
  panel measured in viewport coordinates lands offset by wherever that ancestor
  sits. `ss-modal` centres with `inset` and auto margins for this reason.
- **One layer hears a dismissal.** `onDismiss` keeps a stack, and only the top
  layer receives Escape or an outside press. A top layer that refuses one — a
  dialog that must be answered — blocks the layers beneath rather than passing
  it down.
- **A trigger must not disable itself after a click.** `ss-button` normally
  disables itself briefly after a press, to stop a double submit. Focus handed
  back to it on close would land on a disabled control and be lost, so it skips
  that when `popup` or `expanded` is set. `markTrigger` sets both.
- **Let the browser move focus on Tab.** A menu closes on Tab without
  preventing it: closing sends focus to the trigger, and the browser's own Tab
  then continues from there, past the menu. Computing the destination by hand
  gets Shift+Tab, iframes and shadow roots wrong in ways the default does not.

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
| `disabled` on form controls | `button.disabled` is `undefined` whatever the attribute says, so a check on the property fails on a control that is plainly disabled | assert `hasAttribute('disabled')` |
| the query's own element as an ancestor | `el.querySelectorAll('a b')` does not let `el` itself be the `a`. A browser matches the selector against the whole document; mock-doc only inside `el`. Checked: `section.querySelectorAll('section p')` is 1 in a browser, 0 here. A nested-component test written the obvious way comes back empty | query from the inner element itself |

Checking a capability by reading a property off mock-doc's `ElementInternals`
stand-in logs a console error for every access. Use `'setFormValue' in internals`
instead — the `has` trap is not instrumented.

## Rendering

- **Scoped rendering relocates slotted content** into the rendered tree, so
  `this.el.children` after the first render holds what the component drew, not
  what the caller passed. Search the subtree, and use
  `el.closest('<tag>') === this.el` so a nested instance does not claim it.
- **A scoped wrapper can fill a shadow child's slots.** Relocation moves the
  caller's nodes into the child element with their `slot` attributes intact,
  so the child slots them itself. `ss-toast` hands its content to `ss-alert`
  this way, `title` included — which the alert detects by querying its own
  light DOM, and finds.
- **A scoped component only moves children into its slots when it renders.**
  A child appended later stays a direct child of the host, outside everything
  the component drew. `ss-toaster` was scoped, and every toast the playground
  created landed in the page flow instead of the fixed corner — while every
  e2e passed, because they wrote the toasts into the initial markup. It is
  shadow now, which slots a child the moment it is added. Test any slotting
  component with a child added after load. Stencil's
  `extras.experimentalSlotFixes` is meant to patch this for scoped components
  library-wide; not enabled — see `docs/status.md`.
- **Measure-then-position stays out of the render cycle.** Writing coordinates to
  the element directly avoids a re-render per scroll frame; ask for a render only
  when something that appears in the markup changes, such as the resolved side.

## Component tokens

- **A component reads only `--ss-<component>-*`.** Every component, with no
  list of exceptions: `npm run lint` fails on any other `--ss-*`, semantic
  colors included. A new component starts by adding its tokens to
  ss-design-system. CSS keywords that are not design
  decisions (`0`, `100%`, `transparent`, `currentColor`) are written literally.
  Write rules with `t($component, name)` from `src/global/styles/_control.scss`.
- **Migrating a component**: snapshot its computed styles first (see
  `src/test/style-snapshot.ts`); add its tokens to ss-design-system, each
  pointing at a system role or semantic color with the value the stylesheet
  reads today, and its variables to that repo's
  `test/fixtures/library-contract.json`; then rewrite the stylesheet until the
  snapshot passes untouched. Build the design-system branch (`npm run build`
  there), run `npm run tokens:sync` here (it copies
  `../ss-design-system/dist/css`), and set the version it will be released
  as in `test/tokens.config.json`.
- **A style snapshot records nothing the installed font decides.** CI has no
  Sora, so text sets in a fallback font: `height`, the `width` of anything
  wrapping text, and a grid track sized to its content (`grid-template-columns`
  on `ss-field`), and the `auto` vertical margins that centre `ss-modal`'s
  dialog (as tall as its content) each came out a few pixels apart and failed
  only in CI.
  Padding, font size and the declared tokens already pin a component; record
  `width` only for parts the stylesheet sizes (`sized` in `computedParts`).
- **A snapshot records only what one run decides.** Several open modals on one
  page each pull focus into themselves, so which one holds it — and draws the
  browser's focus outline — changes from run to run; `wave-5.styles.e2e.ts`
  leaves `outline-*` out of the modal's parts. Hover and focus a named element
  (`target`), not a whole host: the centre of a nav or a tab list lands on
  whichever item the installed font puts there.
- **A test that injects its own tokens must name the component's.** The input
  group's seam test set `--ss-radius-base`; the migrated input reads
  `--ss-input-size-md-radius`, and the corner silently went to 0.

## Tests and tooling

- **`npx tsc --noEmit` catches what eslint and the build do not.** A required
  `@Prop` breaks `ss-typography`'s dynamic tag, which resolves against every
  generated custom-element type; a private method named `valueOf` breaks the
  decorators. It runs as part of `npm run lint`.
- **`testing.maxWorkers` in `stencil.config.ts` does nothing.** Stencil reads the
  CLI flag. Confirm with `grep 'jest args'` in the output — it prints the workers
  actually used. The `test` script passes `--max-workers` for this reason.
- **The app-load wait is 30s, hard-coded, per call.** The suite outgrew it, so
  `newTestPage` raises it — to 80s since the suite reached 74 files. Its
  ceiling is jest's per-test timeout, which Stencil sets to 45s from its own
  setup file. That was recorded here as unchangeable, and it is not: Stencil
  puts its setup file first in `setupFilesAfterEnv`, so
  `src/test/jest-setup.ts`, listed in `stencil.config.ts`, runs after it and
  raises the timeout to 90s. Checked both ways with a test that waits 50s: it
  fails at 45s without the file and passes with it.
- **"App did not load" was hidden pages, not slow ones — e2e runs one
  worker.** Every worker opens its pages in the one Chrome Stencil launches,
  and a page opened by one worker can leave another worker's page hidden. A
  hidden page gets no `requestAnimationFrame`, so Stencil never finishes its
  first render, `window.stencilAppLoaded` stays false, and Stencil's own wait
  (which also polls on animation frames) gives up. Instrumented on a failure:
  `visibilityState` hidden, `stencilAppLoaded` false, every element already
  defined, rAF not firing, four pages open. Measured on the full e2e suite: 3
  workers created 9 of 239 pages hidden and failed one test; 1 worker created
  none, failed none, and took 237s against 194s. Raising the load wait only
  hid this (a hidden page can stay hidden past any wait); `bringToFront()` did
  not help, since the next page another worker opens takes the front again.
  `scripts/test-config.test.mjs` keeps the script at one worker.
- **Pass `page.evaluate` a string in shared helpers.** `npm test` runs with
  `--coverage`, which instruments every function in `src/`, including one
  handed to `page.evaluate`; in the page its counters do not exist and it
  throws `ReferenceError: cov_… is not defined`. A test run alone without
  coverage passes, so the break shows only in the full run. `useTokens` sets
  `data-theme` with a string expression for this reason.
- **Tests never touch the network, nor a real brand's values.** `useTokens`
  loads the committed ss-design-system copy in `test/tokens/design-system/`
  (structure; refresh with `npm run tokens:sync`, never by hand), then the
  generic `test/brands/test-base/`, which overrides every brand-level value.
  Expected colors in tests are test-base's. See `test/brands/README.md`.
- **`setContent` declares no charset.** Non-ASCII in test markup arrives
  mis-decoded; write it as an HTML entity.
- **Measure the box the reader sees, not the host.** A component's host is a
  wrapper; what is drawn is inside its shadow root. The toast test measured the
  `ss-toast` host — right size, right corner — and passed while the alert
  inside ran 36px past it and off the screen. Assert on the rendered element
  when the claim is about layout.
- **An e2e page is not always the visible tab.** Under the full suite a test's
  page was measured starting hidden and flipping between hidden and visible
  about every half second for the whole test; run alone, it stays visible.
  Anything that honours `document.visibilityState` sees that. `ss-toast` holds
  its clock while the page is hidden, which made its hover and focus tests fail
  most full runs while passing alone. Its e2e pins visibility (`pinVisible`)
  and tests the hidden pause with events it sends itself. The same page also
  lacks window focus (`document.hasFocus()` measured false): `focus()` still
  moves `activeElement`, so tests asserting on that pass, but no `focusin` or
  `focusout` fires, so a component listening for them hears nothing. Call
  `emulateFocus(page)` from `src/test/utils.ts` in any test that depends on
  those events.
- **Jest does not type-check e2e files; the build does.** `E2EPage` has no
  `viewport()` and `E2EElement` no `hasAttribute()` in Stencil's types, though
  both exist at runtime — so a test that uses them passes `npm test` and then
  fails `npm run build`. Read the viewport with `page.evaluate`, test an
  attribute with `getAttribute(...) !== null`, and run `npm run lint` before
  committing.
- **An e2e page has no design tokens.** Every length in the stylesheets is a
  `--ss-*` variable, and the page loads the components but not the tokens, so
  `inset`, `max-width` and `padding` all resolve to nothing. A layout assertion
  made that way passes or fails on a page nobody will see — the modal's
  centring transform was itself invalid without tokens, so the damage it did to
  fixed descendants never showed. Call `useTokens(page)` before measuring.
- **`axNodeByRole` takes the first node with the role.** On a page with several
  buttons that is whichever comes first, not the one under test. Use
  `axNodeNamed` to pick by accessible name.
