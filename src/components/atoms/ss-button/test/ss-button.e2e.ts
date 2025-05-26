import { newE2EPage } from '@stencil/core/testing';

describe('ss-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-button></ss-button>');

    const element = await page.find('ss-button');
    expect(element).toHaveClass('hydrated');
  });
});
