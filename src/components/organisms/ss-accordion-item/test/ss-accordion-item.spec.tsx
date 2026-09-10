import { newSpecPage } from '@stencil/core/testing';
import { SsAccordionItem } from '../ss-accordion-item';
import { getRoot } from '../../../../test/utils';

async function item(html: string) {
  const page = await newSpecPage({ components: [SsAccordionItem], html });
  await page.waitForChanges();
  const root = getRoot(page) as HTMLElement & { open: boolean };
  const button = () => root.querySelector('.ss-accordion-item__trigger') as HTMLButtonElement;
  const panel = () => root.querySelector('.ss-accordion-item__panel') as HTMLElement;
  return { page, root, button, panel };
}

describe('ss-accordion-item rendering', () => {
  it('is a heading holding a button that controls a region', async () => {
    const { root, button, panel } = await item(`<ss-accordion-item heading="Shipping">Ships in two days.</ss-accordion-item>`);

    expect(root.querySelector('h3')?.contains(button())).toBe(true);
    expect(button().getAttribute('aria-controls')).toBe(panel().id);
    expect(panel().getAttribute('role')).toBe('region');
    expect(panel().getAttribute('aria-labelledby')).toBe(button().id);
  });

  it('starts collapsed, and says so', async () => {
    const { button, panel } = await item(`<ss-accordion-item heading="Shipping">Body</ss-accordion-item>`);

    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(panel().hasAttribute('hidden')).toBe(true);
  });

  it('starts expanded when open', async () => {
    const { button, panel } = await item(`<ss-accordion-item open heading="Shipping">Body</ss-accordion-item>`);

    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(panel().hasAttribute('hidden')).toBe(false);
  });

  it('uses the heading level asked for, within one to six', async () => {
    expect((await item(`<ss-accordion-item heading-level="2" heading="A">x</ss-accordion-item>`)).root.querySelector('h2')).not.toBeNull();
    expect((await item(`<ss-accordion-item heading-level="9" heading="A">x</ss-accordion-item>`)).root.querySelector('h6')).not.toBeNull();
    expect((await item(`<ss-accordion-item heading-level="0" heading="A">x</ss-accordion-item>`)).root.querySelector('h3')).not.toBeNull();
  });

  it('prefers a slotted heading over the prop', async () => {
    const { button } = await item(`<ss-accordion-item heading="Prop"><span slot="heading">Slotted</span>Body</ss-accordion-item>`);

    expect(button().textContent).toContain('Slotted');
    expect(button().textContent).not.toContain('Prop');
  });
});

describe('ss-accordion-item interaction', () => {
  it('toggles when its header is pressed, and reports it', async () => {
    const { page, root, button, panel } = await item(`<ss-accordion-item value="shipping" heading="Shipping">Body</ss-accordion-item>`);
    const changes: unknown[] = [];
    root.addEventListener('ssOpenChange', event => changes.push((event as CustomEvent).detail));

    button().click();
    await page.waitForChanges();
    expect(root.open).toBe(true);
    expect(panel().hasAttribute('hidden')).toBe(false);

    button().click();
    await page.waitForChanges();
    expect(root.open).toBe(false);

    expect(changes).toEqual([
      { xId: undefined, value: 'shipping', open: true },
      { xId: undefined, value: 'shipping', open: false },
    ]);
  });

  it('ignores its header while disabled', async () => {
    const { page, root, button } = await item(`<ss-accordion-item disabled heading="Shipping">Body</ss-accordion-item>`);

    expect(button().hasAttribute('disabled')).toBe(true);
    button().click();
    await page.waitForChanges();

    expect(root.open).toBe(false);
  });
});
