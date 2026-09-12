import { newTestPage } from '../../../../test/utils';

describe('ss-slider browser behavior', () => {
  it('updates its value and output through keyboard interaction', async () => {
    const page = await newTestPage();
    await page.setContent('<ss-slider x-id="volume" name="volume" value="20" step="5" show-value></ss-slider>');
    const inputSpy = await page.spyOnEvent('ssInput');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-slider >>> input');

    await input.focus();
    await input.press('ArrowRight');
    await page.waitForChanges();

    expect(inputSpy).toHaveReceivedEventDetail({ xId: 'volume', name: 'volume', value: 25 });
    expect(changeSpy).toHaveReceivedEventDetail({ xId: 'volume', name: 'volume', value: 25 });
    expect((await page.find('ss-slider >>> output')).textContent).toBe('25');
  });

  it('keeps its value and emits no value event when readonly', async () => {
    const page = await newTestPage();
    await page.setContent('<ss-slider value="40" readonly show-value></ss-slider>');
    const inputSpy = await page.spyOnEvent('ssInput');
    const changeSpy = await page.spyOnEvent('ssChange');
    const input = await page.find('ss-slider >>> input');

    await input.focus();
    await input.press('ArrowRight');
    await page.waitForChanges();

    expect(inputSpy).not.toHaveReceivedEvent();
    expect(changeSpy).not.toHaveReceivedEvent();
    expect(await input.getProperty('value')).toBe('40');
    expect((await page.find('ss-slider >>> output')).textContent).toBe('40');
  });

  it('forwards focus and blur events', async () => {
    const page = await newTestPage();
    await page.setContent('<ss-slider></ss-slider><button>Next</button>');
    const focusSpy = await page.spyOnEvent('ssFocus');
    const blurSpy = await page.spyOnEvent('ssBlur');
    const input = await page.find('ss-slider >>> input');

    await input.focus();
    await input.press('Tab');
    await page.waitForChanges();

    expect(focusSpy).toHaveReceivedEvent();
    expect(blurSpy).toHaveReceivedEvent();
  });
});

describe('ss-slider form association', () => {
  it('submits its value with the surrounding form', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><ss-slider name="level" value="40"></ss-slider></form>`);
    await page.waitForChanges();

    const submitted = await page.evaluate(() => new FormData(document.querySelector('form') as HTMLFormElement).get('level'));
    expect(submitted).toBe('40');
  });

  it('submits the value after keyboard interaction', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><ss-slider name="level" value="40"></ss-slider></form>`);
    const input = await page.find('ss-slider >>> input');
    await input.focus();
    await input.press('ArrowRight');
    await page.waitForChanges();

    const submitted = await page.evaluate(() => new FormData(document.querySelector('form') as HTMLFormElement).get('level'));
    expect(submitted).toBe('41');
  });

  it('is focused by a label that targets the host', async () => {
    const page = await newTestPage();
    await page.setContent(`<label for="level">Level</label><ss-slider id="level" name="level"></ss-slider>`);
    await page.waitForChanges();

    const label = await page.find('label');
    await label.click();
    await page.waitForChanges();

    const focused = await page.evaluate(() => {
      const host = document.activeElement as HTMLElement;
      return { host: host?.tagName.toLowerCase(), inner: host?.shadowRoot?.activeElement?.tagName.toLowerCase() };
    });
    expect(focused).toEqual({ host: 'ss-slider', inner: 'input' });
  });

  it('restores the value it loaded with on form reset', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><ss-slider name="level" value="40"></ss-slider></form>`);
    const input = await page.find('ss-slider >>> input');
    await input.focus();
    await input.press('ArrowRight');
    await page.waitForChanges();

    const afterReset = await page.evaluate(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      form.reset();
      return {
        submitted: new FormData(form).get('level'),
        rendered: (document.querySelector('ss-slider') as HTMLElement).shadowRoot?.querySelector('input')?.value,
      };
    });
    expect(afterReset).toEqual({ submitted: '40', rendered: '40' });
  });

  it('is disabled by an ancestor fieldset', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><fieldset disabled><ss-slider name="level"></ss-slider></fieldset></form>`);
    await page.waitForChanges();

    const input = await page.find('ss-slider >>> input');
    expect(input).toHaveAttribute('disabled');
  });
});

describe('ss-slider accessible description', () => {
  it('is described by an element outside its shadow root', async () => {
    const page = await newTestPage();
    await page.setContent(`<p id="help">Drag to set the level.</p><ss-slider accessibility-label="Level" described-by="help"></ss-slider>`);
    await page.waitForChanges();

    const snapshot: any = await (page as any).accessibility.snapshot({ interestingOnly: false });
    const flat: any[] = [];
    const walk = (node: any) => {
      flat.push(node);
      (node.children ?? []).forEach(walk);
    };
    walk(snapshot);

    expect(flat.find(node => node.name === 'Level')?.description).toBe('Drag to set the level.');
  });
});
