# ss-stencil-web-components-lib

Libreria de Web Components reutilizables desarrollados con StencilJS para SliceSoft.

## Uso

Los componentes consumen tokens CSS de `@slice-soft/ss-design-system`. Carga `_variables.css` antes de usar la libreria y `_dark.css` despues si necesitas modo oscuro.

```html
<link rel="stylesheet" href="https://cdn.slicesoft.dev/design-system/latest/css/_variables.css">
<link rel="stylesheet" href="https://cdn.slicesoft.dev/design-system/latest/css/_dark.css">
```

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
