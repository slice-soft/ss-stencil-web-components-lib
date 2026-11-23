# Librería sobre tokens reales — base y ola 1 — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** la librería se prueba y se muestra con los tokens publicados de `ss-design-system` (CDN, versión fija) más dos marcas de prueba, y los controles de la ola 1 (`ss-button`, `ss-input`, `ss-textarea`, `ss-select`, `ss-combobox`) leen solo sus propios tokens de componente.

**Architecture:** Una versión fija del design system en `test/tokens.config.json`. Las e2e y el playground cargan `_variables.css` / `_dark.css` desde `https://cdn.slicesoft.dev/design-system/ss-design-system-v<ver>/css/` (las e2e a través de una caché en disco). Las marcas de prueba son CSS de override con el mismo nombre de archivo que el CDN, en `test/brands/<marca>/`, y se cargan encima de slicesoft. Un script de lint de capas marca cualquier `var(--ss-*)` que un componente migrado no deba leer. La ola 1 se hace en pareja: primero los `tokens/components/*.json` en el design system (PR, release), luego subir la versión fija y migrar el SCSS.

**Tech Stack:** Stencil 4.32, Sass, Jest + Puppeteer (e2e de Stencil), Node 22; Style Dictionary 5 en `ss-design-system`.

**Spec:** `ss-design-system/docs/superpowers/specs/2026-11-23-token-driven-components-design.md` (pasos 4 y 5). Cambios decididos después del spec, que este plan aplica:

- `ss-design-system` es privado y no se publica en npm; solo sale al CDN. La librería **referencia el CDN** con una versión fija, no depende del paquete (decisión del usuario, 2026-11-23).
- Las marcas de cliente no van en el design system. La librería tiene **marcas de prueba** en `test/brands/`, que no son clientes reales (decisión del usuario, 2026-11-23).
- El dark se activa solo con `data-theme` en `<html>` (v2.7.0, `docs/web.md`).

## Global Constraints

- Una sola fuente de la versión: `test/tokens.config.json` → `{ "designSystem": "2.7.0" }`. Todo lo demás (e2e, playground, tests) la lee de ahí o se verifica contra ella.
- URL del CDN: `https://cdn.slicesoft.dev/design-system/ss-design-system-v${version}/css/${file}` con `file` ∈ `_variables.css`, `_dark.css`.
- Una marca de prueba solo declara variables que existen en el CSS fijado de slicesoft. Nunca declara `--ss-<componente>-*`: solo `--ss-color-*`, `--ss-brand-*`, `--ss-division-*`, `--ss-shape-*` y `--ss-control-*`, que son las capas que el design system deja cambiar a una marca.
- **Regla de capas (estricta, decisión del usuario 2026-11-23):** el SCSS de un componente migrado solo lee `--ss-<tag sin "ss-">-*` (excepción: `ss-typography` → `--ss-typography-component-*`) y variables privadas `--_*` / `--atom-*`. Ningún otro `--ss-*`: ni primitivos, ni semánticos (`--ss-color-*`), ni z-index o motion. Los colores de cada variante también son tokens del componente (`button.primary.background`, `button.primary.foreground`, `button.primary.text`, …). Las palabras clave de CSS que no son decisiones de diseño (`100%`, `0`, `transparent`, `currentColor`, `inherit`, `solid`, ángulos de `rotate`) se escriben literales en el SCSS, no como token. *Decisión del planificador*, revisable en el PR.
- **Nombres de tokens de componente** en el design system: `<componente>.<propiedad>`, `<componente>.size.<xs..3xl>.<propiedad>`, `<componente>.<estado>.<propiedad>` (`hover`, `focus`, `disabled`). La variable CSS sale de la ruta: `button.size.md.padding-x` → `--ss-button-size-md-padding-x`. Los tokens existentes (`button.padding-x`, `input.border-radius`, …) no se renombran.
- Un token de componente referencia un rol de `system` o un color semántico, nunca un primitivo (lo verifica `test/layers.test.mjs` del design system). Si no hay rol con el valor exacto, se agrega uno con nombre de propósito en `tokens/system/control.json`.
- Migrar no cambia nada a la vista con slicesoft: el estilo computado de cada componente antes y después es idéntico (lo prueba el snapshot de la Tarea 4). La única excepción son los arreglos de contraste de la Tarea 6, cada uno con su test.
- Texto que usa un color de estado o el primario sobre el fondo de la página (outline, ghost, link, texto de error) lee `--ss-color-<rol>-text`, no el relleno.
- Ramas: `feat/tokens-foundation` (Tareas 1–3) y `feat/tokens-wave-1` (Tareas 4–6) en la librería; `feat/component-tokens-wave-1` en el design system (Tarea 5). Cada una sale de `main` y se cierra con un PR squash en Conventional Commits. Al mergear, se borra la rama.
- El lint (`npm run lint`) y los tests (`npm test`) quedan en verde en cada PR.

