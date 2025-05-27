import { newE2EPage } from '@stencil/core/testing';

describe('ss-typography', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-typography></ss-typography>');

    const element = await page.find('ss-typography');
    expect(element).toHaveClass('hydrated');
  });

  it('renders with all props and classes', async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<ss-typography as="h3" font-size="xl" align="right" color="secondary" font-weight="medium" line-height="tight" letter-spacing="tight" truncate transform="capitalize" x-id="e2e-id">E2E Test</ss-typography>`,
    );
    const el = await page.find('ss-typography >>> h3');
    expect(el).toHaveClass('ss-typography');
    expect(el).toHaveClass('ss-typography--secondary');
    expect(el).toHaveClass('ss-typography--align-right');
    expect(el).toHaveClass('ss-typography--font-weight-medium');
    expect(el).toHaveClass('ss-typography--line-height-tight');
    expect(el).toHaveClass('ss-typography--letter-spacing-tight');
    expect(el).toHaveClass('ss-typography--font-size-xl');
    expect(el).toHaveClass('ss-typography--truncate');
    expect(el).toHaveClass('ss-typography--transform-capitalize');
    expect(el.getAttribute('id')).toBe('e2e-id');
  });

  it('renders slot content', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-typography>Slot E2E</ss-typography>');
    const el = await page.find('ss-typography');
    expect(el.textContent).toContain('Slot E2E');
  });
});
