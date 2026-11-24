import { newTestPage, useTokens } from './utils';
import { computedParts } from './style-snapshot';

const PARTS = {
  modal: '.ss-modal__dialog',
  popover: '.ss-popover__panel',
  dropdown: '.ss-dropdown__menu',
  tabs: '.ss-tabs__tab--selected',
  nav: 'ss-nav-item[href="#a"] .ss-nav-item',
  table: '.ss-table__scroll',
};

async function page(extraCss: string) {
  const p = await newTestPage();
  await p.setContent(
    [
      '<ss-modal data-case="modal" open size="md" heading="M"><p>Body</p></ss-modal>',
      '<ss-popover data-case="popover" open heading="P"><ss-button slot="trigger" label="P"></ss-button><p>Body</p></ss-popover>',
      '<ss-dropdown data-case="dropdown" open><ss-button slot="trigger" label="D"></ss-button><ss-dropdown-item value="a">A</ss-dropdown-item></ss-dropdown>',
      '<ss-tabs data-case="tabs" accessibility-label="T"><ss-tab value="a" label="A">A</ss-tab><ss-tab value="b" label="B">B</ss-tab></ss-tabs>',
      '<ss-nav data-case="nav" value="#a" accessibility-label="N"><ss-nav-item href="#a">A</ss-nav-item></ss-nav>',
      '<ss-table data-case="table" caption="T"></ss-table>',
    ].join(''),
  );
  await p.evaluate(`Object.assign(document.querySelector('ss-table'), { columns: [{ key: 'a', label: 'A' }], rows: [{ a: 1 }] })`);
  await useTokens(p);
  const measure = async () => {
    const all = await computedParts(p, PARTS, undefined, { extra: ['max-width'] });
    return Object.fromEntries(
      Object.entries(all)
        .filter(([key]) => key.split('/')[0] === key.split('/')[1])
        .map(([key, v]) => [key.split('/')[0], v]),
    );
  };
  const before = await measure();
  await p.addStyleTag({ content: extraCss });
  await p.waitForChanges();
  return { before, after: await measure() };
}

const changed = (before: Record<string, Record<string, string>>, after: Record<string, Record<string, string>>, ...props: string[]) =>
  Object.keys(before)
    .filter(key => props.some(prop => before[key][prop] !== after[key][prop]))
    .sort();

describe('wave 5 component tokens', () => {
  it('a component token moves only its component', async () => {
    const { before, after } = await page(':root { --ss-tabs-selected-foreground: rgb(1, 2, 3); }');
    expect(after.tabs.color).toBe('rgb(1, 2, 3)');
    expect(changed(before, after, 'color')).toEqual(['tabs']);
  });

  it('a shape role reaches every organism drawn with it', async () => {
    // shape.radius.surface rounds dialogs and popovers; menus have their own
    // role (shape.radius.menu), and nav items and tables use the control radius.
    const { before, after } = await page(':root { --ss-shape-radius-surface: 30px; }');
    expect(changed(before, after, 'border-top-left-radius')).toEqual(['modal', 'popover']);
  });

  it('an overlay width moves the dialogs of that size', async () => {
    const { before, after } = await page(':root { --ss-layout-overlay-width-md: 600px; }');
    expect(after.modal['max-width']).toBe('600px');
    expect(changed(before, after, 'max-width')).toEqual(['modal']);
  });

  it('the menu radius moves dropdown menus alone', async () => {
    const { before, after } = await page(':root { --ss-shape-radius-menu: 30px; }');
    expect(changed(before, after, 'border-top-left-radius')).toEqual(['dropdown']);
  });
});
