import { newTestPage, useTokens } from './utils';
import { computedStyles } from './style-snapshot';

/**
 * The point of component tokens: moving one changes that component and
 * nothing else, and moving a system or brand role reaches every component
 * built on it.
 */
async function page(extraCss: string) {
  const p = await newTestPage();
  await p.setContent(
    [
      '<ss-button data-case="button" label="Label"></ss-button>',
      '<ss-input data-case="input" accessibility-label="x"></ss-input>',
      '<ss-textarea data-case="textarea" accessibility-label="x"></ss-textarea>',
      '<ss-select data-case="select" accessibility-label="x"><option>One</option></ss-select>',
      '<ss-combobox data-case="combobox" accessibility-label="x"><option value="One"></option></ss-combobox>',
    ].join(''),
  );
  await useTokens(p);
  const before = await computedStyles(p);
  await p.addStyleTag({ content: extraCss });
  await p.waitForChanges();
  return { before, after: await computedStyles(p) };
}

const changed = (before: Record<string, Record<string, string>>, after: Record<string, Record<string, string>>, prop: string) =>
  Object.keys(before).filter(key => before[key][prop] !== after[key][prop]);

describe('wave 1 component tokens', () => {
  it('a component token moves only its component', async () => {
    const { before, after } = await page(':root { --ss-button-size-md-padding-x: 40px; }');
    expect(after.button['padding-left']).toBe('40px');
    expect(changed(before, after, 'padding-left')).toEqual(['button']);
  });

  it('a brand color reaches every component built on it', async () => {
    const { before, after } = await page(':root { --ss-color-primary: #123456; --ss-color-input: #654321; }');
    expect(after.button['background-color']).toBe('rgb(18, 52, 86)');
    expect(changed(before, after, 'border-top-color').sort()).toEqual(['combobox', 'input', 'select', 'textarea']);
  });

  it('the control radius role reaches the components that use it unsized', async () => {
    const { after } = await page(':root { --ss-shape-radius-control: 3px; }');
    expect(after.button['border-top-left-radius']).toBe('3px');
  });
});
