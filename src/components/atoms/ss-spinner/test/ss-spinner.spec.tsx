import { newSpecPage } from '@stencil/core/testing';
import { SsSpinner } from '../ss-spinner';

describe('ss-spinner', () => {
  it('renders status semantics and size/color classes', async () => {
    const page = await newSpecPage({
      components: [SsSpinner],
      html: `<ss-spinner label="Saving" size="lg" color="success"></ss-spinner>`,
    });
    const spinner = page.root.shadowRoot.querySelector('.ss-spinner');

    expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.getAttribute('aria-label')).toBe('Saving');
    expect(spinner.classList.contains('ss-spinner--lg')).toBe(true);
    expect(spinner.classList.contains('ss-spinner--success')).toBe(true);
  });
});
