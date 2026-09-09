import { newE2EPage } from '@stencil/core/testing';

describe('ss-textarea', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-textarea></ss-textarea>');

    const element = await page.find('ss-textarea');
    expect(element).toHaveClass('hydrated');
  });
});

describe('ss-textarea form association', () => {
  it('submits its value with the surrounding form', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form><ss-textarea name="bio" value="hello"></ss-textarea></form>`);
    await page.waitForChanges();

    const submitted = await page.evaluate(() => new FormData(document.querySelector('form') as HTMLFormElement).get('bio'));
    expect(submitted).toBe('hello');
  });

  it('submits what the user typed, not the initial value', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form><ss-textarea name="bio" value="hello"></ss-textarea></form>`);
    const textarea = await page.find('ss-textarea >>> textarea');
    await textarea.press('End');
    await textarea.type(' world');
    await page.waitForChanges();

    const submitted = await page.evaluate(() => new FormData(document.querySelector('form') as HTMLFormElement).get('bio'));
    expect(submitted).toBe('hello world');
  });

  it('is focused by a label that targets the host', async () => {
    const page = await newE2EPage();
    await page.setContent(`<label for="bio">Bio</label><ss-textarea id="bio" name="bio"></ss-textarea>`);
    await page.waitForChanges();

    const label = await page.find('label');
    await label.click();
    await page.waitForChanges();

    const focused = await page.evaluate(() => {
      const host = document.activeElement as HTMLElement;
      return { host: host?.tagName.toLowerCase(), inner: host?.shadowRoot?.activeElement?.tagName.toLowerCase() };
    });
    expect(focused).toEqual({ host: 'ss-textarea', inner: 'textarea' });
  });

  it('restores the initial value on form reset', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form><ss-textarea name="bio" value="hello"></ss-textarea></form>`);
    const textarea = await page.find('ss-textarea >>> textarea');
    await textarea.press('End');
    await textarea.type(' world');
    await page.waitForChanges();

    const afterReset = await page.evaluate(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      form.reset();
      return {
        submitted: new FormData(form).get('bio'),
        rendered: (document.querySelector('ss-textarea') as HTMLElement).shadowRoot?.querySelector('textarea')?.value,
      };
    });
    expect(afterReset).toEqual({ submitted: 'hello', rendered: 'hello' });
  });

  it('reports its native validity to the form', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form><ss-textarea name="bio" required></ss-textarea></form>`);
    await page.waitForChanges();

    const formValid = await page.evaluate(() => (document.querySelector('form') as HTMLFormElement).checkValidity());
    expect(formValid).toBe(false);
  });

  it('is disabled by an ancestor fieldset', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form><fieldset disabled><ss-textarea name="bio"></ss-textarea></fieldset></form>`);
    await page.waitForChanges();

    const textarea = await page.find('ss-textarea >>> textarea');
    expect(textarea).toHaveAttribute('disabled');
    expect(textarea).toHaveClass('ss-textarea--disabled');
  });
});

describe('ss-textarea accessible description', () => {
  it('is described by an element outside its shadow root', async () => {
    const page = await newE2EPage();
    await page.setContent(`<p id="help">Max 200 characters.</p><ss-textarea accessibility-label="Bio" described-by="help"></ss-textarea>`);
    await page.waitForChanges();

    const snapshot: any = await (page as any).accessibility.snapshot({ interestingOnly: false });
    const flat: any[] = [];
    const walk = (node: any) => {
      flat.push(node);
      (node.children ?? []).forEach(walk);
    };
    walk(snapshot);

    expect(flat.find(node => node.name === 'Bio')?.description).toBe('Max 200 characters.');
  });
});