## Review Focus

1. **Sin red.** Una e2e corre sin red y sin caché, por ejemplo en un CI frío o con el CDN caído. Debe fallar con un mensaje que nombre la URL, no con "App did not load" ni con layouts en cero → test en la Tarea 1.
2. **Override con nombre inexistente.** Una marca de prueba declara una variable que el design system no tiene, por un typo o porque la renombró una versión nueva. Hoy esa variable se ignoraría en silencio → test en la Tarea 2.
3. **Versión duplicada.** La versión fija vive también en `src/index.html`, que es HTML estático. Si diverge de `tokens.config.json`, el playground muestra otra cosa que los tests → test en la Tarea 2.
4. **Snapshot vacío.** Un snapshot de estilos tomado sin tokens cargados compara valores vacíos y pasa siempre → la Tarea 4 lo valida.
5. **Dark en contenedores.** Un componente dentro de un contenedor con `data-theme="dark"` (no en `<html>`) no cambia de tema. Es un límite conocido, no un bug: se documenta, no se testea.

---

### Task 1: Tokens de slicesoft desde el CDN fijado

**Files:**
- Create: `test/tokens.config.json`, `src/test/tokens.ts`
- Modify: `src/test/utils.ts` (`useTokens`)
- Modify: `.gitignore` (`/.cache/`)
- Commit, sin cambios: `docs/component-library-audit-2026-11-21.md` y `docs/status.md`, que están modificados sin commitear en `main` desde la auditoría
- Test: `src/test/tokens.spec.ts`

**Interfaces:**
- Produces: `src/test/tokens.ts`
  - `export const DESIGN_SYSTEM_VERSION: string` (leído de `test/tokens.config.json`).
  - `export function cdnUrl(file: '_variables.css' | '_dark.css', version = DESIGN_SYSTEM_VERSION): string`.
  - `export async function slicesoftCss(file: '_variables.css' | '_dark.css'): Promise<string>`. Lee `.cache/design-system/<version>/<file>` si existe; si no, hace `fetch(cdnUrl(file))`, exige `200`, escribe la caché y devuelve el texto. Cualquier fallo lanza `Error` con el texto `Design tokens v<ver> unavailable: <url>`, más el motivo.
- Produces: `useTokens(page: E2EPage, brand: TestBrand = 'slicesoft', theme: 'light' | 'dark' = 'light'): Promise<void>` en `src/test/utils.ts`. Inyecta slicesoft `_variables.css` + `_dark.css`, después los overrides de la marca (Tarea 2; en esta tarea, `TestBrand = 'slicesoft'`), después `NO_TRANSITIONS`, y pone `data-theme` en `<html>`.

- [ ] **Step 1: Test que falla** (`src/test/tokens.spec.ts`)

```ts
it('builds the pinned CDN url', () => {
  expect(cdnUrl('_dark.css', '2.7.0')).toBe('https://cdn.slicesoft.dev/design-system/ss-design-system-v2.7.0/css/_dark.css');
});
it('pins a released version', () => {
  expect(DESIGN_SYSTEM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
});
it('names the url when the tokens cannot be fetched', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
  await expect(slicesoftCss('_variables.css', /* sin caché: dir temporal */)).rejects.toThrow(/Design tokens v.* unavailable: https:\/\/cdn\.slicesoft\.dev/);
});
```

Para el tercer caso, `slicesoftCss` acepta un segundo parámetro opcional, `cacheDir = '.cache/design-system'`, y el test le pasa un directorio temporal vacío.

