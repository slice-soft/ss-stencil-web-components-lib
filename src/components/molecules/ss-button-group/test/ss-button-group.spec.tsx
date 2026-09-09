import { newSpecPage } from '@stencil/core/testing';
import { SsButtonGroup } from '../ss-button-group';
import { SsButton } from '../../../atoms/ss-button/ss-button';
import { getRoot } from '../../../../test/utils';

const components = [SsButtonGroup, SsButton];

async function group(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

const THREE = `
  <ss-button label="Cut"></ss-button>
  <ss-button label="Copy"></ss-button>
  <ss-button label="Paste"></ss-button>
`;

function hosts(page: Awaited<ReturnType<typeof group>>) {
  return Array.from(getRoot(page).querySelectorAll('ss-button')) as unknown as Record<string, unknown>[];
}

describe('ss-button-group semantics', () => {
  it('exposes the actions as one group', async () => {
    const page = await group(`<ss-button-group>${THREE}</ss-button-group>`);
    expect(getRoot(page).querySelector('[role="group"]')).not.toBeNull();
  });

  it('names the group for screen readers', async () => {
    const page = await group(`<ss-button-group accessibility-label="Text actions">${THREE}</ss-button-group>`);
    expect(getRoot(page).querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Text actions');
  });

  it('applies the orientation modifier', async () => {
    const page = await group(`<ss-button-group orientation="vertical">${THREE}</ss-button-group>`);
    expect(getRoot(page).querySelector('.ss-button-group')?.className).toContain('ss-button-group--vertical');
  });
});

describe('ss-button-group coordination', () => {
  it('shares its size with every button', async () => {
    const page = await group(`<ss-button-group size="lg">${THREE}</ss-button-group>`);
    expect(hosts(page).map(button => button.size)).toEqual(['lg', 'lg', 'lg']);
  });

  it('shares its variant with every button', async () => {
    const page = await group(`<ss-button-group variant="secondary">${THREE}</ss-button-group>`);
    expect(hosts(page).map(button => button.variant)).toEqual(['secondary', 'secondary', 'secondary']);
  });

  it('disables every button', async () => {
    const page = await group(`<ss-button-group disabled>${THREE}</ss-button-group>`);
    expect(hosts(page).every(button => button.disabled === true)).toBe(true);
  });

  it('leaves a button alone for anything the group was not given', async () => {
    const page = await group(`<ss-button-group size="lg"><ss-button label="Delete" variant="destructive"></ss-button></ss-button-group>`);
    const button = hosts(page)[0];

    // The group set the size it was given; the button keeps the variant that
    // makes it stand out from its neighbours.
    expect(button.size).toBe('lg');
    expect(button.variant).toBe('destructive');
  });

  it('ignores buttons belonging to a nested group', async () => {
    const page = await group(`
      <ss-button-group size="lg">
        <ss-button label="Outer"></ss-button>
        <ss-button-group size="xs"><ss-button label="Inner"></ss-button></ss-button-group>
      </ss-button-group>
    `);
    const all = Array.from(page.body.querySelectorAll('ss-button')) as unknown as Record<string, unknown>[];

    expect(all[0].size).toBe('lg');
    expect(all[1].size).toBe('xs');
  });
});
