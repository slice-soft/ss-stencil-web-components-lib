import { newSpecPage } from '@stencil/core/testing';
import { SsRadioGroup } from '../ss-radio-group';
import { SsRadio } from '../../../atoms/ss-radio/ss-radio';
import { SsTypography } from '../../../atoms/ss-typography/ss-typography';
import { getRoot } from '../../../../test/utils';

const components = [SsRadioGroup, SsRadio, SsTypography];

/** The group coordinates its radios after its own render, one tick later. */
async function group(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

const THREE_RADIOS = `
  <ss-radio value="free">Free</ss-radio>
  <ss-radio value="pro">Pro</ss-radio>
  <ss-radio value="team">Team</ss-radio>
`;

function inputs(page: Awaited<ReturnType<typeof group>>) {
  return Array.from(getRoot(page).querySelectorAll('ss-radio input')) as HTMLInputElement[];
}

describe('ss-radio-group semantics', () => {
  it('exposes the container as a radio group', async () => {
    const page = await group(`<ss-radio-group name="plan">${THREE_RADIOS}</ss-radio-group>`);
    expect(getRoot(page).querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  it('labels the group with an element the container points at', async () => {
    const page = await group(`<ss-radio-group name="plan" label="Choose a plan">${THREE_RADIOS}</ss-radio-group>`);
    const root = getRoot(page);
    const labelledBy = root.querySelector('[role="radiogroup"]')?.getAttribute('aria-labelledby');

    expect(root.querySelector(`#${labelledBy}`)?.textContent).toContain('Choose a plan');
  });

  it('describes the group with the helper first and the error second', async () => {
    const page = await group(`<ss-radio-group name="plan" invalid helper-text="Helper" error-text="Error">${THREE_RADIOS}</ss-radio-group>`);
    const root = getRoot(page);
    const ids = root.querySelector('[role="radiogroup"]')?.getAttribute('aria-describedby')?.split(' ') ?? [];

    expect(ids).toHaveLength(2);
    expect(root.querySelector(`#${ids[0]}`)?.textContent).toContain('Helper');
    expect(root.querySelector(`#${ids[1]}`)?.textContent).toContain('Error');
  });

  it('marks the group required and invalid on the container', async () => {
    const page = await group(`<ss-radio-group name="plan" required invalid>${THREE_RADIOS}</ss-radio-group>`);
    const container = getRoot(page).querySelector('[role="radiogroup"]');

    expect(container?.getAttribute('aria-required')).toBe('true');
    expect(container?.getAttribute('aria-invalid')).toBe('true');
  });

  it('hides the error until the group is invalid', async () => {
    const page = await group(`<ss-radio-group name="plan" error-text="Choose one">${THREE_RADIOS}</ss-radio-group>`);
    expect(getRoot(page).textContent).not.toContain('Choose one');

    getRoot(page).setAttribute('invalid', '');
    await page.waitForChanges();
    expect(getRoot(page).textContent).toContain('Choose one');
  });
});

describe('ss-radio-group coordination', () => {
  it('gives every radio the shared name', async () => {
    const page = await group(`<ss-radio-group name="plan">${THREE_RADIOS}</ss-radio-group>`);
    expect(inputs(page).map(input => input.name)).toEqual(['plan', 'plan', 'plan']);
  });

  it('checks the radio whose value matches the group value', async () => {
    const page = await group(`<ss-radio-group name="plan" value="pro">${THREE_RADIOS}</ss-radio-group>`);
    expect(inputs(page).map(input => input.checked)).toEqual([false, true, false]);
  });

  it('checks nothing when the group has no value', async () => {
    const page = await group(`<ss-radio-group name="plan">${THREE_RADIOS}</ss-radio-group>`);
    expect(inputs(page).some(input => input.checked)).toBe(false);
  });

  it('moves the checked state when the group value changes', async () => {
    const page = await group(`<ss-radio-group name="plan" value="pro">${THREE_RADIOS}</ss-radio-group>`);
    getRoot(page).setAttribute('value', 'team');
    await page.waitForChanges();

    expect(inputs(page).map(input => input.checked)).toEqual([false, false, true]);
  });

  it('requires the group through its first radio only', async () => {
    const page = await group(`<ss-radio-group name="plan" required>${THREE_RADIOS}</ss-radio-group>`);
    expect(inputs(page).map(input => input.required)).toEqual([true, false, false]);
  });

  it('disables and re-enables every radio with the group', async () => {
    const page = await group(`<ss-radio-group name="plan" disabled>${THREE_RADIOS}</ss-radio-group>`);
    expect(inputs(page).every(input => input.disabled)).toBe(true);

    getRoot(page).removeAttribute('disabled');
    await page.waitForChanges();
    expect(inputs(page).some(input => input.disabled)).toBe(false);
  });
});

describe('ss-radio-group events', () => {
  it('emits a group change carrying the selected value', async () => {
    const page = await group(`<ss-radio-group name="plan">${THREE_RADIOS}</ss-radio-group>`);
    const details: unknown[] = [];
    const root = getRoot(page);
    root.addEventListener('ssChange', (event: Event) => {
      if (event.target === root) details.push((event as CustomEvent).detail);
    });

    const pro = inputs(page)[1];
    pro.checked = true;
    pro.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect(details).toEqual([{ xId: undefined, name: 'plan', value: 'pro' }]);
  });

  // That the radio's own event is not *also* observed on the group is asserted
  // in the e2e suite: mock-doc implements stopImmediatePropagation as plain
  // stopPropagation, so it cannot express the difference.

  it('adopts the selected value as its own', async () => {
    const page = await group(`<ss-radio-group name="plan">${THREE_RADIOS}</ss-radio-group>`);
    const root = getRoot(page);

    const team = inputs(page)[2];
    team.checked = true;
    team.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect((root as unknown as { value?: string }).value).toBe('team');
    expect(root.getAttribute('value')).toBe('team');
  });

  it('does not let the radio change reach an ancestor as well', async () => {
    const page = await group(`<div id="ancestor"><ss-radio-group name="plan">${THREE_RADIOS}</ss-radio-group></div>`);
    const details: unknown[] = [];
    page.body.querySelector('#ancestor')?.addEventListener('ssChange', (event: Event) => details.push((event as CustomEvent).detail));

    const pro = page.body.querySelectorAll('ss-radio input')[1] as HTMLInputElement;
    pro.checked = true;
    pro.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    // One interaction, one payload shape: the group's, not the radio's.
    expect(details).toEqual([{ xId: undefined, name: 'plan', value: 'pro' }]);
  });

  it('emits an invalid event without a value when nothing is selected', async () => {
    const page = await group(`<ss-radio-group name="plan" required>${THREE_RADIOS}</ss-radio-group>`);
    const spy = jest.fn();
    getRoot(page).addEventListener('ssInvalid', spy);

    inputs(page)[0].dispatchEvent(new Event('invalid', { bubbles: true }));
    await page.waitForChanges();

    expect(spy.mock.calls[0][0].detail).toEqual({ xId: undefined, name: 'plan', value: undefined });
  });

  it('reports the current value on an invalid event when one is selected', async () => {
    const page = await group(`<ss-radio-group name="plan" value="pro" required>${THREE_RADIOS}</ss-radio-group>`);
    const spy = jest.fn();
    getRoot(page).addEventListener('ssInvalid', spy);

    inputs(page)[0].dispatchEvent(new Event('invalid', { bubbles: true }));
    await page.waitForChanges();

    expect(spy.mock.calls[0][0].detail.value).toBe('pro');
  });

  it('ignores radios that belong to a different group', async () => {
    const page = await group(`
      <ss-radio-group name="outer"><ss-radio value="a">A</ss-radio></ss-radio-group>
      <ss-radio value="loose">Loose</ss-radio>
    `);
    const spy = jest.fn();
    page.body.querySelector('ss-radio-group')?.addEventListener('ssChange', spy);

    const loose = page.body.querySelectorAll('ss-radio input')[1] as HTMLInputElement;
    loose.checked = true;
    loose.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('ss-radio-group without a name', () => {
  it('generates one, so the radios still form a native group', async () => {
    const page = await group(`<ss-radio-group>${THREE_RADIOS}</ss-radio-group>`);
    const names = inputs(page).map(input => input.name);

    expect(names[0]).toBeTruthy();
    expect(new Set(names).size).toBe(1);
  });

  it('reports the generated name in the change payload', async () => {
    const page = await group(`<ss-radio-group>${THREE_RADIOS}</ss-radio-group>`);
    const root = getRoot(page);
    const details: { name: string }[] = [];
    root.addEventListener('ssChange', (event: Event) => {
      if (event.target === root) details.push((event as CustomEvent).detail);
    });

    const pro = inputs(page)[1];
    pro.checked = true;
    pro.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();

    expect(details[0].name).toBe(inputs(page)[0].name);
  });
});