- [ ] **Step 2:** `npx stencil test --spec -- src/test/tokens.spec.ts` → FAIL, porque `tokens.ts` no existe.
- [ ] **Step 3: Implementar** `tokens.ts` y el nuevo `useTokens`. Las e2e que hoy llaman a `useTokens(page)` siguen compilando sin cambios.
- [ ] **Step 4:** `npm test` completo. Hoy las e2e cargan Neon Purple (radios de 0–8px, violeta) y pasan a slicesoft. Toda aserción que fallaba por un valor del token set viejo se corrige al valor de slicesoft, y cada una queda listada en el ledger. Si falla una aserción que no depende de tokens, es un bug: no se toca la aserción.
- [ ] **Step 5: Commit** — `test: load design tokens from the pinned CDN release`.

---

### Task 2: Marcas de prueba y playground

**Files:**
- Create: `test/brands/neon-purple/_variables.css`, `test/brands/neon-purple/_dark.css`, `test/brands/organic-emerald/_variables.css`, `test/brands/organic-emerald/_dark.css`, `test/brands/README.md`
- Delete: `test/token-set-01/`, `test/token-set-02/`
- Modify: `stencil.config.ts` (copy de `www`), `src/index.html` (selector de marca), `src/test/tokens.ts`, `src/test/utils.ts`
- Test: `src/test/brands.spec.ts`, `src/test/brand-contrast.e2e.ts`

**Interfaces:**
- Consumes: `slicesoftCss`, `DESIGN_SYSTEM_VERSION`, `cdnUrl` (Tarea 1).
- Produces: `export type TestBrand = 'slicesoft' | 'neon-purple' | 'organic-emerald'` y `export const TEST_BRANDS: TestBrand[]` en `src/test/tokens.ts`; `export function brandOverrides(brand: TestBrand, file: '_variables.css' | '_dark.css'): string` (`''` para slicesoft).

Contenido de las marcas, que son solo overrides:
- Los valores salen de la historia de `ss-design-system`: `git show bad27fa:brands/<marca>/{brand,light,dark}.json`. Esos JSON ya tienen el contraste corregido, y su `README.md` en el mismo commit lista cada cambio.
- Cada token se escribe como declaración CSS con valor hex resuelto. `_variables.css` va bajo `:root`, con `brand.*`, `division.*`, `color.*` de light, y `shape.radius.control` / `surface`. `_dark.css` va bajo `[data-theme="dark"]`, con `color.*` de dark.
- Un comentario de cabecera dice: "Test brand, not a client. Overrides on top of ss-design-system v<ver>."
- Además, como override de sistema, `--ss-control-size-*-radius`, para que los controles muestren el radio de la marca. neon-purple: todos `2px`. organic-emerald: xs/sm `8px`, md `20px`, lg+ `24px`. *Decisión del planificador:* sin esto, el radio de los controles con tamaño no cambia entre marcas (`control.size.*.radius` referencia `radius.*` y no `shape.radius.control`).

- [ ] **Step 1: Tests que fallan**

`src/test/brands.spec.ts`:
- `every override names a variable the pinned design system declares`: para cada marca y archivo, cada `--ss-*` declarado aparece en `slicesoftCss` del mismo archivo, o en `_variables.css` en el caso de `_dark.css`.
- `overrides only brand-level layers`: ningún nombre empieza por un prefijo de componente (la lista sale de `src/components/**/ss-*.tsx`).
- `index.html pins the same version`: `src/index.html` contiene `ss-design-system-v${DESIGN_SYSTEM_VERSION}/css/` y no contiene otra versión.

`src/test/brand-contrast.e2e.ts`: para cada marca × tema, un `ss-button` sólido de cada variante (`primary`, `secondary`, `tertiary`, `success`, `warning`, `info`, `error`, `destructive`) tiene un contraste ≥ 4.5 entre el `color` y el `background-color` computados en su shadow root. La razón de contraste se calcula en el test con la fórmula WCAG (la misma que `ss-design-system/build/contrast.mjs`, copiada en `src/test/contrast.ts`, que acepta `rgb()`).

