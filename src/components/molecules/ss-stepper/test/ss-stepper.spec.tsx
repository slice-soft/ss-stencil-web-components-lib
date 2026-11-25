import { newSpecPage } from '@stencil/core/testing';
import { SsStep } from '../../ss-step/ss-step';
import { SsStepper } from '../ss-stepper';

const STEPS = '<ss-step value="a" label="Cuenta"></ss-step><ss-step value="b" label="Pago"></ss-step><ss-step value="c" label="Listo"></ss-step>';

async function render(attrs: string, steps = STEPS) {
  const page = await newSpecPage({ components: [SsStepper, SsStep], html: `<ss-stepper ${attrs}>${steps}</ss-stepper>` });
  const derived = Array.from(page.root.querySelectorAll('ss-step')).map(step => (step as unknown as { derived: string }).derived);
  return { page, derived };
}

describe('ss-stepper', () => {
  it('derives complete, current and upcoming from value', async () => {
    expect((await render('value="b"')).derived).toEqual(['complete', 'current', 'upcoming']);
  });

  it('no value makes the first step current', async () => {
    expect((await render('')).derived).toEqual(['current', 'upcoming', 'upcoming']);
  });

  it('steps without a value are known by their position', async () => {
    expect((await render('value="1"', '<ss-step label="A"></ss-step><ss-step label="B"></ss-step>')).derived).toEqual(['complete', 'current']);
  });

  it('an explicit complete shows on an upcoming step', async () => {
    const { page } = await render('value="a"', STEPS.replace('value="c"', 'value="c" status="complete"'));
    const last = page.root.querySelector('ss-step[value="c"]');
    expect(last.shadowRoot.querySelector('.ss-step').classList.contains('ss-step--complete')).toBe(true);
  });

  it('fills in the summary', async () => {
    const { page } = await render('value="b" summary-label="Paso {current} de {total}"');
    expect((page.rootInstance as unknown as { summary: string }).summary).toBe('Paso 2 de 3');
  });
});

describe('ss-stepper before ss-step is defined', () => {
  it('reads step values from their attributes', async () => {
    const page = await newSpecPage({ components: [SsStepper], html: `<ss-stepper value="b">${STEPS}</ss-stepper>` });
    expect((page.rootInstance as unknown as { current: number }).current).toBe(1);
  });
});
