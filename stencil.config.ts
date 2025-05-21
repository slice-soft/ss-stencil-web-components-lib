import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'ss-stencil-web-componets-lib',
  plugins: [
    sass({
      injectGlobalPaths: [
        'src/global/variables.scss',
      ]
    }),
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
      serviceWorker: null, // disable service workers
    },
    {
      type: 'docs-vscode',
      file: 'vscode-data.json',
    },
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
