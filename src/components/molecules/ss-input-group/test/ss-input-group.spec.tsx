import { newSpecPage } from '@stencil/core/testing';
import { SsInputGroup } from '../ss-input-group';
import { SsInput } from '../../../atoms/ss-input/ss-input';
import { getRoot, getShadowRoot } from '../../../../test/utils';

const components = [SsInputGroup, SsInput];

async function group(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

type Page = Awaited<ReturnType<typeof group>>;

function control(page: Page) {
  return getRoot(page).querySelector('ss-input') as unknown as Record<string, unknown>;
}

function rendered(page: Page) {
  return getShadowRoot(getRoot(page));
}

describe('ss-input-group seam', () => {
  it('joins the control on the side that has an addon', async () => {
    const page = await group(`<ss-input-group><span slot="start">$</span><ss-input></ss-input></ss-input-group>`);
    expect(control(page).join).toBe('start');
  });

  it('joins the other side when the addon is after the control', async () => {
    const page = await group(`<ss-input-group><ss-input></ss-input><span slot="end">kg</span></ss-input-group>`);
    expect(control(page).join).toBe('end');
  });

  it('joins both sides when the control sits between addons', async () => {
    const page = await group(`<ss-input-group><span slot="start">$</span><ss-input></ss-input><span slot="end">.00</span></ss-input-group>`);
    expect(control(page).join).toBe('both');
  });

  it('leaves the control unjoined when it stands alone', async () => {
    const page = await group(`<ss-input-group><ss-input></ss-input></ss-input-group>`);
    expect(control(page).join).toBeUndefined();
  });
});

describe('ss-input-group coordination', () => {
  it('shares its size with the control', async () => {
    const page = await group(`<ss-input-group size="lg"><ss-input></ss-input></ss-input-group>`);
    expect(control(page).size).toBe('lg');
  });

  it('disables the control', async () => {
    const page = await group(`<ss-input-group disabled><ss-input></ss-input></ss-input-group>`);
    expect(control(page).disabled).toBe(true);
  });

  it('leaves the control alone for anything the group was not given', async () => {
    const page = await group(`<ss-input-group size="lg"><ss-input placeholder="Amount" x-style="outline"></ss-input></ss-input-group>`);

    // The group owns the seam and the sizing; the field's own configuration is
    // still the caller's.
    expect(control(page).placeholder).toBe('Amount');
    expect(control(page).xStyle).toBe('outline');
  });

  it('ignores a control belonging to a nested group', async () => {
    const page = await group(`
      <ss-input-group size="lg">
        <ss-input x-id="outer"></ss-input>
        <ss-input-group size="xs"><ss-input x-id="inner"></ss-input></ss-input-group>
      </ss-input-group>
    `);
    const all = Array.from(page.body.querySelectorAll('ss-input')) as unknown as Record<string, unknown>[];

    expect(all[0].size).toBe('lg');
    expect(all[1].size).toBe('xs');
  });
});

describe('ss-input-group addons', () => {
  it('marks which sides carry an addon', async () => {
    const page = await group(`<ss-input-group><span slot="start">$</span><ss-input></ss-input></ss-input-group>`);
    const container = rendered(page).querySelector('.ss-input-group');

    expect(container?.className).toContain('ss-input-group--has-start');
    expect(container?.className).not.toContain('ss-input-group--has-end');
  });

  it('renders a slot for each addon and for the control', async () => {
    const page = await group(`<ss-input-group><ss-input></ss-input></ss-input-group>`);
    const names = Array.from(rendered(page).querySelectorAll('slot')).map(slot => slot.getAttribute('name'));

    expect(names).toEqual(['start', null, 'end']);
  });
});
