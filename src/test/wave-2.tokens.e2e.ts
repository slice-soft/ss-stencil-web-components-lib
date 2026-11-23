import { newTestPage, useTokens } from './utils';
import { computedParts } from './style-snapshot';

const PARTS = {
  checkbox: '.ss-checkbox__control',
  radio: '.ss-radio__control',
  switch: '.ss-switch__track',
  label: '.ss-label',
};

async function page(extraCss: string) {
  const p = await newTestPage();
  await p.setContent(
    [
      '<ss-checkbox data-case="checkbox" label="A" checked></ss-checkbox>',
      '<ss-radio data-case="radio" label="B" checked></ss-radio>',
      '<ss-switch data-case="switch" label="C" checked></ss-switch>',
      '<ss-label data-case="label" label="D"></ss-label>',
    ].join(''),
  );
  await useTokens(p);
  const measure = async () => {
    const all = await computedParts(p, PARTS);
    return Object.fromEntries(
      Object.entries(all)
        .filter(([key]) => key.endsWith(`/${key.split('/')[0]}`))
        .map(([key, v]) => [key.split('/')[0], v]),
    );
  };
  const before = await measure();
  await p.addStyleTag({ content: extraCss });
  await p.waitForChanges();
  return { before, after: await measure() };
}

const changed = (before: Record<string, Record<string, string>>, after: Record<string, Record<string, string>>, prop: string) =>
  Object.keys(before)
    .filter(key => before[key][prop] !== after[key][prop])
    .sort();

describe('wave 2 component tokens', () => {
  it('a component token moves only its component', async () => {
    const { before, after } = await page(':root { --ss-checkbox-checked-background: rgb(1, 2, 3); }');
    expect(after.checkbox['background-color']).toBe('rgb(1, 2, 3)');
    expect(changed(before, after, 'background-color')).toEqual(['checkbox']);
  });

  it('a brand color reaches every component built on it', async () => {
    const { before, after } = await page(':root { --ss-color-primary: rgb(1, 2, 3); }');
    expect(changed(before, after, 'border-top-color')).toEqual(['checkbox', 'radio', 'switch']);
  });

  it('a system role reaches every component that shares it', async () => {
    // choice.size.md.font-size sizes checkbox, radio, switch and label at md.
    const { before, after } = await page(':root { --ss-choice-size-md-font-size: 21px; }');
    expect(changed(before, after, 'font-size')).toEqual(['checkbox', 'label', 'radio', 'switch']);
    expect(after.label['font-size']).toBe('21px');
  });
});
