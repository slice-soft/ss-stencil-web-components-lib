# ss-stencil-web-componets-lib

## Descripción
Este proyecto es una librería de Web Components reutilizables desarrollados con [StencilJS](https://stenciljs.com/), pensada para ser utilizada en cualquier framework moderno o sin framework. Todos los componentes se encuentran en el directorio `src` y comparten estilos globales y tokens de diseño.

- **Componentes:** Todos los componentes están en `src/components`.
- **Estilos globales:** Se gestionan desde `src/global/global.scss` y se usan tokens CSS (`src/global/tokens.css`).
- **Sass:** El proyecto utiliza Sass como preprocesador de estilos.
- **Tokens:** Los tokens de diseño se copian automáticamente a la carpeta de build.
- **Output targets:**
  - `dist` (ESM y CJS)
  - `dist-custom-elements` (componentes individuales)
  - `docs-readme` (documentación automática)
  - `docs-vscode` (soporte para VSCode)
  - `www` (build demo, sin service worker)

La configuración completa está en `stencil.config.ts`.

## Instalación y uso

Clona el repositorio y ejecuta:

```bash
git clone https://github.com/slice-soft/ss-stencil-web-componets-lib.git
cd ss-stencil-web-componets-lib
npm install
npm start
```

Para construir para producción:

```bash
npm run build
```

Para ejecutar los tests:

```bash
npm test
```

## Importar componentes

Puedes importar los componentes de dos formas:

### 1. Lazy loading (via dist)

Incluye el script ESM generado en tu HTML o en tu entrypoint JS/TS:

```html
<script type="module" src="https://unpkg.com/ss-stencil-web-componets-lib"></script>
```

O en tu app:

```ts
import 'ss-stencil-web-componets-lib/dist/ss-stencil-web-componets-lib/ss-stencil-web-componets-lib.esm.js';
```

### 2. Standalone (via dist-custom-elements)

Importa solo el componente que necesitas:

```ts
import 'ss-stencil-web-componets-lib/my-component';
```

## Personalización y desarrollo

- Todos los componentes nuevos deben crearse en `src/components`.
- Los estilos globales y tokens están en `src/global`.
- La documentación de cada componente se genera automáticamente en su README.

## Créditos

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*