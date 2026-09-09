import { newTestPage } from '../../../../test/utils';

describe('ss-alert announcement', () => {
  it('exposes a problem as an assertive alert', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-alert variant="error">Upload failed</ss-alert>`);
    await page.waitForChanges();

    const role = await page.evaluate(() => (document.querySelector('ss-alert') as HTMLElement).shadowRoot!.querySelector('.ss-alert')!.getAttribute('role'));
    expect(role).toBe('alert');

    // A live region is announced by its content, not named by it, so the check
    // is that the message actually lands inside the element carrying the role —
    // through the flattened tree, which the container's own textContent misses.
    const announced = await page.evaluate(() => {
      const container = (document.querySelector('ss-alert') as HTMLElement).shadowRoot!.querySelector('.ss-alert')!;
      return Array.from(container.querySelectorAll('slot'))
        .flatMap(slot => (slot as HTMLSlotElement).assignedNodes({ flatten: true }))
        .map(node => node.textContent ?? '')
        .join('')
        .trim();
    });
    expect(announced).toBe('Upload failed');
  });

  it('exposes a confirmation as a polite status', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-alert variant="success">Saved</ss-alert>`);
    await page.waitForChanges();

    const role = await page.evaluate(() => (document.querySelector('ss-alert') as HTMLElement).shadowRoot!.querySelector('.ss-alert')!.getAttribute('role'));
    expect(role).toBe('status');
  });

  it('emits ssDismiss when the dismiss button is pressed', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-alert dismissible>Message</ss-alert>`);
    await page.waitForChanges();

    const dismissed = await page.spyOnEvent('ssDismiss');
    await (await page.find('ss-alert >>> .ss-alert__dismiss')).click();
    await page.waitForChanges();

    expect(dismissed).toHaveReceivedEvent();
  });

  it('hides the icon region when nothing is slotted into it', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-alert>Message</ss-alert>`);
    await page.waitForChanges();

    const display = await page.evaluate(() => {
      const icon = (document.querySelector('ss-alert') as HTMLElement).shadowRoot!.querySelector('.ss-alert__icon')!;
      return getComputedStyle(icon).display;
    });
    expect(display).toBe('none');
  });
});
