import { newSpecPage } from '@stencil/core/testing';
import { SsTypography } from '../ss-typography';

describe('ss-typography', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography></ss-typography>`,
    });
    expect(page.root).toEqualHtml(`
      <ss-typography><p class="ss-typography ss-typography--align-left ss-typography--font-size-md ss-typography--font-weight-regular ss-typography--foreground ss-typography--letter-spacing-normal ss-typography--line-height-normal"></p></ss-typography>
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
      html: `<ss-typography></ss-typography>`,
    });
    (page.root as any).inlineStyles = { color: 'red', fontSize: '20px' };
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

  it('supports the largest documented typography size', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography font-size="4xl"></ss-typography>`,
    });
    expect(page.root.querySelector('p').classList.contains('ss-typography--font-size-4xl')).toBe(true);
  });

  it('applies inherit color class', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography color="inherit"></ss-typography>`,
    });
    expect(page.root.querySelector('p').classList.contains('ss-typography--inherit')).toBe(true);
  });

  it('renders extended inline tags', async () => {
    for (const tag of ['small', 'strong', 'em', 'code'] as const) {
      const page = await newSpecPage({
        components: [SsTypography],
        html: `<ss-typography as="${tag}"></ss-typography>`,
      });
      expect(page.root.querySelector(tag)).not.toBeNull();
    }
  });
});

describe('ss-typography — level (heading convenience)', () => {
  it('renders h1 for level 1 with 4xl size, bold weight, tight line-height, and display family', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography level="1">Title</ss-typography>`,
    });
    const h = page.root.querySelector('h1');
    expect(h).not.toBeNull();
    expect(h.textContent).toBe('Title');
    expect(h.classList.contains('ss-typography--font-size-4xl')).toBe(true);
    expect(h.classList.contains('ss-typography--font-weight-bold')).toBe(true);
    expect(h.classList.contains('ss-typography--line-height-tight')).toBe(true);
    expect(h.classList.contains('ss-typography--family-display')).toBe(true);
  });

  it('applies level-based default sizes', async () => {
    const expected: [number, string][] = [
      [1, '4xl'],
      [2, '3xl'],
      [3, '2xl'],
      [4, 'xl'],
      [5, 'lg'],
      [6, 'md'],
    ];
    for (const [lvl, size] of expected) {
      const page = await newSpecPage({
        components: [SsTypography],
        html: `<ss-typography level="${lvl}"></ss-typography>`,
      });
      const h = page.root.querySelector(`h${lvl}`);
      expect(h.classList.contains(`ss-typography--font-size-${size}`)).toBe(true);
    }
  });

  it('explicit font-size overrides level default', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography level="1" font-size="xl">Title</ss-typography>`,
    });
    const h = page.root.querySelector('h1');
    expect(h.classList.contains('ss-typography--font-size-xl')).toBe(true);
    expect(h.classList.contains('ss-typography--font-size-4xl')).toBe(false);
  });

  it('explicit font-weight overrides level default', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography level="2" font-weight="regular">Heading</ss-typography>`,
    });
    const h = page.root.querySelector('h2');
    expect(h.classList.contains('ss-typography--font-weight-regular')).toBe(true);
    expect(h.classList.contains('ss-typography--font-weight-bold')).toBe(false);
  });

  it('explicit line-height overrides level default', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography level="2" line-height="relaxed">Heading</ss-typography>`,
    });
    const h = page.root.querySelector('h2');
    expect(h.classList.contains('ss-typography--line-height-relaxed')).toBe(true);
  });

  it('explicit family overrides level default', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography level="1" family="sans">Title</ss-typography>`,
    });
    const h = page.root.querySelector('h1');
    expect(h.classList.contains('ss-typography--family-display')).toBe(false);
    expect(h.classList.contains('ss-typography--family-mono')).toBe(false);
  });
});

describe('ss-typography — family', () => {
  it('applies display class for family="display"', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography family="display">Text</ss-typography>`,
    });
    expect(page.root.querySelector('p').classList.contains('ss-typography--family-display')).toBe(true);
  });

  it('applies mono class for family="mono"', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography family="mono">Text</ss-typography>`,
    });
    expect(page.root.querySelector('p').classList.contains('ss-typography--family-mono')).toBe(true);
  });

  it('applies mono class automatically for as="code"', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography as="code">const x = 1</ss-typography>`,
    });
    expect(page.root.querySelector('code').classList.contains('ss-typography--family-mono')).toBe(true);
  });

  it('does not add a family class for the default sans family', async () => {
    const page = await newSpecPage({
      components: [SsTypography],
      html: `<ss-typography></ss-typography>`,
    });
    const el = page.root.querySelector('p');
    expect(el.classList.contains('ss-typography--family-display')).toBe(false);
    expect(el.classList.contains('ss-typography--family-mono')).toBe(false);
  });
});
