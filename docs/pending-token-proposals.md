# Pending Token Proposals

`dist/css/_variables.css` in `ss-design-system` (built from `tokens/`) is the CSS variable contract for this atoms pass. The implementation avoids adding new `--ss-*` variables inline.

## Promoted — added to `ss-design-system`

| Token                                        | Added to                            | Rationale                                                                                                                                                  |
| -------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ss-typography-component-color-secondary`  | `tokens/components/typography.json` | `ss-typography` actively references this variable in its SCSS color map. Token resolves to `{color.secondary-foreground}`.                                 |
| `--ss-typography-component-color-tertiary`   | `tokens/components/typography.json` | `ss-typography` actively references this variable. Resolves to `{color.primary}` as placeholder until semantic tertiary colors are defined.                |
| `--ss-typography-component-color-quaternary` | `tokens/components/typography.json` | `ss-typography` actively references this variable. Resolves to `{color.secondary-foreground}` as placeholder until semantic quaternary colors are defined. |

## Still pending

| Proposed token                                                                 | Why deferred                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ss-color-tertiary`, `--ss-color-tertiary-foreground`                        | `Variant` type includes `tertiary` but no semantic tertiary color exists in token-set-01. Atoms fall back to primary. Deferred until brand defines a tertiary palette.                                                                                     |
| `--ss-color-quaternary`, `--ss-color-quaternary-foreground`                    | Same as tertiary. Atoms fall back to secondary. Deferred until brand defines a quaternary palette.                                                                                                                                                         |
| `--ss-border-width-thin`, `--ss-border-width-base`, `--ss-border-width-strong` | Controls, badges, dividers, avatars, and spinners use the literal value `2px`. These tokens are not yet referenced by any CSS variable lookup, so promoting them now would add unused tokens. Promote alongside an atoms-SCSS pass that replaces literals. |
| `--ss-z-index-tooltip`                                                         | `ss-tooltip` intentionally omits `z-index` to avoid inventing stacking values. Promote only after agreeing on a layering scale.                                                                                                                            |
| `--ss-control-height-xs` through `--ss-control-height-xl`                      | Control heights are implicit (derived from padding + line-height in `$atom-control-sizes`). No component references an explicit height token. Promote when a design spec formalises fixed control heights.                                                 |
