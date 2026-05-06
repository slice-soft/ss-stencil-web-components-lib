import { newE2EPage } from '@stencil/core/testing';

describe('ss-button', () => {
  it('renders hydrated', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-button></ss-button>');
    const element = await page.find('ss-button');
    expect(element).toHaveClass('hydrated');
  });

  it('emits ssClick event on click', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-button x-id="btn1"></ss-button>');
    const spy = await page.spyOnEvent('ssClick');
    await page.evaluate(() => {
      document.querySelector('ss-button')?.shadowRoot?.querySelector('button')?.click();
    });
    expect(spy).toHaveReceivedEventDetail('btn1');
  });

  it('does not emit ssClick if disabled', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-button disabled x-id="btn2"></ss-button>');
    const spy = await page.spyOnEvent('ssClick');
    await page.evaluate(() => {
      document.querySelector('ss-button')?.shadowRoot?.querySelector('button')?.click();
    });
    expect(spy).not.toHaveReceivedEvent();
  });

  it('shows loading state', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-button status="loading"></ss-button>');
    const button = await page.find('ss-button >>> button');
    expect(await button.getAttribute('aria-busy')).not.toBeNull();
    expect(await button.classList.contains('ss-button--status-loading')).toBe(true);
  });

  it('applies fullWidth class', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-button full-width></ss-button>');
    const button = await page.find('ss-button >>> button');
    expect(await button.classList.contains('ss-button--full-width')).toBe(true);
  });

  it('renders with icon slot', async () => {
    const page = await newE2EPage();
    await page.setContent('<ss-button icon-position="left"><span slot="icon">icon</span>Label</ss-button>');
    const icon = await page.find('ss-button >>> .ss-button__icon--left');
    expect(icon).not.toBeNull();
  });
});
