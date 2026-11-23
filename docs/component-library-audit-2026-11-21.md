# Auditoría: librería de componentes reusables (2026-11-21)

Análisis de `ss-design-system` (v2.6.0) y `ss-stencil-web-components-lib` (v0.2.5)
contra seis criterios de una librería de componentes: tokens, accesibilidad,
composición, documentación interactiva, rendimiento/tree-shaking y responsive.

Nada se modificó en código al hacer este análisis. Es el punto de partida para
retomar el trabajo.

## Hallazgo principal: la paleta oficial no pasa WCAG AA

El análisis de contraste de `docs/status.md` se hizo con los token sets de prueba
(Neon Purple, Organic Emerald), no con `ss-design-system`. Esos fixtures copian
la estructura del design system, no sus valores. Medido sobre los tokens reales:

| Par (light)                                   | Ratio    | Mínimo WCAG        |
| --------------------------------------------- | -------- | ------------------ |
| `primary` #f97316 / white (botón primario)    | **2.80** | 4.5 texto, 3.0 UI  |
| `primary-hover` #ea580c / white               | 3.56     | 4.5                |
| `ring` #f97316 / background (foco)            | **2.80** | 3.0 (SC 1.4.11)    |
| `warning` #f59e0b / white                     | **2.15** | 4.5                |
| `success` #22c55e / white                     | **2.28** | 4.5                |
| `info` #3b82f6 / white                        | 3.68     | 4.5                |
| `error` #ef4444 / white                       | 3.76     | 4.5                |
| `muted-foreground` #64748b / `muted` #f1f5f9  | 4.34     | 4.5                |
| `muted-foreground` #64748b / background       | 4.76     | 4.5 (pasa)         |
| `border` #e2e8f0 / background                 | 1.23     | 3.0 si delimita un control |

Dark: texto blanco sobre el naranja #F97316 da 2.80 (falla); `error` / white da
3.76 (falla). El naranja como texto sobre #0B0F14 da 6.86, y `muted-foreground`
sobre el fondo da 7.57 (pasan). `border` / background da 1.44.

## Estado por criterio

### 1. Design tokens: bien, con huecos

- Unos 320 tokens en tres capas: primitivos, semánticos (light/dark) y de
  componente. Se generan para CSS, SCSS, JS, React Native, Android, Compose e iOS.
- La lib consume 158 variables `--ss-*`. Todas existen en
  `ss-design-system/dist/css`.
- Faltan tokens de breakpoints (no hay ninguno).
- Faltan anchos de overlay: hoy son `calc(var(--ss-dimensions-32) * n)`
  (ver `docs/pending-token-proposals.md`).
- Faltan alturas de control y tokens de motion para reduced-motion.
- `tokens/semantic/dark.json` escribe hex a mano en vez de referenciar
  primitivos. Además mezcla dos grises: `#111827`, `#1F2937` y `#9CA3AF` son
  grises de Tailwind, mientras `colors.gray` es la escala slate. `brand.json`
  tiene el mismo problema.
- El dark mode sólo se activa con `[data-theme="dark"]` (`config.dark.json`).
  No hay fallback con `prefers-color-scheme`.
- Sólo `button`, `input` y `typography` tienen tokens de componente. Los otros
  39 componentes usan los semánticos directamente.

### 2. Accesibilidad: buena en comportamiento, mala en color

Funciona:

- Teclado y ARIA según WAI-ARIA en menú, tabs, accordion y modal, con focus
  trap y pila de dismiss.
- `formAssociated` y ARIA entre shadow roots (`utils/a11y`).
- `:focus-visible` en 16 componentes.

Falla:

- Contraste (tabla de arriba).
- `prefers-reduced-motion` sólo en 2 de los 10 estilos que animan
  (`ss-spinner`, `ss-button`).
- Cero soporte de `forced-colors` (alto contraste de Windows).
- Falta la verificación con lector de pantalla (pendiente en `docs/status.md`).

### 3. Composición: bien

- 42 componentes: 18 átomos, 11 moléculas, 13 organismos. Contrato `join`;
  estados disabled, loading, expanded.
- Deudas ya registradas en `docs/status.md`:
  - `variant` (3 átomos) contra `color` (8 átomos) para la misma idea.
    Unificar rompe la API.
  - No hay `::part`.
  - Los componentes `scoped` (26) no proyectan hijos agregados después del
    montaje, el caso típico en React o Vue. `extras.experimentalSlotFixes` es
    el candidato, con corrida completa de la suite.
  - `ss-table` sólo tiene celdas de texto.

### 4. Documentación interactiva: le falta mucho

- Existe: readme por componente (`docs-readme`), `vscode-data.json`, playground
  `www` con 36 ejemplos.
- No existe: Storybook o equivalente publicado, guías de "qué hacer / qué no",
  especificaciones de diseño (sólo de API).

### 5. Rendimiento y tree-shaking: casi

- `dist-custom-elements` genera un archivo por componente; el lazy loader del
  CDN carga sólo lo que se usa.
- Falta un export limpio `./components/*` en `package.json`: hoy el import
  directo pasa por `./dist/*`.
- Falta el campo `sideEffects`. No puede ser `false`, porque
  `auto-define-custom-elements` registra elementos al importar: tiene que listar
  esos archivos.
- No hay wrappers React/Angular/Vue (comentados en `stencil.config.ts`).

### 6. Responsive: débil

- Desde el PR #50 los controles caben en 320px.
- Cero `@media` de layout, cero `@container`, cero tokens de breakpoint.
- Alineación sólo LTR: nada lee `dir`.

## Fallas de proceso

- Los token sets de prueba (`test/token-set-0*/tokens.css`) se sincronizan a mano.
- La lib no depende de `@slice-soft/ss-design-system`, así que puede divergir de
  los tokens reales sin que nada avise.
- Ningún e2e corre contra los tokens oficiales. Por eso el 2.80 nunca apareció.

## Prioridades sugeridas

1. **Contraste en `ss-design-system`.**
   - `primary` como fondo a orange-600 o orange-700 (#c2410c da ~5.2 con blanco).
   - Texto oscuro sobre `warning` y `success`.
   - Revisar `ring` y `muted-foreground`.
   - Test de contraste en `ss-design-system/test` que falle el build.
2. **La lib contra los tokens reales**: un tercer token set generado desde
   `dist/css` (no copiado a mano), con su e2e de contraste.
3. **Tokens nuevos**: breakpoints, anchos de overlay, motion. Pasar `dark.json`
   a referencias. Fallback `prefers-color-scheme`.
4. **A11y de estilos**: reduced-motion en los 8 estilos que faltan;
   `forced-colors`.
5. **Distribución**: export `./components/*`, `sideEffects`, wrappers por
   framework.
6. **Documentación interactiva**: Storybook o el playground publicado, con guías
   de qué hacer y qué no.
7. **Breaking changes en una sola major**: `variant`/`color`, payload del click
   de `ss-button`, `::part`.

## Decisión pendiente del usuario

Antes de empezar el punto 1: ¿el primario puede cambiar de tono? Es identidad de
marca, no una decisión técnica.