- [ ] **Step 2:** correr los dos → FAIL (marcas inexistentes).
- [ ] **Step 3: Implementar.**
  - Crear las marcas, `TEST_BRANDS` y `brandOverrides`.
  - `useTokens` agrega los overrides de la marca.
  - En `stencil.config.ts`, el `copy` de `www` pasa de `token-set-0N` a `{ src: '../test/brands', dest: 'test-brands' }`.
  - En `src/index.html`, dos `<link>`: `#ds-link`, siempre al CDN fijado (`_variables.css` y otro para `_dark.css`), y `#brand-link`, vacío para slicesoft o `/test-brands/<marca>/_variables.css` + `_dark.css`. El selector lista `SliceSoft (v<ver>)`, `Neon Purple (test)` y `Organic Emerald (test)`. La clave guardada en `localStorage` cambia de `ss-token-set` a `ss-test-brand`; un valor viejo cae a slicesoft.
  - Borrar `test/token-set-01` y `test/token-set-02`.
- [ ] **Step 4:** `npm test` → PASS. `npm start` y verificar a mano en el navegador que las tres marcas y los dos temas cambian el catálogo.
  - Si el contraste falla en algún botón, primero se mira el SCSS. `btn-variant` usa el relleno como color de texto en outline y ghost; eso es la Tarea 6, y acá solo se miden botones sólidos.
  - Un sólido que falla es un bug de marca: se corrige el override y se anota en `test/brands/README.md`.
- [ ] **Step 5: Commit** — `test: replace hand-copied token sets with test brands over the CDN`.

---

### Task 3: Lint de capas en modo aviso

**Files:**
- Create: `scripts/check-token-layers.mjs`, `scripts/token-layers.config.json`
- Modify: `package.json` (`"lint"` agrega `&& node scripts/check-token-layers.mjs`)
- Test: `scripts/check-token-layers.test.mjs` (`node --test`; agregar `"test:scripts": "node --test scripts/"` y llamarlo desde `npm run lint`)

**Interfaces:**
- Produces: `scripts/token-layers.config.json` → `{ "migrated": [] }`. Lista de tags; cada ola agrega los suyos.
- Produces: `export function violations(scss: string, tag: string): { line: number, variable: string }[]`. Aplica la regla de capas estricta de Global Constraints.
- Produces: la CLI recorre `src/components/**/ss-*.scss`. Las violaciones de un tag en `migrated` hacen salir con código 1; las demás se cuentan y se imprimen como resumen (`ss-alert: 12 primitive references (not migrated)`), con código 0.

- [ ] **Step 1: Tests que fallan.** `violations` acepta `var(--ss-button-gap)` y `var(--_pad-x)` en `ss-button`. Rechaza `var(--ss-color-primary-text)`, `var(--ss-sizing-full)`, `var(--ss-z-index-tooltip)`, `var(--ss-dimensions-4)`, `var(--ss-radius-base)`, `var(--ss-input-border)` dentro de `ss-button` y `var(--ss-text-sizes-sm)`. En `ss-typography` acepta `var(--ss-typography-component-color-muted)`. La CLI sale con 1 si un tag migrado tiene una violación (fixture en un directorio temporal).
- [ ] **Step 2:** `node --test scripts/` → FAIL.
- [ ] **Step 3: Implementar.**
- [ ] **Step 4:** `npm run lint` → PASS, con el resumen de los 42 componentes sin migrar.
- [ ] **Step 5: Commit** — `build: add token layer lint in warning mode`. Abrir el PR de `feat/tokens-foundation` (Tareas 1–3): `test: run the library against the published design tokens`.

---

### Task 4: Snapshot de estilos de la ola 1 (antes de migrar)

**Files:**
- Create: `src/test/style-snapshot.ts`, `src/test/wave-1.styles.e2e.ts`, `src/test/__snapshots__/` (lo genera jest)

