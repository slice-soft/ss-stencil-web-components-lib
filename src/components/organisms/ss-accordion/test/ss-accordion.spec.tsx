import { newSpecPage } from '@stencil/core/testing';
import { SsAccordion } from '../ss-accordion';
import { SsAccordionItem } from '../../ss-accordion-item/ss-accordion-item';
import { getRoot } from '../../../../test/utils';

const ACCORDION = (attrs = '') => `
  <ss-accordion ${attrs}>
    <ss-accordion-item value="shipping" heading="Shipping" open>Ships in two days.</ss-accordion-item>
    <ss-accordion-item value="returns" heading="Returns">Thirty days.</ss-accordion-item>
    <ss-accordion-item value="warranty" heading="Warranty">One year.</ss-accordion-item>
  </ss-accordion>
`;

type Item = HTMLElement & { open: boolean };

async function accordion(html: string) {
  const page = await newSpecPage({ components: [SsAccordion, SsAccordionItem], html });
  await page.waitForChanges();
  const root = getRoot(page);
  const items = () => Array.from(root.querySelectorAll<Item>('ss-accordion-item')).filter(i => i.closest('ss-accordion') === root);
  const press = async (index: number) => {
    (items()[index].querySelector('.ss-accordion-item__trigger') as HTMLElement).click();
    await page.waitForChanges();
  };
  return { page, root, items, press };
}

describe('ss-accordion with one section open at a time', () => {
  it('closes the open section when another opens', async () => {
    const { items, press } = await accordion(ACCORDION());

    await press(1);

    expect(items().map(i => i.open)).toEqual([false, true, false]);
  });

  it('lets the open section close, leaving none open', async () => {
    const { items, press } = await accordion(ACCORDION());

    await press(0);

    expect(items().map(i => i.open)).toEqual([false, false, false]);
  });

  it('keeps only the first when the markup opens several', async () => {
    const { items } = await accordion(ACCORDION().replace('heading="Returns"', 'heading="Returns" open'));
    expect(items().map(i => i.open)).toEqual([true, false, false]);
  });

  it('is not moved by an unrelated open-change from inside a section', async () => {
    // A popover or dropdown inside a section emits `ssOpenChange` too.
    const { page, root, items } = await accordion(ACCORDION().replace('Thirty days.', '<div id="inner">Thirty days.</div>'));

    root.querySelector('#inner')!.dispatchEvent(new CustomEvent('ssOpenChange', { bubbles: true, detail: { open: true } }));
    await page.waitForChanges();

    expect(items().map(i => i.open)).toEqual([true, false, false]);
  });

  it('leaves the sections of an accordion nested inside it alone', async () => {
    const { page, root, items } = await accordion(`
      <ss-accordion>
        <ss-accordion-item heading="Outer" open>
          <ss-accordion>
            <ss-accordion-item heading="Inner one" open>a</ss-accordion-item>
            <ss-accordion-item heading="Inner two">b</ss-accordion-item>
          </ss-accordion>
        </ss-accordion-item>
        <ss-accordion-item heading="Outer two">c</ss-accordion-item>
      </ss-accordion>
    `);
    // Looked up from the inner accordion rather than by a descendant selector
    // from the outer one: mock-doc does not count the element a query runs on
    // as an ancestor, where a browser does.
    const inner = Array.from(root.querySelector('ss-accordion')!.querySelectorAll<Item>('ss-accordion-item'));

    (inner[1].querySelector('.ss-accordion-item__trigger') as HTMLElement).click();
    await page.waitForChanges();

    // The inner accordion closed its own first section; the outer one did not react.
    expect(inner.map(i => i.open)).toEqual([false, true]);
    expect(items().map(i => i.open)).toEqual([true, false]);
  });
});

describe('ss-accordion with several sections open', () => {
  it('leaves the others open', async () => {
    const { items, press } = await accordion(ACCORDION('multiple'));

    await press(1);
    await press(2);

    expect(items().map(i => i.open)).toEqual([true, true, true]);
  });
});
