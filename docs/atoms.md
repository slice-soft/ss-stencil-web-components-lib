# Atoms Layer

This library keeps atoms as small, generic Web Components that map directly to the `test/token-set-01` CSS variable contract. Components should consume existing `--ss-*` semantic, typography, radius, dimension, transition, shadow, and component tokens before adding any component-specific styling hook.

## Atom inventory

| Atom            | Tag             | Responsibility                                                           |
| --------------- | --------------- | ------------------------------------------------------------------------ |
| `ss-avatar`     | `ss-avatar`     | Image or initials fallback with shape and size                           |
| `ss-badge`      | `ss-badge`      | Inline status label, dismissible                                         |
| `ss-button`     | `ss-button`     | Interactive trigger, all variants and states                             |
| `ss-checkbox`   | `ss-checkbox`   | Native checkbox with indeterminate support                               |
| `ss-combobox`   | `ss-combobox`   | Native text input with datalist-backed suggestions                       |
| `ss-divider`    | `ss-divider`    | Horizontal or vertical separator                                         |
| `ss-icon`       | `ss-icon`       | Size/color wrapper for SVG or icon-font glyphs                           |
| `ss-input`      | `ss-input`      | Native text input, all types                                             |
| `ss-label`      | `ss-label`      | Native `<label>` with `for` wiring and required marker                   |
| `ss-link`       | `ss-link`       | Anchor with variant, underline, and disabled state                       |
| `ss-radio`      | `ss-radio`      | Native radio button                                                      |
| `ss-select`     | `ss-select`     | Native select with style variants                                        |
| `ss-slider`     | `ss-slider`     | Native range input with optional value output                            |
| `ss-spinner`    | `ss-spinner`    | Loading indicator                                                        |
| `ss-switch`     | `ss-switch`     | Toggle switch (checkbox role)                                            |
| `ss-textarea`   | `ss-textarea`   | Native multiline input                                                   |
| `ss-tooltip`    | `ss-tooltip`    | Positioned tooltip with trigger slot                                     |
| `ss-typography` | `ss-typography` | All generic text rendering: paragraphs, headings, inline, code, captions |

### Typography consolidation

All text/typography rendering lives in `ss-typography`. Use its props rather than separate atoms:

- **Headings** — set `level="1"–"6"`. Renders the correct `h{n}` tag with display font, bold weight, tight line-height, and a size scaled to the level. All defaults are overridable via explicit props.
- **Paragraphs** — default (`as="p"`)
- **Inline / semantic text** — `as="span"`, `as="strong"`, `as="em"`, `as="small"`, `as="code"`
- **Monospace / code** — `as="code"` or `family="mono"`. `as="code"` selects mono automatically.
- **Muted / helper text** — `color="muted"`
- **Error text** — `color="error"`
- **Captions** — `as="small"` + `font-size="xs"` + `color="muted"`

`ss-label` is kept as a separate atom because it renders a native `<label>` element with `for` / `htmlFor` form association and a required marker — responsibilities that go beyond typography.

## Conventions

- Atoms live under `src/components/atoms/ss-*` and expose typed Stencil props with conservative defaults.
- Use slots for content that should remain caller-owned: text, icons, select options, tooltip triggers, and fallback avatar content.
- Emit `ss*` custom events only for component-level state changes or normalized value changes. Do not mirror every native DOM event unless preserving an existing public API.
- Keep components product-neutral. Atoms should not know about application routes, business entities, or feature-specific labels.
- Prefer native elements for accessibility and browser behavior: `a`, `button`, `input`, `label`, `select`, `textarea`, headings, and separators.
- Use `scoped` rendering when native light-DOM behavior matters, such as `ss-label`, `ss-select`, `ss-checkbox`, `ss-radio`, and `ss-switch`. Use `shadow` when encapsulation is more important and native cross-element behavior is not required.

## BEM Decision

BEM is useful here only inside component styles. The repo already uses classes such as `ss-button__label` and `ss-button--loading`, and that maps well to Stencil internals: block equals component tag, elements are internal parts, and modifiers are prop/state classes.

Do not make BEM part of the public consumer API beyond documented props and slots. Consumers should use `ss-button variant="primary"` rather than depending on `.ss-button--primary` selectors.
