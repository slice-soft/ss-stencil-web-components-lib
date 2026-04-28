import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { reactOutputTarget } from '@stencil/react-output-target';

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
        { src: '../test/token-set-03', dest: 'test-tokens/token-set-03' },
      ],
    },
    {
      type: 'docs-vscode',
      file: 'vscode-data.json',
    },
    reactOutputTarget({
      outDir: '../ss-stencil-web-componets-lib-react/src/components',
      
    })
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
