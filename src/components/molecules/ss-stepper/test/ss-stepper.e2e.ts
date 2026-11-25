import type { E2EPage } from '@stencil/core/testing';
import { axNodeByRole, axNodeNamed, newTestPage, useTokens } from '../../../../test/utils';

const STEPS = (extra = '') => `<ss-step value="a" label="Cuenta"></ss-step><ss-step value="b" label="Pago" ${extra}></ss-step><ss-step value="c" label="Listo"></ss-step>`;

async function setup(html: string, width = 900): Promise<E2EPage> {
  const page = await newTestPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.setContent(`<meta charset="utf-8"><div id="box" style="width:${width}px">${html}</div>`);
  await useTokens(page);
  await page.waitForChanges();
  return page;
}

const visibleSteps = (page: E2EPage) =>
  page.evaluate(`Array.from(document.querySelectorAll('ss-step')).filter(s => s.getBoundingClientRect().height > 0).map(s => s.getAttribute('label'))`) as Promise<string[]>;

const stepText = (page: E2EPage, value: string) => page.evaluate(`document.querySelector('ss-step[value="${value}"]').shadowRoot.textContent`) as Promise<string>;

describe('ss-stepper', () => {
  it('is a list of steps with the current one marked', async () => {
    const page = await setup(`<ss-stepper value="b">${STEPS()}</ss-stepper>`);
    expect((await axNodeByRole(page, 'list')).name).toBe('Steps');
    expect(await page.evaluate(`Array.from(document.querySelectorAll('ss-step')).map(s => s.getAttribute('role') + ':' + (s.getAttribute('aria-current') || ''))`)).toEqual([
      'listitem:',
      'listitem:step',
      'listitem:',
    ]);
  });

  // A listitem takes no name from its content in Chrome's tree, so the words
  // are read from the step itself: they are text, not aria-hidden.
  it('completed and errored steps say so in words', async () => {
    const page = await setup(`<ss-stepper value="c">${STEPS('status="error"')}</ss-stepper>`);
    expect(await stepText(page, 'a')).toContain('Completed');
    expect(await stepText(page, 'b')).toContain('Error');
    expect(await stepText(page, 'c')).not.toContain('Completed');
  });

  it('read-only steps are not buttons', async () => {
    const page = await setup(`<ss-stepper value="b">${STEPS()}</ss-stepper>`);
    expect(await axNodeNamed(page, 'button', 'Cuenta Completed')).toBeNull();
    expect(await page.evaluate(`Array.from(document.querySelectorAll('ss-step')).some(s => s.shadowRoot.querySelector('button'))`)).toBe(false);
  });

  it('interactive: pressing a step changes value and emits', async () => {
    const page = await setup(`<ss-stepper interactive value="a">${STEPS()}</ss-stepper>`);
    const changes = await page.spyOnEvent('ssStepChange');
    expect(await axNodeNamed(page, 'button', 'Pago')).not.toBeNull();
    await (await page.find('ss-step[value="b"] >>> button')).click();
    await page.waitForChanges();
    expect(changes).toHaveReceivedEventDetail({ value: 'b', previous: 'a' });
    expect(await page.evaluate(`document.querySelector('ss-stepper').getAttribute('value')`)).toBe('b');
  });

  it('interactive: preventDefault keeps the current step', async () => {
    const page = await setup(`<ss-stepper interactive value="a">${STEPS()}</ss-stepper>`);
    await page.evaluate(`document.addEventListener('ssStepChange', e => e.preventDefault())`);
    await (await page.find('ss-step[value="c"] >>> button')).click();
    await page.waitForChanges();
    expect(await page.evaluate(`document.querySelector('ss-stepper').value`)).toBe('a');
  });

  it('disabled and current steps are not pressable', async () => {
    const page = await setup(`<ss-stepper interactive value="a">${STEPS('disabled')}</ss-stepper>`);
    const changes = await page.spyOnEvent('ssStepChange');
    expect(
      await page.evaluate(`['a', 'b', 'c'].map(v => document.querySelector('ss-step[value="' + v + '"]').shadowRoot.querySelector('button').getAttribute('aria-disabled'))`),
    ).toEqual(['true', 'true', null]);
    for (const v of ['a', 'b']) await (await page.find(`ss-step[value="${v}"] >>> button`)).click();
    await page.waitForChanges();
    expect(changes).toHaveReceivedEventTimes(0);
  });

  it('keyboard focus stays on a step once it becomes current', async () => {
    const page = await setup(`<ss-stepper interactive value="a">${STEPS()}</ss-stepper>`);
    await page.evaluate(`document.querySelector('ss-step[value="c"]').shadowRoot.querySelector('button').focus()`);
    await page.keyboard.press('Enter');
    await page.waitForChanges();
    expect(await page.evaluate(`document.querySelector('ss-stepper').value`)).toBe('c');
    expect(await page.evaluate(`document.activeElement === document.querySelector('ss-step[value="c"]') && !!document.activeElement.shadowRoot.activeElement`)).toBe(true);
  });

  it('the first change reports the step it leaves', async () => {
    const page = await setup(`<ss-stepper interactive>${STEPS()}</ss-stepper>`);
    const changes = await page.spyOnEvent('ssStepChange');
    await (await page.find('ss-step[value="b"] >>> button')).click();
    await page.waitForChanges();
    expect(changes).toHaveReceivedEventDetail({ value: 'b', previous: 'a' });
  });

  it('compact form draws no line to the hidden steps', async () => {
    const page = await setup(`<ss-stepper value="b">${STEPS()}</ss-stepper>`, 320);
    expect(await page.evaluate(`!!document.querySelector('ss-step[value="b"]').shadowRoot.querySelector('.ss-step__connector')`)).toBe(false);
  });

  it('keeps measuring after it is moved in the page', async () => {
    const page = await setup(`<ss-stepper value="b">${STEPS()}</ss-stepper>`, 900);
    await page.evaluate(
      `(() => { const b = document.createElement('div'); b.id = 'other'; b.style.width = '900px'; document.body.append(b); b.append(document.querySelector('ss-stepper')); })()`,
    );
    await page.waitForChanges();
    await page.evaluate(`document.getElementById('other').style.width = '320px'`);
    await page.waitForChanges();
    await page.waitForFunction(`!!document.querySelector('ss-stepper').shadowRoot.querySelector('.ss-stepper__summary')`, { timeout: 5000 });
  });

  it('compact form shows only the current step and the summary', async () => {
    const page = await setup(`<ss-stepper value="b">${STEPS()}</ss-stepper>`, 320);
    expect(await visibleSteps(page)).toEqual(['Pago']);
    expect(await page.evaluate(`document.querySelector('ss-stepper').shadowRoot.querySelector('.ss-stepper__summary').textContent`)).toBe('Step 2 of 3');
  });

  it('steps added after render are counted', async () => {
    const page = await setup(`<ss-stepper value="b">${STEPS()}</ss-stepper>`, 320);
    await page.evaluate(
      `(() => { const s = document.createElement('ss-step'); s.setAttribute('value', 'd'); s.setAttribute('label', 'Extra'); document.querySelector('ss-stepper').append(s); })()`,
    );
    await page.waitForChanges();
    expect(await page.evaluate(`document.querySelector('ss-stepper').shadowRoot.querySelector('.ss-stepper__summary').textContent`)).toBe('Step 2 of 4');
    expect(await page.evaluate(`document.querySelector('ss-step[value="d"]').derived`)).toBe('upcoming');
  });

  it('grows back from compact when its container widens', async () => {
    const page = await setup(`<ss-stepper value="b">${STEPS()}</ss-stepper>`, 320);
    await page.evaluate(`document.getElementById('box').style.width = '900px'`);
    await page.waitForChanges();
    await page.waitForFunction(`!document.querySelector('ss-stepper').shadowRoot.querySelector('.ss-stepper__summary')`);
    expect(await visibleSteps(page)).toEqual(['Cuenta', 'Pago', 'Listo']);
  });

  it('vertical never compacts', async () => {
    const page = await setup(`<ss-stepper orientation="vertical" value="b">${STEPS()}</ss-stepper>`, 320);
    expect(await visibleSteps(page)).toEqual(['Cuenta', 'Pago', 'Listo']);
  });

  it('the connector is complete after a complete step', async () => {
    const page = await setup(`<ss-stepper value="b">${STEPS()}</ss-stepper>`);
    const [first, second] = (await page.evaluate(
      `['a', 'b'].map(v => getComputedStyle(document.querySelector('ss-step[value="' + v + '"]').shadowRoot.querySelector('.ss-step__connector')).backgroundColor)`,
    )) as string[];
    expect(first).not.toBe(second);
    const primary = (await page.evaluate(
      `(() => { const d = document.createElement('div'); d.style.color = 'var(--ss-step-connector-complete-color)'; document.body.append(d); return getComputedStyle(d).color; })()`,
    )) as string;
    expect(first).toBe(primary);
  });
});
