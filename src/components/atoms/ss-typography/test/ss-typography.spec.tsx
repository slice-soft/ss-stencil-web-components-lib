import { newSpecPage } from '@stencil/core/testing';
import { SsTypography } from '../ss-typography';

describe('ss-typography', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography></ss-typography>`,
    });
    expect(page.root).toEqualHtml(`
      <ss-typography><p class="ss-typography ss-typography--black ss-typography--align-left ss-typography--font-weight-regular ss-typography--line-height-normal ss-typography--letter-spacing-normal ss-typography--font-size-md"></p></ss-typography>
    `);
  });

  it('applies the correct HTML tag', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography as="h2">Heading</ss-typography>`,
    });
    expect(page.root.querySelector('h2')).not.toBeNull();
  });

  it('applies fontSize, align, color, fontWeight, lineHeight, letterSpacing, truncate, and transform classes', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography font-size="lg" align="center" color="primary" font-weight="bold" line-height="relaxed" letter-spacing="wide" truncate transform="uppercase">Test</ss-typography>`,
    });
    const el = page.root.querySelector('p');
    expect(el.classList.contains('ss-typography--font-size-lg')).toBe(true);
    expect(el.classList.contains('ss-typography--align-center')).toBe(true);
    expect(el.classList.contains('ss-typography--primary')).toBe(true);
    expect(el.classList.contains('ss-typography--font-weight-bold')).toBe(true);
    expect(el.classList.contains('ss-typography--line-height-relaxed')).toBe(true);
    expect(el.classList.contains('ss-typography--letter-spacing-wide')).toBe(true);
    expect(el.classList.contains('ss-typography--truncate')).toBe(true);
    expect(el.classList.contains('ss-typography--transform-uppercase')).toBe(true);
  });

  it('applies inlineStyles as object', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography inline-styles="color: red; font-size: 20px;"></ss-typography>`,
    });
    // page.root.inlineStyles = { color: 'red', fontSize: '20px' };
    await page.waitForChanges();
    expect(page.root.querySelector('p').style.color).toBe('red');
    expect(page.root.querySelector('p').style.fontSize).toBe('20px');
  });

  it('applies inlineStyles as string', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography inline-styles="color: blue; font-size: 18px;"></ss-typography>`,
    });
    expect(page.root.querySelector('p').style.color).toBe('blue');
    expect(page.root.querySelector('p').style.fontSize).toBe('18px');
  });

  it('renders slot content', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography>Slot Content</ss-typography>`,
    });
    expect(page.root.textContent).toContain('Slot Content');
  });

  it('applies xId to the rendered tag', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography x-id="my-id"></ss-typography>`,
    });
    expect(page.root.querySelector('p').id).toBe('my-id');
  });
});
