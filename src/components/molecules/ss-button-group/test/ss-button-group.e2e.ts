import { newE2EPage } from '@stencil/core/testing';

const GROUP = `
  <ss-button-group accessibility-label="Text actions" size="lg">
    <ss-button label="Cut"></ss-button>
    <ss-button label="Copy"></ss-button>
  </ss-button-group>
`;

describe('ss-button-group', () => {
  it('coordinates the buttons it renders around', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    const sizes = await page.evaluate(() => Array.from(document.querySelectorAll('ss-button')).map(button => (button as any).size));
    expect(sizes).toEqual(['lg', 'lg']);
  });

  it('leaves each button its own click behaviour', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    const clicked = await page.spyOnEvent('ssClick');
    await (await page.find('ss-button >>> button')).click();
    await page.waitForChanges();

    expect(clicked).toHaveReceivedEvent();
  });

  it('is announced as one named group', async () => {
    const page = await newE2EPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    const container = await page.find('ss-button-group [role="group"]');
    expect(container.getAttribute('aria-label')).toBe('Text actions');
  });
});
