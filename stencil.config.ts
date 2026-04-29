import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
// Framework wrappers (React, Angular, Vue) will be generated as separate published packages
// via GitHub Actions — not via sibling-path output targets, which write outside the CI
// workspace and are never captured in the build artifact.
// To re-enable locally: import { reactOutputTarget } from '@stencil/react-output-target'
// and add the target to outputTargets with a local outDir.
// import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  namespace: 'ss-stencil-web-components-lib',
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
      // DEV ONLY — copy test token sets to www/test-tokens/ for local visual testing.
      // These are NOT included in dist/loader outputs.
      // Add more sets: { src: '../test/token-set-NN', dest: 'test-tokens/token-set-NN' }
      copy: [
        { src: '../test/token-set-01', dest: 'test-tokens/token-set-01' },
        { src: '../test/token-set-02', dest: 'test-tokens/token-set-02' },
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
