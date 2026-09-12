import { newTestPage } from '../../../../test/utils';

const GROUP = `
  <ss-button-group accessibility-label="Text actions" size="lg">
    <ss-button label="Cut"></ss-button>
    <ss-button label="Copy"></ss-button>
  </ss-button-group>
`;

describe('ss-button-group', () => {
  it('coordinates the buttons it renders around', async () => {
    const page = await newTestPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    const sizes = await page.evaluate(() => Array.from(document.querySelectorAll('ss-button')).map(button => (button as any).size));
    expect(sizes).toEqual(['lg', 'lg']);
  });

  it('leaves each button its own click behaviour', async () => {
    const page = await newTestPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    const clicked = await page.spyOnEvent('ssClick');
    await (await page.find('ss-button >>> button')).click();
    await page.waitForChanges();

    expect(clicked).toHaveReceivedEvent();
  });

  it('is announced as one named group', async () => {
    const page = await newTestPage();
    await page.setContent(GROUP);
    await page.waitForChanges();

    const container = await page.find('ss-button-group >>> [role="group"]');
    expect(container.getAttribute('aria-label')).toBe('Text actions');
  });
});

describe('ss-button-group attached', () => {
  const TOKENS = `<style>:root{ --ss-radius-base: 8px; --ss-radius-none: 0px; --ss-button-border-radius: 8px; --ss-borders-width-base: 2px; }</style>`;

  const THREE = `
    <ss-button-group attached accessibility-label="View">
      <ss-button label="Day"></ss-button>
      <ss-button label="Week"></ss-button>
      <ss-button label="Month"></ss-button>
    </ss-button-group>
  `;

  it('rounds only the outer edges of the row', async () => {
    const page = await newTestPage();
    await page.setContent(TOKENS + THREE);
    await page.waitForChanges();

    const corners = await page.evaluate(() =>
      Array.from(document.querySelectorAll('ss-button')).map(host => {
        const cs = getComputedStyle((host as HTMLElement).shadowRoot!.querySelector('button')!);
        return `${cs.borderStartStartRadius}/${cs.borderStartEndRadius}`;
      }),
    );

    // First keeps its leading corner, last keeps its trailing one, middle has neither.
    expect(corners).toEqual(['8px/0px', '0px/0px', '0px/8px']);
  });

  it('draws the shared edge once instead of twice', async () => {
    const page = await newTestPage();
    await page.setContent(TOKENS + THREE);
    await page.waitForChanges();

    const margins = await page.evaluate(() => Array.from(document.querySelectorAll('ss-button')).map(host => getComputedStyle(host).marginInlineStart));
    expect(margins).toEqual(['0px', '-2px', '-2px']);
  });

  it('still lets each button be pressed on its own', async () => {
    const page = await newTestPage();
    await page.setContent(TOKENS + THREE);
    await page.waitForChanges();

    const clicked = await page.spyOnEvent('ssClick');
    await (await page.findAll('ss-button >>> button'))[1].click();
    await page.waitForChanges();

    expect(clicked).toHaveReceivedEvent();
  });
});
