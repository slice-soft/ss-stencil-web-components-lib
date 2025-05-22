import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'ss-stencil-web-componets-lib',
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
      copy: [
        { src: 'global/tokens.css', dest: 'build/tokens.css' },
      ]
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
