import { newSpecPage } from '@stencil/core/testing';
import { SsSpinner } from '../ss-spinner';
import { getRoot, getElement, getShadowRoot } from '../../../../test/utils';

describe('ss-spinner', () => {
  it('renders status semantics and size/color classes', async () => {
    const page = await newSpecPage({
      components: [SsSpinner],
      html: `<ss-spinner label="Saving" size="lg" color="success"></ss-spinner>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const spinner = getElement(shadow, '.ss-spinner');

    expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.getAttribute('aria-label')).toBe('Saving');
    expect(spinner.classList.contains('ss-spinner--lg')).toBe(true);
    expect(spinner.classList.contains('ss-spinner--success')).toBe(true);
  });
});
