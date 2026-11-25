import { newSpecPage } from '@stencil/core/testing';
import { SsStep } from '../ss-step';

const marker = async (html: string) => {
  const page = await newSpecPage({ components: [SsStep], html });
  return page.root.shadowRoot.querySelector('.ss-step__marker');
};

describe('ss-step', () => {
  it('shows its number', async () => {
    const page = await newSpecPage({ components: [SsStep], html: '<ss-step label="Pago"></ss-step>' });
    page.root.index = 1;
    await page.waitForChanges();
    expect(page.root.shadowRoot.querySelector('.ss-step__marker').textContent).toBe('2');
  });

  it('a complete step shows a check', async () => {
    expect((await marker('<ss-step status="complete"></ss-step>')).querySelector('.ss-step__check')).not.toBeNull();
  });

  it('a step in error shows a mark, not a check', async () => {
    const m = await marker('<ss-step status="error"></ss-step>');
    expect(m.querySelector('.ss-step__check')).toBeNull();
    expect(m.textContent).toBe('!');
  });

  it('is a listitem with no line after the last step', async () => {
    const page = await newSpecPage({ components: [SsStep], html: '<ss-step last></ss-step>' });
    expect(page.root.getAttribute('role')).toBe('listitem');
    expect(page.root.shadowRoot.querySelector('.ss-step__connector')).toBeNull();
  });
});
