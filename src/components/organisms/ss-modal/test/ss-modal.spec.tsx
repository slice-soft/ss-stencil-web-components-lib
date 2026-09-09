import { newSpecPage } from '@stencil/core/testing';
import { SsModal } from '../ss-modal';
import { SsTypography } from '../../../atoms/ss-typography/ss-typography';
import { getRoot } from '../../../../test/utils';

const components = [SsModal, SsTypography];

async function modal(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

describe('ss-modal rendering', () => {
  it('is hidden until it is opened', async () => {
    const page = await modal(`<ss-modal heading="Title">Body</ss-modal>`);
    expect(getRoot(page).querySelector('.ss-modal')?.hasAttribute('hidden')).toBe(true);

    getRoot(page).setAttribute('open', '');
    await page.waitForChanges();

    expect(getRoot(page).querySelector('.ss-modal')?.hasAttribute('hidden')).toBe(false);
  });

  it('is a modal dialog', async () => {
    const page = await modal(`<ss-modal open heading="Title">Body</ss-modal>`);
    const dialog = getRoot(page).querySelector('.ss-modal__dialog');

    expect(dialog?.getAttribute('role')).toBe('dialog');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
  });

  it('points its name at the heading it renders', async () => {
    const page = await modal(`<ss-modal open heading="Delete file">Body</ss-modal>`);
    const root = getRoot(page);
    const labelledBy = root.querySelector('.ss-modal__dialog')?.getAttribute('aria-labelledby');

    expect(root.querySelector(`#${labelledBy}`)?.textContent).toContain('Delete file');
  });

  it('falls back to a stated name when there is no heading', async () => {
    const page = await modal(`<ss-modal open accessibility-label="Confirm">Body</ss-modal>`);
    const dialog = getRoot(page).querySelector('.ss-modal__dialog');

    expect(dialog?.getAttribute('aria-label')).toBe('Confirm');
    expect(dialog?.getAttribute('aria-labelledby')).toBeNull();
  });

  it('prefers a slotted header over the prop', async () => {
    const page = await modal(`<ss-modal open heading="Prop"><span slot="header">Slotted</span>Body</ss-modal>`);
    expect(getRoot(page).querySelector('.ss-modal__heading')?.textContent).not.toContain('Prop');
  });

  it('renders a labelled close button, unless it is refused', async () => {
    const page = await modal(`<ss-modal open heading="Title" dismiss-label="Cerrar">Body</ss-modal>`);
    expect(getRoot(page).querySelector('.ss-modal__dismiss')?.getAttribute('aria-label')).toBe('Cerrar');

    const plain = await modal(`<ss-modal open heading="Title" dismissible="false">Body</ss-modal>`);
    expect(getRoot(plain).querySelector('.ss-modal__dismiss')).toBeNull();
  });

  it('applies the size modifier', async () => {
    const page = await modal(`<ss-modal open size="lg" heading="Title">Body</ss-modal>`);
    expect(getRoot(page).querySelector('.ss-modal')?.className).toContain('ss-modal--lg');
  });
});
