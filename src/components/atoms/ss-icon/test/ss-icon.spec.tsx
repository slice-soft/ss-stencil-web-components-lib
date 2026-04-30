import { newSpecPage } from '@stencil/core/testing';
import { SsIcon } from '../ss-icon';

describe('ss-icon', () => {
  it('renders decorative icons hidden from assistive tech by default', async () => {
    const page = await newSpecPage({
      components: [SsIcon],
      html: `<ss-icon><svg></svg></ss-icon>`,
    });
    const icon = page.root.shadowRoot.querySelector('span');

    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.getAttribute('role')).toBeNull();
  });

  it('renders labeled icons as images', async () => {
    const page = await newSpecPage({
      components: [SsIcon],
      html: `<ss-icon label="Search" decorative="false"></ss-icon>`,
    });
    const icon = page.root.shadowRoot.querySelector('span');

    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Search');
  });
});
