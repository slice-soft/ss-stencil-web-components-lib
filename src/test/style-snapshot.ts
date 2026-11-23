import type { E2EPage } from '@stencil/core/testing';

/**
 * Computed styles of the element a component actually draws, keyed by a
 * `data-case` attribute on each host. Used to prove a refactor of a
 * component's stylesheet changes nothing on screen: take a snapshot before,
 * compare after.
 *
 * The drawn element is the first `button`, `input`, `textarea` or `select` in
 * the host's shadow root, or in the host itself for a scoped component.
 * Strings, not functions, go to `evaluate`: see docs/conventions.md on
 * coverage. No `height`: it depends on the installed font's metrics (CI has no
 * Sora and measured 36px where a workstation measures 39px); padding and
 * font-size already pin a control's size.
 */
export const STYLE_PROPS = [
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-size',
  'font-family',
  'font-weight',
  'line-height',
  'gap',
  'border-top-width',
  'border-bottom-width',
  'border-top-style',
  'border-top-color',
  'border-bottom-color',
  'border-top-left-radius',
  'border-bottom-right-radius',
  'color',
  'background-color',
  'box-shadow',
  'outline-style',
  'outline-width',
  'outline-color',
  'outline-offset',
  'opacity',
  'filter',
  'transform',
  'cursor',
];

const DRAWN = 'button, input, textarea, select';

export async function computedStyles(page: E2EPage, cases?: string[]): Promise<Record<string, Record<string, string>>> {
  const filter = cases ? JSON.stringify(cases) : 'null';
  return (await page.evaluate(`(() => {
    const only = ${filter};
    const props = ${JSON.stringify(STYLE_PROPS)};
    const out = {};
    for (const host of document.querySelectorAll('[data-case]')) {
      const key = host.getAttribute('data-case');
      if (only && !only.includes(key)) continue;
      const drawn = (host.shadowRoot && host.shadowRoot.querySelector('${DRAWN}')) || host.querySelector('${DRAWN}');
      const style = getComputedStyle(drawn);
      out[key] = Object.fromEntries(props.map(p => [p, style.getPropertyValue(p)]));
    }
    return out;
  })()`)) as Record<string, Record<string, string>>;
}

/** Hovers a host by its case key and returns the drawn element's styles. */
export async function hoveredStyles(page: E2EPage, key: string): Promise<Record<string, string>> {
  await page.hover(`[data-case="${key}"]`);
  await page.waitForChanges();
  const styles = (await computedStyles(page, [key]))[key];
  await page.mouse.move(0, 0);
  return styles;
}

/** Focuses a host's drawn element from the keyboard and returns its styles. */
export async function focusedStyles(page: E2EPage, key: string): Promise<Record<string, string>> {
  await page.evaluate(`(() => {
    const host = document.querySelector('[data-case="${key}"]');
    const drawn = (host.shadowRoot && host.shadowRoot.querySelector('${DRAWN}')) || host.querySelector('${DRAWN}');
    drawn.focus({ focusVisible: true });
  })()`);
  await page.waitForChanges();
  const styles = (await computedStyles(page, [key]))[key];
  await page.evaluate(`document.activeElement && document.activeElement.blur()`);
  return styles;
}

/**
 * Computed styles of named parts of each `data-case` host, for components
 * whose drawing is not their form control (a checkbox draws `__control` and
 * `__mark`; its input is hidden). `parts` maps a name to a selector looked up
 * in the shadow root, or in the host for a scoped component; ':host' is the
 * host itself. Keys are `<case>/<part>`.
 */
export async function computedParts(page: E2EPage, parts: Record<string, string>, cases?: string[]): Promise<Record<string, Record<string, string>>> {
  const filter = cases ? JSON.stringify(cases) : 'null';
  return (await page.evaluate(`(() => {
    const only = ${filter};
    const parts = ${JSON.stringify(parts)};
    const props = ${JSON.stringify(STYLE_PROPS.concat(['width', 'transform']))};
    const out = {};
    for (const host of document.querySelectorAll('[data-case]')) {
      const key = host.getAttribute('data-case');
      if (only && !only.includes(key)) continue;
      const root = host.shadowRoot || host;
      for (const [name, selector] of Object.entries(parts)) {
        const el = selector === ':host' ? host : root.querySelector(selector);
        if (!el) continue;
        const style = getComputedStyle(el);
        out[key + '/' + name] = Object.fromEntries(props.map(p => [p, style.getPropertyValue(p)]));
      }
    }
    return out;
  })()`)) as Record<string, Record<string, string>>;
}

/** Focuses a host's form control from the keyboard and returns its parts' styles. */
export async function focusedParts(page: E2EPage, key: string, parts: Record<string, string>): Promise<Record<string, Record<string, string>>> {
  await page.evaluate(`(() => {
    const host = document.querySelector('[data-case="${key}"]');
    const drawn = (host.shadowRoot && host.shadowRoot.querySelector('${DRAWN}')) || host.querySelector('${DRAWN}');
    drawn.focus({ focusVisible: true });
  })()`);
  await page.waitForChanges();
  const styles = await computedParts(page, parts, [key]);
  await page.evaluate(`document.activeElement && document.activeElement.blur()`);
  return styles;
}
