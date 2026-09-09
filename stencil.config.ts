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
    browserHeadless: 'shell',
    // Chrome's default shared-memory budget is small, and a suite that starts
    // this many browsers intermittently failed the 30s app-load wait because of
    // it — always on `setContent`, never on a component's own behaviour. These
    // are the standard flags for running headless Chrome in a constrained or
    // containerised environment, which also describes CI.
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    // Each e2e worker drives its own browser, and Stencil defaults to one worker
    // per core. Measured on this suite, running every e2e file at once stretched
    // individual suites from ~6s to ~35s and pushed some past the 30s app-load
    // wait; the failure is always `setContent`, never a component's behaviour.
    // A fixed cap also suits CI runners, which have far fewer cores.
    //
    // This reduces the problem rather than removing it: `npm run test.e2e` on
    // its own is reliable, while `npm test` still trips roughly one run in five
    // because the spec run precedes it on the same machine. Running test.spec
    // and test.e2e as separate CI jobs would isolate them properly.
    maxWorkers: 2,
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
