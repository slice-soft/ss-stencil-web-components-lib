import { newSpecPage } from '@stencil/core/testing';
import { SsAvatar } from '../ss-avatar';
import { getRoot, getElement, getShadowRoot } from '../../../../test/utils';

describe('ss-avatar', () => {
  it('renders fallback initials with image role', async () => {
    const page = await newSpecPage({
      components: [SsAvatar],
      html: `<ss-avatar initials="JS"></ss-avatar>`,
    });
    const root = getRoot(page);
    const shadow = getShadowRoot(root);
    const avatar = getElement(shadow, '.ss-avatar');

    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('JS');
    expect(avatar.textContent).toContain('JS');
  });

  it('emits load and falls back on image error', async () => {
    const page = await newSpecPage({
      components: [SsAvatar],
      html: `<ss-avatar x-id="user" src="/avatar.png" alt="User" initials="U"></ss-avatar>`,
    });
    const loadSpy = jest.fn();
    const errorSpy = jest.fn();
    const root = getRoot(page);
    root.addEventListener('ssLoad', loadSpy);
    root.addEventListener('ssError', errorSpy);

    const shadow = getShadowRoot(root);
    const image = getElement<HTMLImageElement>(shadow, 'img');
    image.dispatchEvent(new Event('load'));
    image.dispatchEvent(new Event('error'));
    await page.waitForChanges();

    expect(loadSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'user', src: '/avatar.png' } }));
    expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'user', src: '/avatar.png' } }));
    expect(shadow.querySelector('.ss-avatar__fallback')).not.toBeNull();
  });
});
