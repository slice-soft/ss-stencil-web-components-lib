import { newSpecPage } from '@stencil/core/testing';
import { SsAvatar } from '../ss-avatar';

describe('ss-avatar', () => {
  it('renders fallback initials with image role', async () => {
    const page = await newSpecPage({
      components: [SsAvatar],
      html: `<ss-avatar initials="JS"></ss-avatar>`,
    });
    const avatar = page.root.shadowRoot.querySelector('.ss-avatar');

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
    page.root.addEventListener('ssLoad', loadSpy);
    page.root.addEventListener('ssError', errorSpy);

    const image = page.root.shadowRoot.querySelector('img');
    image.dispatchEvent(new Event('load'));
    image.dispatchEvent(new Event('error'));
    await page.waitForChanges();

    expect(loadSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'user', src: '/avatar.png' } }));
    expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { xId: 'user', src: '/avatar.png' } }));
    expect(page.root.shadowRoot.querySelector('.ss-avatar__fallback')).not.toBeNull();
  });
});
