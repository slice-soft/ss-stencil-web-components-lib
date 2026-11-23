import { existsSync } from 'fs';
import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
// Framework wrappers (React, Angular, Vue) will be generated as separate published packages
// via GitHub Actions — not via sibling-path output targets, which write outside the CI
// workspace and are never captured in the build artifact.
// To re-enable locally: import { reactOutputTarget } from '@stencil/react-output-target'
// and add the target to outputTargets with a local outDir.
// import { reactOutputTarget } from '@stencil/react-output-target';

// The playground is local only (git-ignored). When src/playground.html exists,
// the dev server serves it as the index; otherwise the bare src/index.html.
const PLAYGROUND = 'src/playground.html';

export const config: Config = {
  namespace: 'ss-stencil-web-components-lib',
  srcIndexHtml: existsSync(PLAYGROUND) ? PLAYGROUND : 'src/index.html',
  globalStyle: 'src/global/global.scss',
  plugins: [
    sass(),
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
      footer: '*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*',
    },
    {
      type: 'www',
      serviceWorker: null,
      // DEV ONLY — test brands (test/brands/<brand>/_variables.css, _dark.css),
      // loaded by the playground on top of the CDN design tokens. Not in dist/loader.
      copy: [
        { src: '../test/tokens', dest: 'test-tokens' },
        { src: '../test/brands', dest: 'test-brands' },
        { src: '../test/tokens.config.json', dest: 'tokens.config.json' },
      ],
    },
    {
      type: 'docs-vscode',
      file: 'vscode-data.json',
    },
    // Framework wrapper targets — planned for a future phase as separate published packages.
    // Each framework package (react, angular, vue) will have its own repo and workflow.
    // reactOutputTarget({
    //   outDir: '../ss-stencil-web-components-lib-react/src/components',
    // }),
  ],
  testing: {
    browserHeadless: "shell",
    // Runs after Stencil's own setup file, so the timeout it sets wins. See
    // src/test/jest-setup.ts.
    setupFilesAfterEnv: ['<rootDir>/src/test/jest-setup.ts'],
  },
    devServer: {
    reloadStrategy: 'pageReload',
  },
  docs: {
    markdown: {
      targetComponent: {
        textColor: '#fff',
        background: '#000',
      },
    },
  },
};
