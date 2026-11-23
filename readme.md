# ss-stencil-web-components-lib

Libreria de Web Components reutilizables desarrollados con StencilJS para SliceSoft.

## Uso

Los componentes consumen tokens CSS de `@slice-soft/ss-design-system` **2.8.0 o
superior**: cada componente migrado lee solo sus propios tokens
(`--ss-<componente>-*`), que existen desde esa versión. Con una versión anterior
esos componentes se ven sin estilo. Carga `_variables.css` antes de usar la
librería y `_dark.css` después si necesitas modo oscuro; el tema se cambia
con `data-theme="dark"` (o `"light"`) en `<html>` o en cualquier contenedor.

```html
<link rel="stylesheet" href="https://cdn.slicesoft.dev/design-system/ss-design-system-v2.8.0/css/_variables.css">
<link rel="stylesheet" href="https://cdn.slicesoft.dev/design-system/ss-design-system-v2.8.0/css/_dark.css">
```

La versión con la que se prueba la librería está en `test/tokens.config.json`.
Los tests no usan la red ni los valores de ninguna marca real: leen una copia
versionada de ss-design-system en `test/tokens/design-system/` (la estructura),
que se actualiza con `npm run tokens:sync` (desde el CDN, o con
`-- --from <ruta>/dist/css` desde un build local), y encima la marca genérica de
pruebas `test/brands/test-base/`.

```bash
npm install @slice-soft/ss-stencil-web-components-lib
```

```ts
import { defineCustomElements } from '@slice-soft/ss-stencil-web-components-lib/loader';

defineCustomElements();
```

## Desarrollo local

```bash
git clone https://github.com/slice-soft/ss-stencil-web-components-lib.git
cd ss-stencil-web-components-lib
npm install
npm start
```

`src/index.html` es una página vacía que solo carga los tokens y la librería. El
playground es local y no se versiona: si existe `src/playground.html` (ignorado
por git), `npm start` lo sirve en su lugar. Incluye búsqueda, enlaces directos a
los ejemplos y controles de tema y marca de prueba; toma la versión de los tokens
de `test/tokens.config.json`. La última versión versionada está en el historial
(`git show 6268ae5:src/index.html`). Si trabajas por SSH, inicia el servidor en el host remoto y abre
un túnel desde tu equipo:

```bash
# Host remoto
npm start -- --address 127.0.0.1 --port 3434 --no-open

# Equipo local
ssh -N -L 3434:127.0.0.1:3434 usuario@host
```

Abre `http://127.0.0.1:3434` en tu navegador.

## Scripts

```bash
npm run build
npm test
npm run lint
```

## Documentacion

| Archivo | Que contiene |
| --------- | -------------- |
| `docs/status.md` | Que existe hoy, que sigue y que esta bloqueado. Se actualiza en cada iteracion |
| `docs/conventions.md` | Reglas propias de este repo y las trampas detras de cada una |
| `docs/atoms.md` | Inventario de atomos y la regla de encapsulacion |
| `docs/distribution.md` | Consumo desde HTML, React, Angular y Vue |
| `docs/pending-token-proposals.md` | Tokens acordados y propuestas pendientes |
| `MOLECULES_ARCHITECTURE.md` | Registro de diseno de la capa de moleculas. Es historico: no refleja el estado actual |

## Salidas

- `dist`: loader ESM/CJS y bundles lazy-loaded.
- `dist-custom-elements`: componentes standalone.
- `docs-readme`: documentacion generada por componente.
- `docs-vscode`: metadata para autocompletado.
- `www`: demo local de Stencil.

La fuente de verdad de tokens es `@slice-soft/ss-design-system`; los tokens legacy locales fueron retirados del codigo fuente.
