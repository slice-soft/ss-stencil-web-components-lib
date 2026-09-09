import { newTestPage } from '../../../../test/utils';

describe('ss-input', () => {
  it('renders', async () => {
    const page = await newTestPage();
    await page.setContent('<ss-input></ss-input>');

    const element = await page.find('ss-input');
    expect(element).toHaveClass('hydrated');
  });
});

describe('ss-input attributes and events', () => {
  it('should reflect attributes and disabled state', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-input type=\"text\" placeholder=\"hello\" disabled full-width></ss-input>`);
    const input = await page.find('ss-input >>> input');
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('placeholder')).toBe('hello');
    expect(input).toHaveClass('ss-input--full-width');
    expect(input).toHaveAttribute('disabled');
  });

  it('should emit ssInput and ssChange events', async () => {
    const page = await newTestPage();
    await page.setContent('<ss-input></ss-input>');
    const input = await page.find('ss-input >>> input');
    const ssInputSpy = await page.spyOnEvent('ssInput');
    const ssChangeSpy = await page.spyOnEvent('ssChange');
    await input.type('a');
    expect(ssInputSpy).toHaveReceivedEvent();
    await input.press('Enter');
    expect(ssChangeSpy).toHaveReceivedEvent();
  });
});

describe('ss-input events', () => {
  it('should emit focus and blur events on keyboard interaction', async () => {
    const page = await newTestPage();
    await page.setContent('<ss-input></ss-input>');
    const input = await page.find('ss-input >>> input');
    const focusSpy = await page.spyOnEvent('ssFocus');
    const blurSpy = await page.spyOnEvent('ssBlur');

    await input.focus();
    await page.waitForChanges();
    expect(focusSpy).toHaveReceivedEvent();

    await input.press('Tab');
    await page.waitForChanges();
    expect(blurSpy).toHaveReceivedEvent();
  });
});

describe('ss-input advanced events', () => {
  it('should emit ssInvalid event', async () => {
    const page = await newTestPage();
    await page.setContent('<ss-input required></ss-input>');
    const invalidSpy = await page.spyOnEvent('ssInvalid');

    await page.evaluate(() => {
      const input = (document.querySelector('ss-input') as any).shadowRoot.querySelector('input');
      input.dispatchEvent(new Event('invalid', { bubbles: true, cancelable: true }));
    });
    await page.waitForChanges();
    expect(invalidSpy).toHaveReceivedEvent();
  });
});

