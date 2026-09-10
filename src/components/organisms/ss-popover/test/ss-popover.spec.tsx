import { newSpecPage } from '@stencil/core/testing';
import { SsPopover } from '../ss-popover';
import { SsButton } from '../../../atoms/ss-button/ss-button';
import { SsTypography } from '../../../atoms/ss-typography/ss-typography';
import { getRoot, getShadowRoot } from '../../../../test/utils';

const components = [SsPopover, SsButton, SsTypography];

async function popover(html: string) {
  const page = await newSpecPage({ components, html });
  await page.waitForChanges();
  return page;
}

function panelOf(root: HTMLElement) {
  return root.querySelector('.ss-popover__panel') as HTMLElement;
}

describe('ss-popover rendering', () => {
  it('is hidden until it is opened', async () => {
    const page = await popover(`<ss-popover heading="Filters"><button slot="trigger">Open</button>Body</ss-popover>`);
    expect(panelOf(getRoot(page)).hasAttribute('hidden')).toBe(true);

    getRoot(page).setAttribute('open', '');
    await page.waitForChanges();

    expect(panelOf(getRoot(page)).hasAttribute('hidden')).toBe(false);
  });

  it('is a dialog, but not a modal one', async () => {
    const page = await popover(`<ss-popover open heading="Filters"><button slot="trigger">Open</button>Body</ss-popover>`);
    const panel = panelOf(getRoot(page));

    expect(panel.getAttribute('role')).toBe('dialog');
    // The page behind stays usable, so it must not be announced as inert.
    expect(panel.getAttribute('aria-modal')).toBeNull();
  });

  it('is named by its heading', async () => {
    const page = await popover(`<ss-popover open heading="Filters"><button slot="trigger">Open</button>Body</ss-popover>`);
    const root = getRoot(page);
    const labelledBy = panelOf(root).getAttribute('aria-labelledby');

    expect(root.querySelector(`#${labelledBy}`)?.textContent).toContain('Filters');
  });

  it('falls back to a stated name when there is no heading', async () => {
    const page = await popover(`<ss-popover open accessibility-label="Filters"><button slot="trigger">Open</button>Body</ss-popover>`);
    const panel = panelOf(getRoot(page));

    expect(panel.getAttribute('aria-label')).toBe('Filters');
    expect(panel.getAttribute('aria-labelledby')).toBeNull();
  });

  it('stays closed while disabled, even when told to open', async () => {
    const page = await popover(`<ss-popover open disabled heading="Filters"><button slot="trigger">Open</button>Body</ss-popover>`);
    expect(panelOf(getRoot(page)).hasAttribute('hidden')).toBe(true);
  });
});

describe('ss-popover trigger', () => {
  it('tells an ss-button trigger what it opens, and whether it is open', async () => {
    const page = await popover(`<ss-popover heading="Filters"><ss-button slot="trigger" label="Filters"></ss-button>Body</ss-popover>`);
    const button = getShadowRoot(getRoot(page).querySelector('ss-button')!).querySelector('button')!;

    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    getRoot(page).setAttribute('open', '');
    await page.waitForChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('sets the state directly on a trigger that takes focus itself', async () => {
    const page = await popover(`<ss-popover open heading="Filters"><button slot="trigger">Open</button>Body</ss-popover>`);
    const trigger = getRoot(page).querySelector('button[slot="trigger"]')!;

    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles when the trigger is pressed, and reports it', async () => {
    const page = await popover(`<ss-popover heading="Filters"><button slot="trigger">Open</button>Body</ss-popover>`);
    const root = getRoot(page) as HTMLElement & { open: boolean };
    const changes: boolean[] = [];
    root.addEventListener('ssOpenChange', event => changes.push((event as CustomEvent).detail.open));

    const trigger = root.querySelector('button[slot="trigger"]') as HTMLElement;
    trigger.click();
    await page.waitForChanges();
    expect(root.open).toBe(true);

    trigger.click();
    await page.waitForChanges();
    expect(root.open).toBe(false);

    expect(changes).toEqual([true, false]);
  });

  it('ignores the trigger while disabled', async () => {
    const page = await popover(`<ss-popover disabled heading="Filters"><button slot="trigger">Open</button>Body</ss-popover>`);
    const root = getRoot(page) as HTMLElement & { open: boolean };

    (root.querySelector('button[slot="trigger"]') as HTMLElement).click();
    await page.waitForChanges();

    expect(root.open).toBe(false);
  });

  it('does not claim the trigger of a popover nested inside it', async () => {
    const page = await popover(`
      <ss-popover open heading="Outer">
        <button slot="trigger" id="outer">Outer</button>
        <ss-popover heading="Inner"><button slot="trigger" id="inner">Inner</button>Body</ss-popover>
      </ss-popover>
    `);
    const root = getRoot(page);

    expect(root.querySelector('#outer')?.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector('#inner')?.getAttribute('aria-expanded')).toBe('false');
  });
});
