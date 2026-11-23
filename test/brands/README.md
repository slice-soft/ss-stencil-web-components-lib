# Test brands

Brands the library is tested and demonstrated with. **They are not clients.**
Client brands are generated outside both repositories.

Each folder holds override files named like the ss-design-system CDN files:

- `_variables.css` — `:root` overrides
- `_dark.css` — `[data-theme="dark"]` overrides

They load **on top of** the committed ss-design-system copy in
`test/tokens/slicesoft/` (the release named in `test/tokens.config.json`). Whatever a test brand does not declare
falls back to slicesoft, so no variable is ever undefined.

Rules, checked by `src/test/brands.spec.ts`:

- Only brand-level layers: `--ss-color-*`, `--ss-brand-*`, `--ss-division-*`,
  `--ss-shape-*`, `--ss-control-*`. Never a component token.
- Only variables the pinned design system declares.

`src/test/brand-contrast.e2e.ts` checks solid buttons meet WCAG AA in every
brand and theme.

| Brand | Look | Source |
| --- | --- | --- |
| `neon-purple` | Violet, sharp corners (2px) | Example brand reviewed in ss-design-system PR #25, contrast-corrected |
| `organic-emerald` | Emerald, rounded corners (8/20/24px) | Same |

`--ss-control-size-*-radius` is overridden as well: the size-based control
radius does not follow `--ss-shape-radius-control` in the design system yet.
