import { newSpecPage } from '@stencil/core/testing';
import { SsAlert } from '../ss-alert';
import { SsTypography } from '../../../atoms/ss-typography/ss-typography';
import { getRoot, getShadowRoot } from '../../../../test/utils';

const components = [SsAlert, SsTypography];

async function alert(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return getShadowRoot(getRoot(page));
}

describe('ss-alert severity', () => {
  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['error', 'alert'],
  ])('announces %s politely or assertively as %s', async (variant, role) => {
    const root = await alert(`<ss-alert variant="${variant}">Message</ss-alert>`);
    expect(root.querySelector(`[role="${role}"]`)).not.toBeNull();
  });

  it('is a polite status by default', async () => {
    const root = await alert(`<ss-alert>Message</ss-alert>`);
    expect(root.querySelector('.ss-alert')?.getAttribute('role')).toBe('status');
  });

  it('applies the severity modifier', async () => {
    const root = await alert(`<ss-alert variant="error">Message</ss-alert>`);
    expect(root.querySelector('.ss-alert')?.className).toContain('ss-alert--error');
  });
});

describe('ss-alert content', () => {
  it('renders no title unless one is supplied', async () => {
    const root = await alert(`<ss-alert>Message</ss-alert>`);
    expect(root.querySelector('.ss-alert__title')).toBeNull();
  });

  it('renders the heading prop as the title', async () => {
    const root = await alert(`<ss-alert heading="Upload failed">Message</ss-alert>`);
    expect(root.querySelector('.ss-alert__title')?.textContent).toContain('Upload failed');
  });

  it('prefers slotted title content over the prop', async () => {
    const root = await alert(`<ss-alert heading="Prop"><span slot="title">Slotted</span></ss-alert>`);
    const title = root.querySelector('.ss-alert__title');

    expect(title).not.toBeNull();
    expect(title?.textContent).not.toContain('Prop');
  });
});

describe('ss-alert dismissal', () => {
  it('renders no dismiss button by default', async () => {
    const root = await alert(`<ss-alert>Message</ss-alert>`);
    expect(root.querySelector('.ss-alert__dismiss')).toBeNull();
  });

  it('labels the dismiss button for screen readers', async () => {
    const root = await alert(`<ss-alert dismissible>Message</ss-alert>`);
    expect(root.querySelector('.ss-alert__dismiss')?.getAttribute('aria-label')).toBe('Dismiss');
  });

  it('accepts a translated dismiss label', async () => {
    const root = await alert(`<ss-alert dismissible dismiss-label="Cerrar">Message</ss-alert>`);
    expect(root.querySelector('.ss-alert__dismiss')?.getAttribute('aria-label')).toBe('Cerrar');
  });

  it('emits ssDismiss with its id when pressed', async () => {
    const page = await newSpecPage({ components, html: `<ss-alert x-id="upload" dismissible>Message</ss-alert>` });
    await page.waitForChanges();
    const spy = jest.fn();
    getRoot(page).addEventListener('ssDismiss', spy);

    getShadowRoot(getRoot(page)).querySelector<HTMLButtonElement>('.ss-alert__dismiss')?.click();
    await page.waitForChanges();

    expect(spy.mock.calls[0][0].detail).toEqual({ xId: 'upload' });
  });

  it('leaves removing itself to the consumer', async () => {
    const page = await newSpecPage({ components, html: `<ss-alert dismissible>Message</ss-alert>` });
    await page.waitForChanges();

    getShadowRoot(getRoot(page)).querySelector<HTMLButtonElement>('.ss-alert__dismiss')?.click();
    await page.waitForChanges();

    // The alert reports the intent; what happens to it is the caller's call.
    expect(page.body.querySelector('ss-alert')).not.toBeNull();
  });
});
