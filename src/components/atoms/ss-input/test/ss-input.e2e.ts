import { newE2EPage } from '@stencil/core/testing';

describe('ss-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-input></ss-input>');

    const element = await page.find('ss-input');
    expect(element).toHaveClass('hydrated');
  });
});
