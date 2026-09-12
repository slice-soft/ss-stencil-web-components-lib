/**
 * Raises jest's per-test timeout above the 45 seconds Stencil gives it.
 *
 * Stencil sets the timeout from its own setup file, as its default e2e wait
 * times 1.5, and this repository once recorded that as a ceiling that could
 * not be moved. It can: Stencil puts its setup file first in
 * `setupFilesAfterEnv` and a project's after it, so this call runs last and
 * wins.
 *
 * What it buys is room for a browser that is still starting while the whole
 * suite loads the machine. That work completes — every test that failed this
 * way passes on its own — so a test failing on it measured the machine, not
 * the component. `newTestPage` raises the app-load wait to fit inside this.
 */
export const E2E_TEST_TIMEOUT = 90_000;

jest.setTimeout(E2E_TEST_TIMEOUT);
