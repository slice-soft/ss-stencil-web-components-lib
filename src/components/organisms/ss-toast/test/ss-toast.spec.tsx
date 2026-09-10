import { newSpecPage } from '@stencil/core/testing';
import { SsToast } from '../ss-toast';
import { SsAlert } from '../../../molecules/ss-alert/ss-alert';
import { SsTypography } from '../../../atoms/ss-typography/ss-typography';
import { getRoot, getShadowRoot } from '../../../../test/utils';

const components = [SsToast, SsAlert, SsTypography];

async function toast(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  const root = getRoot(page) as HTMLElement & { open: boolean };
  const closes: { open: boolean; reason: string }[] = [];
  root.addEventListener('ssOpenChange', event => closes.push((event as CustomEvent).detail));
  return { page, root, closes };
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('ss-toast rendering', () => {
  it('hands its message to an alert', async () => {
    const { root } = await toast(`<ss-toast open variant="error" heading="Upload failed" dismiss-label="Close">Try again.</ss-toast>`);
    const alert = root.querySelector('ss-alert') as HTMLElement & { variant: string; heading: string; dismissible: boolean; dismissLabel: string };

    expect(alert.variant).toBe('error');
    expect(alert.heading).toBe('Upload failed');
    expect(alert.dismissible).toBe(true);
    expect(alert.dismissLabel).toBe('Close');
    expect(alert.textContent).toContain('Try again.');
  });

  it('is announced politely for good news and assertively for bad', async () => {
    const roleOf = async (variant: string) => {
      const { root } = await toast(`<ss-toast open variant="${variant}">Message</ss-toast>`);
      return getShadowRoot(root.querySelector('ss-alert')!).querySelector('.ss-alert')?.getAttribute('role');
    };

    expect(await roleOf('success')).toBe('status');
    expect(await roleOf('error')).toBe('alert');
  });
});

describe('ss-toast timing', () => {
  it('closes itself after its duration, and says why', async () => {
    const { page, root, closes } = await toast(`<ss-toast open duration="30">Saved.</ss-toast>`);

    await wait(80);
    await page.waitForChanges();

    expect(root.open).toBe(false);
    expect(closes).toEqual([{ xId: undefined, open: false, reason: 'timeout' }]);
  });

  it('stays until dismissed when the duration is 0', async () => {
    const { page, root } = await toast(`<ss-toast open duration="0">Action needed.</ss-toast>`);

    await wait(80);
    await page.waitForChanges();

    expect(root.open).toBe(true);
  });

  it('does not run its clock while closed', async () => {
    const { page, root } = await toast(`<ss-toast duration="40">Saved.</ss-toast>`);
    await wait(80);

    root.open = true;
    await page.waitForChanges();

    // Opened now, so the full duration is still ahead of it.
    expect(root.open).toBe(true);
  });

  it('holds its clock while the pointer is over it', async () => {
    const { page, root } = await toast(`<ss-toast open duration="40">Saved.</ss-toast>`);
    const container = root.querySelector('.ss-toast')!;

    container.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(100);
    await page.waitForChanges();
    expect(root.open).toBe(true);

    container.dispatchEvent(new MouseEvent('mouseleave'));
    await wait(100);
    await page.waitForChanges();
    expect(root.open).toBe(false);
  });
});

describe('ss-toast dismissal', () => {
  it('closes from the alert dismiss button, and reports it once', async () => {
    const { page, root, closes } = await toast(`<ss-toast open duration="0">Saved.</ss-toast>`);
    const leaked: Event[] = [];
    root.addEventListener('ssDismiss', event => leaked.push(event));

    (getShadowRoot(root.querySelector('ss-alert')!).querySelector('.ss-alert__dismiss') as HTMLElement).click();
    await page.waitForChanges();

    expect(root.open).toBe(false);
    expect(closes).toEqual([{ xId: undefined, open: false, reason: 'dismiss' }]);
    // The toast's own event carries the close; the alert's does not leak past it.
    expect(leaked).toEqual([]);
  });

  it('renders no dismiss button when it is not dismissible', async () => {
    const { root } = await toast(`<ss-toast open dismissible="false">Saved.</ss-toast>`);
    expect(getShadowRoot(root.querySelector('ss-alert')!).querySelector('.ss-alert__dismiss')).toBeNull();
  });
});
