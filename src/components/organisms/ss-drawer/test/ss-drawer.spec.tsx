import { newSpecPage } from '@stencil/core/testing';
import { SsDrawer } from '../ss-drawer';

describe('ss-drawer', () => {
  it('renders a backdrop only when modal', async () => {
    const modal = await newSpecPage({ components: [SsDrawer], html: '<ss-drawer open heading="Filtros"></ss-drawer>' });
    expect(modal.root.querySelector('.ss-drawer__backdrop')).not.toBeNull();

    const panel = await newSpecPage({ components: [SsDrawer], html: '<ss-drawer open modal="false" heading="Filtros"></ss-drawer>' });
    expect(panel.root.querySelector('.ss-drawer__backdrop')).toBeNull();
  });

  it('placement and size set classes', async () => {
    const page = await newSpecPage({ components: [SsDrawer], html: '<ss-drawer placement="bottom" size="lg"></ss-drawer>' });
    const root = page.root.querySelector('.ss-drawer');
    expect(root.classList.contains('ss-drawer--bottom')).toBe(true);
    expect(root.classList.contains('ss-drawer--lg')).toBe(true);
  });

  it('defaults to the end edge, modal, md', async () => {
    const page = await newSpecPage({ components: [SsDrawer], html: '<ss-drawer></ss-drawer>' });
    const root = page.root.querySelector('.ss-drawer');
    expect(root.classList.contains('ss-drawer--end')).toBe(true);
    expect(root.classList.contains('ss-drawer--md')).toBe(true);
    expect(root.classList.contains('ss-drawer--modal')).toBe(true);
  });
});