describe('ss-input form association', () => {
  it('submits its value with the surrounding form', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><ss-input name="email" value="a@b.com"></ss-input></form>`);
    await page.waitForChanges();

    const submitted = await page.evaluate(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      return new FormData(form).get('email');
    });
    expect(submitted).toBe('a@b.com');
  });

  it('submits what the user typed, not the initial value', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><ss-input name="email" value="a@b.com"></ss-input></form>`);
    const input = await page.find('ss-input >>> input');
    await input.press('End');
    await input.type('.co');
    await page.waitForChanges();

    const submitted = await page.evaluate(() => new FormData(document.querySelector('form') as HTMLFormElement).get('email'));
    expect(submitted).toBe('a@b.com.co');
  });

  it('is focused by a label that targets the host', async () => {
    const page = await newTestPage();
    await page.setContent(`<label for="email">Email</label><ss-input id="email" name="email"></ss-input>`);
    await page.waitForChanges();

    const label = await page.find('label');
    await label.click();
    await page.waitForChanges();

    const focused = await page.evaluate(() => {
      const host = document.activeElement as HTMLElement;
      return { host: host?.tagName.toLowerCase(), inner: host?.shadowRoot?.activeElement?.tagName.toLowerCase() };
    });
    expect(focused).toEqual({ host: 'ss-input', inner: 'input' });
  });

  it('restores the initial value on form reset', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><ss-input name="email" value="a@b.com"></ss-input></form>`);
    const input = await page.find('ss-input >>> input');
    await input.press('End');
    await input.type('.co');
    await page.waitForChanges();

    const afterReset = await page.evaluate(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      form.reset();
      return {
        submitted: new FormData(form).get('email'),
        rendered: (document.querySelector('ss-input') as HTMLElement).shadowRoot?.querySelector('input')?.value,
      };
    });
    expect(afterReset).toEqual({ submitted: 'a@b.com', rendered: 'a@b.com' });
  });

  it('reports its native validity to the form', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><ss-input name="email" type="email" required></ss-input></form>`);
    await page.waitForChanges();

    // The form sees the failure through ElementInternals. `checkValidity()` and
    // `validity` are not re-exposed on the host: that needs @Method, which no
    // component in this library declares.
    const formValid = await page.evaluate(() => (document.querySelector('form') as HTMLFormElement).checkValidity());
    expect(formValid).toBe(false);
  });

  it('blocks submission while a required value is missing', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><ss-input name="email" type="email" required></ss-input><button type="submit">Go</button></form>`);
    await page.waitForChanges();

    const submitted = await page.evaluate(() => {
      let fired = false;
      const form = document.querySelector('form') as HTMLFormElement;
      form.addEventListener('submit', ev => {
        fired = true;
        ev.preventDefault();
      });
      (document.querySelector('button') as HTMLButtonElement).click();
      return fired;
    });
    expect(submitted).toBe(false);
  });

  it('becomes valid once it holds a valid value', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><ss-input name="email" type="email" required></ss-input></form>`);
    const input = await page.find('ss-input >>> input');
    await input.type('a@b.com');
    await page.waitForChanges();

    const formValid = await page.evaluate(() => (document.querySelector('form') as HTMLFormElement).checkValidity());
    expect(formValid).toBe(true);
  });

  it('is disabled by an ancestor fieldset', async () => {
    const page = await newTestPage();
    await page.setContent(`<form><fieldset disabled><ss-input name="email"></ss-input></fieldset></form>`);
    await page.waitForChanges();

    const input = await page.find('ss-input >>> input');
    expect(input).toHaveAttribute('disabled');
    expect(input).toHaveClass('ss-input--disabled');
  });
});

describe('ss-input accessible description', () => {
  /** Reads the description the browser actually exposes, not the attribute. */
  async function describedAs(page: any, accessibleName: string) {
    const snapshot = await page.accessibility.snapshot({ interestingOnly: false });
    const flat: any[] = [];
    const walk = (node: any) => {
      flat.push(node);
      (node.children ?? []).forEach(walk);
    };
    walk(snapshot);
    return flat.find(node => node.name === accessibleName)?.description ?? null;
  }

  it('is described by an element outside its shadow root', async () => {
    const page = await newTestPage();
    await page.setContent(`<p id="help">We'll never share it.</p><ss-input accessibility-label="Email" described-by="help"></ss-input>`);
    await page.waitForChanges();

    expect(await describedAs(page, 'Email')).toBe("We'll never share it.");
  });

  it('leaves the rendered attribute alone when the id resolves to nothing', async () => {
    const page = await newTestPage();
    await page.setContent(`<ss-input described-by="not-here"></ss-input>`);
    await page.waitForChanges();

    // Nothing to reference, so the attribute stays as the only association a
    // browser without element reflection can use.
    const input = await page.find('ss-input >>> input');
    expect(input.getAttribute('aria-describedby')).toBe('not-here');
  });

  it('replaces a stale description when described-by changes', async () => {
    const page = await newTestPage();
    await page.setContent(`<p id="one">First</p><p id="two">Second</p><ss-input accessibility-label="Email" described-by="one"></ss-input>`);
    await page.waitForChanges();
    expect(await describedAs(page, 'Email')).toBe('First');

    const host = await page.find('ss-input');
    host.setAttribute('described-by', 'two');
    await page.waitForChanges();

    expect(await describedAs(page, 'Email')).toBe('Second');
  });

  it('drops the description when described-by is removed', async () => {
    const page = await newTestPage();
    await page.setContent(`<p id="help">Helper</p><ss-input accessibility-label="Email" described-by="help"></ss-input>`);
    await page.waitForChanges();
    expect(await describedAs(page, 'Email')).toBe('Helper');

    const host = await page.find('ss-input');
    host.removeAttribute('described-by');
    await page.waitForChanges();

    expect(await describedAs(page, 'Email')).toBeFalsy();
  });
});
