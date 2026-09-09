import { newE2EPage, E2EPage } from '@stencil/core/testing';
import { axNodeByRole } from '../../../../test/utils';

async function focusedPath(page: E2EPage) {
  return page.evaluate(() => {
    const host = document.activeElement as HTMLElement;
    return [host?.tagName.toLowerCase(), host?.shadowRoot?.activeElement?.tagName.toLowerCase()].filter(Boolean).join(' > ');
  });
}

describe('ss-field naming a shadow-rendered control', () => {
  it('names and describes the control itself', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Email" helper-text="We never share it."><ss-input type="email"></ss-input></ss-field>`);
    await page.waitForChanges();

    expect(await axNodeByRole(page, 'textbox')).toEqual({ name: 'Email', description: 'We never share it.' });
  });

  it('focuses the control when the label is clicked', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Email"><ss-input type="email"></ss-input></ss-field>`);
    await page.waitForChanges();

    const label = await page.find('ss-field label');
    await label.click();
    await page.waitForChanges();

    expect(await focusedPath(page)).toBe('ss-input > input');
  });

  it('names a slider, which has no required state to coordinate', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Level" helper-text="Drag to adjust."><ss-slider></ss-slider></ss-field>`);
    await page.waitForChanges();

    expect(await axNodeByRole(page, 'slider')).toEqual({ name: 'Level', description: 'Drag to adjust.' });
  });

  it('names a textarea', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Bio"><ss-textarea></ss-textarea></ss-field>`);
    await page.waitForChanges();

    expect((await axNodeByRole(page, 'textbox')).name).toBe('Bio');
  });
});

describe('ss-field naming a light-DOM control', () => {
  it('names and describes the control natively', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Accept terms" helper-text="Required to continue."><ss-checkbox></ss-checkbox></ss-field>`);
    await page.waitForChanges();

    expect(await axNodeByRole(page, 'checkbox')).toEqual({ name: 'Accept terms', description: 'Required to continue.' });
  });

  it('focuses the control when the label is clicked', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Accept terms"><ss-checkbox></ss-checkbox></ss-field>`);
    await page.waitForChanges();

    const label = await page.find('ss-field label');
    await label.click();
    await page.waitForChanges();

    const focused = await page.evaluate(() => document.querySelector('ss-checkbox input')?.matches(':focus'));
    expect(focused).toBe(true);
  });

  it('names a select without mistaking its rendered element for the control', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Country" helper-text="Where you live."><ss-select><option value="co">Colombia</option></ss-select></ss-field>`);
    await page.waitForChanges();

    expect(await axNodeByRole(page, 'combobox')).toEqual({ name: 'Country', description: 'Where you live.' });
  });

  it('names and describes a native control', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Nickname" helper-text="Optional."><input type="text" /></ss-field>`);
    await page.waitForChanges();

    expect(await axNodeByRole(page, 'textbox')).toEqual({ name: 'Nickname', description: 'Optional.' });
  });
});

describe('ss-field error message', () => {
  it('adds the error to the description once the field is invalid', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Email" helper-text="We never share it." error-text="Enter a valid email"><ss-input type="email"></ss-input></ss-field>`);
    await page.waitForChanges();
    expect((await axNodeByRole(page, 'textbox')).description).toBe('We never share it.');

    const field = await page.find('ss-field');
    field.setAttribute('invalid', '');
    await page.waitForChanges();

    expect((await axNodeByRole(page, 'textbox', node => node.description === 'We never share it. Enter a valid email')).description).toBe('We never share it. Enter a valid email');
  });

  it('announces the error as an alert', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Email" invalid error-text="Enter a valid email"><ss-input type="email"></ss-input></ss-field>`);
    await page.waitForChanges();

    const alert = await page.find('ss-field [role="alert"]');
    expect(alert.textContent).toContain('Enter a valid email');
  });

  it('describes the control with an error supplied only through the slot', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Email" invalid><ss-input type="email"></ss-input><span slot="error">Slotted error</span></ss-field>`);
    await page.waitForChanges();

    expect((await axNodeByRole(page, 'textbox')).description).toBe('Slotted error');
  });
});

describe('ss-field state coordination', () => {
  it('marks the control required from a single source', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form><ss-field label="Email" required><ss-input name="email" type="email"></ss-input></ss-field></form>`);
    await page.waitForChanges();

    await page.waitForChanges();
    expect(await page.find('ss-input >>> input')).toHaveAttribute('required');

    const formValid = await page.evaluate(() => (document.querySelector('form') as HTMLFormElement).checkValidity());
    expect(formValid).toBe(false);
  });

  it('leaves the control able to submit its own value', async () => {
    const page = await newE2EPage();
    await page.setContent(`<form><ss-field label="Email"><ss-input name="email" value="a@b.com"></ss-input></ss-field></form>`);
    await page.waitForChanges();

    const submitted = await page.evaluate(() => new FormData(document.querySelector('form') as HTMLFormElement).get('email'));
    expect(submitted).toBe('a@b.com');
  });

  it('disables and re-enables the control with the field', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ss-field label="Email" disabled><ss-input></ss-input></ss-field>`);
    await page.waitForChanges();
    expect(await page.find('ss-input >>> input')).toHaveAttribute('disabled');

    const field = await page.find('ss-field');
    field.removeAttribute('disabled');
    await page.waitForChanges();
    await page.waitForChanges();

    expect(await page.find('ss-input >>> input')).not.toHaveAttribute('disabled');
  });
});