**Interfaces:**
- Produces: `export async function computedStyles(page: E2EPage, selector: string, props: string[]): Promise<Record<string, string>>`. Entra en el shadow root si el host tiene uno y lee `getComputedStyle` del elemento interno principal: `button` en `ss-button`; `input`, `textarea` o `select` en los controles.
- Produces: para cada componente de la ola 1, cada tamaño `xs..3xl`, cada variante que acepta y los estados `default`, `:hover` (forzado con `page.hover`), `:focus-visible` (teclado) y `disabled`, en slicesoft light y dark. Se miden `padding-*`, `font-size`, `font-family`, `border-*-width`, `border-*-radius`, `border-*-color`, `color`, `background-color`, `gap`, `box-shadow`, `outline-*` y `height`. El resultado va a `toMatchSnapshot()`.

- [ ] **Step 1: Escribir el test y generar el snapshot sobre `main`** (sin migrar) → `npx stencil test --e2e -- src/test/wave-1.styles.e2e.ts`. Revisar el snapshot: ningún valor puede ser `''`, `0px` en todos los paddings o `rgba(0, 0, 0, 0)` en todos los fondos. Un snapshot así se tomó sin tokens y no sirve. Agregar una aserción que lo garantice: `padding-left` de `ss-button` md > 0.
- [ ] **Step 2: Commit** — `test: snapshot computed styles of the wave 1 controls`.

---

### Task 5: Tokens de componente de la ola 1 (en `ss-design-system`)

**Repo:** `ss-design-system`, rama `feat/component-tokens-wave-1`.

**Files:**
- Modify: `tokens/components/button.json`, `tokens/components/input.json`
- Create: `tokens/components/textarea.json`, `tokens/components/select.json`, `tokens/components/combobox.json`
- Modify, si hace falta: `tokens/system/control.json` (roles con nombre de propósito)
- Test: `test/build.test.mjs` (ninguna variable de la v2.7.0 cambia de valor), `test/layers.test.mjs` (ya existe: componentes → system/semantic)

**Interfaces:**
- Produces, consumido por la Tarea 6: para cada componente de la ola 1, un token por cada valor de diseño que hoy lee su SCSS (incluido lo que aportan los mixins `atom-control-base`, `atom-control-sizes`, `btn-variant`, `input-variant` y `focus-ring`), con los nombres de Global Constraints. Como mínimo:
  - `<c>.size.<xs..3xl>.{padding-x,padding-y,font-size,radius,gap}`, con valores de `$sizes` (button) o `$atom-control-sizes` (resto);
  - `<c>.border-width`, `<c>.font-family`;
  - `<c>.focus.ring-width`, `<c>.focus.ring-offset`, `<c>.focus.ring-opacity`;
  - `<c>.disabled.opacity`;
  - `<c>.transition-duration`;
  - en button, además: `button.hover.brightness`, `button.active.scale`, `button.outline.hover-opacity`, `button.icon-only.size`;
  - en controles con placeholder: `<c>.placeholder.color` → `{color.muted-foreground}`;
  - colores: `<c>.<variante>.{background,foreground,border,text,ring}` por cada variante que acepta el componente, y los colores base (`<c>.background`, `<c>.foreground`, `<c>.border`, `<c>.disabled.background`, …);
  - capas: `<c>.z-index` donde aplique.
- Cada token referencia el rol de sistema o el color semántico con el **mismo valor resuelto** que lee hoy el SCSS.

- [ ] **Step 1: Test que falla.** En `test/component-tokens.test.mjs`, para cada componente de la ola 1, existen todos los tokens listados como "mínimo" para los 7 tamaños. Correr → FAIL.
- [ ] **Step 2: Escribir los JSON.** Los valores se sacan del SCSS de la librería en `main`.
- [ ] **Step 3:** `npm test && npm run lint` → PASS. En particular, el test de v2.7.0 confirma que ninguna variable existente cambió.
- [ ] **Step 4: Commit y PR** — `feat(tokens): add component tokens for the wave 1 controls`. Esperar el merge del usuario y la release de release-please (2.8.0). Verificar `curl -sf https://cdn.slicesoft.dev/design-system/ss-design-system-v2.8.0/css/_variables.css | grep -c -- '--ss-button-size-md-padding-x'` → `1`. Borrar la rama.

---

### Task 6: Migrar la ola 1

**Repo:** librería, rama `feat/tokens-wave-1`.

