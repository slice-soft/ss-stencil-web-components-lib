# Test brands

Brands the library is tested and demonstrated with. **None is a real brand,
none is a client.** Client brands are generated outside both repositories.

Load order, in tests (`useTokens`) and in the local playground:

1. `test/tokens/design-system/` — ss-design-system at the release named in
   `test/tokens.config.json`, for the structure (every variable, system roles,
   component tokens). Refreshed with `npm run tokens:sync`.
2. `test-base/` — a generic brand (blue primary, neutral grays) that replaces
   **every** brand-level value of that copy, so the design system's own brand
   never reaches a test.
3. `neon-purple/` or `organic-emerald/` — variations, overriding only what
   differs. Whatever they leave out falls back to test-base.

Each folder holds `_variables.css` (`:root` overrides) and `_dark.css`
(`[data-theme="dark"]` overrides), named like the design-system files.

Rules, checked by `src/test/brands.spec.ts`:

- Only brand-level layers: `--ss-color-*`, `--ss-brand-*`, `--ss-division-*`,
  `--ss-shape-*`, `--ss-control-*`. Never a component token.
- Only variables the pinned design system declares.
- test-base declares every brand-level variable the design-system copy has.

`src/test/brand-contrast.e2e.ts` checks solid buttons meet WCAG AA in every
brand and theme.

| Brand | Look | Source |
| --- | --- | --- |
| `neon-purple` | Violet, sharp corners (2px) | Example brand reviewed in ss-design-system PR #25, contrast-corrected |
| `organic-emerald` | Emerald, rounded corners (8/20/24px) | Same |

`--ss-control-size-*-radius` is overridden as well: the size-based control
radius does not follow `--ss-shape-radius-control` in the design system yet.
