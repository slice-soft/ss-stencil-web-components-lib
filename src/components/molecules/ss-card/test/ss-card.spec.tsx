import { newSpecPage } from '@stencil/core/testing';
import { SsCard } from '../ss-card';
import { getRoot, getShadowRoot } from '../../../../test/utils';

const components = [SsCard];

async function card(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return getShadowRoot(getRoot(page));
}

describe('ss-card presentation', () => {
  it('is elevated with medium padding by default', async () => {
    const root = await card(`<ss-card>Body</ss-card>`);
    const container = root.querySelector('.ss-card');

    expect(container?.className).toContain('ss-card--elevated');
    expect(container?.className).toContain('ss-card--padding-md');
  });

  it.each(['elevated', 'outlined', 'filled'])('applies the %s style', async style => {
    const root = await card(`<ss-card x-style="${style}">Body</ss-card>`);
    expect(root.querySelector('.ss-card')?.className).toContain(`ss-card--${style}`);
  });

  it.each(['none', 'sm', 'md', 'lg'])('applies %s padding', async padding => {
    const root = await card(`<ss-card padding="${padding}">Body</ss-card>`);
    expect(root.querySelector('.ss-card')?.className).toContain(`ss-card--padding-${padding}`);
  });

  it('expands to full width on request', async () => {
    const root = await card(`<ss-card full-width>Body</ss-card>`);
    expect(root.querySelector('.ss-card')?.className).toContain('ss-card--full-width');
  });

  it('applies its id to the rendered container, not only the host', async () => {
    const root = await card(`<ss-card x-id="summary">Body</ss-card>`);
    expect(root.querySelector('.ss-card')?.getAttribute('id')).toBe('summary');
  });

  it('resolves inline styles from a CSS string', async () => {
    const root = await card(`<ss-card inline-styles="max-width: 20rem">Body</ss-card>`);
    expect(root.querySelector<HTMLElement>('.ss-card')?.style.maxWidth).toBe('20rem');
  });
});

describe('ss-card regions', () => {
  it('offers a slot for every region', async () => {
    const root = await card(`<ss-card>Body</ss-card>`);
    const names = Array.from(root.querySelectorAll('slot')).map(slot => slot.getAttribute('name'));

    expect(names).toEqual(['media', 'header', null, 'footer']);
  });

  it('keeps the regions in reading order', async () => {
    const root = await card(`<ss-card>Body</ss-card>`);
    const regions = Array.from(root.querySelectorAll('.ss-card > div')).map(region => region.className);

    expect(regions).toEqual(['ss-card__media', 'ss-card__header', 'ss-card__content', 'ss-card__footer']);
  });

  it('declares no events of its own', async () => {
    // The card is layout: a clickable container would have to invent role and
    // keyboard semantics that ss-button and ss-link already carry.
    const page = await newSpecPage({ components, html: `<ss-card>Body</ss-card>` });
    const proto = Object.getPrototypeOf(getRoot(page));
    const emitters = Object.getOwnPropertyNames(proto).filter(name => name.startsWith('ss') && name !== 'ssCard');

    expect(emitters).toEqual([]);
  });
});
