import { newTestPage, useTokens } from './utils';
import { computedParts } from './style-snapshot';

const PARTS = {
  'card': '.ss-card__content',
  'button-group': '.ss-button-group',
  'breadcrumb': '.ss-breadcrumb__list',
  'input-group': '.ss-input-group__addon--start',
  'field': '.ss-field',
};

async function page(extraCss: string) {
  const p = await newTestPage();
  await p.setContent(
    [
      '<ss-card data-case="card" padding="sm">Body</ss-card>',
      '<ss-button-group data-case="button-group" accessibility-label="g"><ss-button label="A"></ss-button><ss-button label="B"></ss-button></ss-button-group>',
      '<ss-breadcrumb data-case="breadcrumb"><ss-breadcrumb-item href="#a" label="Home"></ss-breadcrumb-item><ss-breadcrumb-item label="Here"></ss-breadcrumb-item></ss-breadcrumb>',
      '<ss-input-group data-case="input-group"><span slot="start">$</span><ss-input accessibility-label="x"></ss-input></ss-input-group>',
      '<ss-field data-case="field" label="Name"><ss-input accessibility-label="x"></ss-input></ss-field>',
    ].join(''),
  );
  await useTokens(p);
  const measure = async () => {
    const all = await computedParts(p, PARTS, undefined, { extra: ['row-gap', 'column-gap'] });
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

describe('wave 4 component tokens', () => {
  it('a component token moves only its component', async () => {
    const { before, after } = await page(':root { --ss-card-padding-sm: 30px; }');
    expect(after.card['padding-left']).toBe('30px');
    expect(changed(before, after, 'padding-left', 'gap', 'row-gap', 'column-gap')).toEqual(['card']);
  });

  it('a spacing role reaches every molecule spaced with it', async () => {
    // space.2 is the card's small padding and the gap of button groups and
    // breadcrumbs; the field's gap is space.1.
    const { before, after } = await page(':root { --ss-space-2: 30px; }');
    expect(changed(before, after, 'padding-left', 'gap', 'row-gap', 'column-gap')).toEqual(['breadcrumb', 'button-group', 'card']);
  });

  it('a semantic color reaches the molecules painted with it', async () => {
    const { before, after } = await page(':root { --ss-color-muted: rgb(1, 2, 3); }');
    expect(after['input-group']['background-color']).toBe('rgb(1, 2, 3)');
    expect(changed(before, after, 'background-color')).toEqual(['input-group']);
  });
});
