import { newSpecPage } from '@stencil/core/testing';
import { SsField } from '../ss-field';
import { SsLabel } from '../../../atoms/ss-label/ss-label';
import { SsTypography } from '../../../atoms/ss-typography/ss-typography';
import { SsCheckbox } from '../../../atoms/ss-checkbox/ss-checkbox';
import { getRoot } from '../../../../test/utils';

const components = [SsField, SsLabel, SsTypography, SsCheckbox];

/**
 * The field wires its control after its own first render, and assigning a prop
 * to a child schedules that child's re-render, so the wired result is only
 * observable one tick later.
 */
async function field(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

describe('ss-field content', () => {
  it('renders the label, and marks it required', async () => {
    const page = await field(`<ss-field label="Email" required></ss-field>`);
    const label = getRoot(page).querySelector('label');

    expect(label?.textContent).toContain('Email');
    expect(label?.className).toContain('ss-label--required');
  });

  it('renders no label when neither the prop nor the slot is supplied', async () => {
    const page = await field(`<ss-field></ss-field>`);
    expect(getRoot(page).querySelector('ss-label')).toBeNull();
  });

  it('prefers slotted label content over the prop', async () => {
    const page = await field(`<ss-field label="Prop"><span slot="label">Slotted</span></ss-field>`);
    const label = getRoot(page).querySelector('label');

    expect(label?.textContent).toContain('Slotted');
    expect(label?.textContent).not.toContain('Prop');
  });

  it('renders helper text whether or not the field is invalid', async () => {
    const page = await field(`<ss-field helper-text="We never share it"></ss-field>`);
    expect(getRoot(page).textContent).toContain('We never share it');
  });

  it('hides the error until the field is invalid', async () => {
    const page = await field(`<ss-field error-text="Enter a valid email"></ss-field>`);
    expect(getRoot(page).textContent).not.toContain('Enter a valid email');

    getRoot(page).setAttribute('invalid', '');
    await page.waitForChanges();
    expect(getRoot(page).textContent).toContain('Enter a valid email');
  });

  it('shows an error supplied only through the slot', async () => {
    const page = await field(`<ss-field invalid><span slot="error">Slotted error</span></ss-field>`);
    expect(getRoot(page).textContent).toContain('Slotted error');
  });

  it('marks the error as an alert', async () => {
    const page = await field(`<ss-field invalid error-text="Boom"></ss-field>`);
    expect(getRoot(page).querySelector('[role="alert"]')).not.toBeNull();
  });

  it('applies the orientation and state modifiers', async () => {
    const page = await field(`<ss-field orientation="horizontal" invalid disabled></ss-field>`);
    const container = getRoot(page).querySelector('.ss-field');

    expect(container?.className).toContain('ss-field--horizontal');
    expect(container?.className).toContain('ss-field--invalid');
    expect(container?.className).toContain('ss-field--disabled');
  });
});

describe('ss-field control wiring', () => {
  it('points the label at the control it generated an id for', async () => {
    const page = await field(`<ss-field label="Accept"><ss-checkbox></ss-checkbox></ss-field>`);
    const root = getRoot(page);
    const forAttr = root.querySelector('label')?.getAttribute('for');
    const input = root.querySelector('ss-checkbox input');

    expect(forAttr).toBeTruthy();
    expect(input?.getAttribute('id')).toBe(forAttr);
  });

  it('keeps an id the caller set on the control', async () => {
    const page = await field(`<ss-field label="Accept"><ss-checkbox x-id="terms"></ss-checkbox></ss-field>`);
    const root = getRoot(page);

    expect(root.querySelector('label')?.getAttribute('for')).toBe('terms');
    expect(root.querySelector('ss-checkbox input')?.getAttribute('id')).toBe('terms');
  });

  it('describes the control with the helper first and the error second', async () => {
    const page = await field(`<ss-field invalid helper-text="Helper" error-text="Error"><ss-checkbox></ss-checkbox></ss-field>`);
    const root = getRoot(page);
    const ids = root.querySelector('ss-checkbox input')?.getAttribute('aria-describedby')?.split(' ') ?? [];

    // The ids have to resolve to the text they claim to describe.
    expect(ids).toHaveLength(2);
    expect(root.querySelector(`#${ids[0]}`)?.textContent).toContain('Helper');
    expect(root.querySelector(`#${ids[1]}`)?.textContent).toContain('Error');
  });

  it('describes the control with the helper alone when it is valid', async () => {
    const page = await field(`<ss-field helper-text="Helper"><ss-checkbox></ss-checkbox></ss-field>`);
    const root = getRoot(page);
    const ids = root.querySelector('ss-checkbox input')?.getAttribute('aria-describedby')?.split(' ') ?? [];

    expect(ids).toHaveLength(1);
    expect(root.querySelector(`#${ids[0]}`)?.textContent).toContain('Helper');
  });

  it('keeps a description the caller put on the control', async () => {
    const page = await field(`<ss-field helper-text="Helper"><ss-checkbox described-by="external"></ss-checkbox></ss-field>`);
    const root = getRoot(page);
    const describedBy = root.querySelector('ss-checkbox input')?.getAttribute('aria-describedby') ?? '';

    expect(describedBy.split(' ')[0]).toBe('external');
    expect(describedBy.split(' ')).toHaveLength(2);
  });

  it('forwards required, disabled and invalid to the control', async () => {
    const page = await field(`<ss-field required disabled invalid><ss-checkbox></ss-checkbox></ss-field>`);
    const input = getRoot(page).querySelector('ss-checkbox input') as HTMLInputElement;

    expect(input.required).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('clears state it applied when the field stops asking for it', async () => {
    const page = await field(`<ss-field disabled><ss-checkbox></ss-checkbox></ss-field>`);
    const root = getRoot(page);
    expect((root.querySelector('ss-checkbox input') as HTMLInputElement).disabled).toBe(true);

    root.removeAttribute('disabled');
    await page.waitForChanges();

    expect((root.querySelector('ss-checkbox input') as HTMLInputElement).disabled).toBe(false);
  });

  it('leaves state the caller set on the control alone', async () => {
    const page = await field(`<ss-field><ss-checkbox disabled></ss-checkbox></ss-field>`);
    const input = getRoot(page).querySelector('ss-checkbox input') as HTMLInputElement;

    expect(input.disabled).toBe(true);
  });

  it('wires a native control through its own attributes', async () => {
    const page = await field(`<ss-field label="Name" required helper-text="Helper"><input type="text" /></ss-field>`);
    const root = getRoot(page);
    const input = root.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby') ?? '';

    expect(root.querySelector('label')?.getAttribute('for')).toBe(input.id);
    expect(root.querySelector(`#${describedBy}`)?.textContent).toContain('Helper');
    expect(input.hasAttribute('required')).toBe(true);
  });

  it('wires only the first control when several are supplied', async () => {
    const page = await field(`<ss-field required><ss-checkbox></ss-checkbox><ss-checkbox></ss-checkbox></ss-field>`);
    const inputs = getRoot(page).querySelectorAll('ss-checkbox input');

    expect((inputs[0] as HTMLInputElement).required).toBe(true);
    expect((inputs[1] as HTMLInputElement).required).toBe(false);
  });

  it('ignores slotted content that is not the control', async () => {
    const page = await field(`<ss-field label="Email"><span slot="helper">Help</span><ss-checkbox></ss-checkbox></ss-field>`);
    const root = getRoot(page);

    expect(root.querySelector('label')?.getAttribute('for')).toBe(root.querySelector('ss-checkbox input')?.getAttribute('id'));
  });
});