**Files:**
- Modify: `test/tokens.config.json` (`2.8.0`), `src/index.html` (URL), `scripts/token-layers.config.json` (`migrated`: `ss-button`, `ss-input`, `ss-textarea`, `ss-select`, `ss-combobox`)
- Modify: `src/components/atoms/{ss-button,ss-input,ss-textarea,ss-select,ss-combobox}/*.scss`, `src/global/styles/_mixins.scss`
- Test: `src/test/wave-1.styles.e2e.ts` (snapshot de la Tarea 4), `scripts/check-token-layers.mjs`, `src/test/brand-contrast.e2e.ts`

**Interfaces:**
- Consumes: los tokens de la Tarea 5 (v2.8.0); `violations` (Tarea 3); el snapshot (Tarea 4).
- Produces:
  - Los mapas `$sizes` (button) y `$atom-control-sizes` desaparecen.
  - `atom-control-sizes($block)` pasa a `atom-control-sizes($block, $component)`: cada `.#{$block}--#{$size}` asigna `--_pad-x: var(--ss-#{$component}-size-#{$size}-padding-x)` y equivalentes, y la regla base usa `var(--_pad-x)`.
  - `btn-variant` e `input-variant` reciben también el nombre del componente, para leer sus tokens de estado.

- [ ] **Step 1: Subir la versión** a 2.8.0 y agregar los 5 tags a `migrated`. `npm run lint` → FAIL: el lint de capas lista las violaciones de los 5 componentes.
- [ ] **Step 2: Migrar el SCSS** de los 5 componentes y los mixins que usan, hasta que `npm run lint` pase. Después de cada componente, correr su snapshot: `npx stencil test --e2e -- src/test/wave-1.styles.e2e.ts -t <componente>` → PASS sin actualizar el snapshot.
- [ ] **Step 3: Contraste de texto (el cambio visual permitido).** Agregar a `brand-contrast.e2e.ts` botones `outline` y `ghost` de cada variante. Su texto sobre el fondo de la página debe tener ≥ 4.5 → FAIL en dark (orange-700 sobre #0b0f14 = 3.71). En `btn-variant`, el `color` de outline/ghost pasa a `var(--ss-color-#{$name}-text, var(--ss-color-#{$name}))`. El fallback cubre `secondary`/`quaternary`, que no tienen `-text`. → PASS. Actualizar el snapshot **solo** en esas entradas (outline/ghost `color`, `border-color` si lo sigue, en dark) y listar cada valor cambiado en el ledger.
- [ ] **Step 4: Prueba de desacople** (`src/test/wave-1.tokens.e2e.ts`):
  - Con slicesoft cargado, inyectar `:root { --ss-button-size-md-padding-x: 40px }`. El `padding-left` del botón md pasa a `40px` y el de `ss-input` md no cambia.
  - Inyectar `:root { --ss-shape-radius-control: 3px }`. El radio de `ss-button` (`rounded`, md) pasa a `3px`, igual que el de `ss-input` md.
  - Correr → PASS. Si la segunda falla porque el radio por tamaño no sigue a `shape.radius.control`, registrarlo en el ledger y no hacer más: es el pendiente que hereda el spec, y se decide con el usuario.
- [ ] **Step 5:** `npm test && npm run lint` → PASS. Actualizar `docs/status.md`: la ola 1 está hecha, los componentes migrados son los 5 de la lista, y el siguiente paso es la ola 2 (checkbox, radio, switch, slider, label). Actualizar `docs/conventions.md` con la regla de capas y cómo se migra un componente.
- [ ] **Step 6: Commit y PR** — `feat(atoms): read wave 1 controls from component tokens`.

## Fuera de este plan

- Olas 2–4 (resto de átomos, moléculas, organismos): un plan por ola, con el mismo patrón que las Tareas 4–6.
- Que `control.size.*.radius` siga a `shape.radius.control` en el design system: se decide con el resultado del Step 4 de la Tarea 6.
- Dark por contenedor: límite documentado.
- Versionar el formato de los JSON de marca (por ejemplo `$schema` / JSON Schema con versión) para la herramienta generadora: idea del usuario, para después.
- Mejorar los componentes más allá de los tokens ("están muy sencillos"): el usuario lo quiere antes del pulido del playground; se diseña aparte.
