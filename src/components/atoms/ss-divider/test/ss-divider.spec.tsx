import { newSpecPage } from '@stencil/core/testing';
import { SsDivider } from '../ss-divider';
import { getRoot, getElement, getShadowRoot } from '../../../../test/utils';

describe('ss-divider', () => {
  it('is decorative by default', async () => {
    const page = await newSpecPage({
      components: [SsDivider],
      html: `<ss-divider></ss-divider>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const divider = getElement(shadow, '.ss-divider');

    expect(divider.getAttribute('role')).toBeNull();
  });

  it('supports separator semantics and label', async () => {
    const page = await newSpecPage({
      components: [SsDivider],
      html: `<ss-divider decorative="false" orientation="vertical" label="Or"></ss-divider>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const divider = getElement(shadow, '.ss-divider');

    expect(divider.getAttribute('role')).toBe('separator');
    expect(divider.getAttribute('aria-orientation')).toBe('vertical');
    expect(divider.textContent).toContain('Or');
  });
});
