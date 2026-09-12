import { applyDescribedBy, composeDescribedBy } from './a11y';

describe('composeDescribedBy', () => {
  it('joins several ids with a single space', () => {
    expect(composeDescribedBy('helper', 'error')).toBe('helper error');
  });

  it('preserves the order it was given, so helper is announced before error', () => {
    expect(composeDescribedBy('a-helper', 'a-error')).toBe('a-helper a-error');
    expect(composeDescribedBy('a-error', 'a-helper')).toBe('a-error a-helper');
  });

  it('drops undefined, null and false entries', () => {
    expect(composeDescribedBy('helper', undefined, null, false, 'error')).toBe('helper error');
  });

  it('drops empty and blank strings', () => {
    expect(composeDescribedBy('helper', '', '   ', 'error')).toBe('helper error');
  });

  it('returns undefined when nothing remains, so no attribute is rendered', () => {
    expect(composeDescribedBy()).toBeUndefined();
    expect(composeDescribedBy(undefined, false, '', '  ')).toBeUndefined();
  });

  it('splits an entry that already holds several ids', () => {
    expect(composeDescribedBy('consumer-a consumer-b', 'error')).toBe('consumer-a consumer-b error');
  });

  it('collapses repeated ids so a screen reader does not announce them twice', () => {
    expect(composeDescribedBy('helper', 'helper')).toBe('helper');
    expect(composeDescribedBy('helper error', 'error')).toBe('helper error');
  });

  it('normalises irregular whitespace between ids', () => {
    expect(composeDescribedBy('  helper \n  error \t ')).toBe('helper error');
  });
});

describe('applyDescribedBy', () => {
  type Reflecting = Element & { ariaDescribedByElements: Element[] | null };

  /** Stands in for a control in a browser that supports ARIA element reflection. */
  function reflectingControl(): Reflecting {
    return { ariaDescribedByElements: null } as unknown as Reflecting;
  }

  function withHelp(...ids: string[]) {
    document.body.innerHTML = '';
    const host = document.createElement('div');
    document.body.appendChild(host);
    const targets = ids.map(id => {
      const el = document.createElement('p');
      el.id = id;
      document.body.appendChild(el);
      return el;
    });
    return { host, targets };
  }

  it('points the control at the elements named by the ids', () => {
    const { host, targets } = withHelp('helper', 'error');
    const control = reflectingControl();

    expect(applyDescribedBy(host, control, 'helper error')).toBe(true);
    expect(control.ariaDescribedByElements).toEqual(targets);
  });

  it('preserves the order of the ids', () => {
    const { host, targets } = withHelp('helper', 'error');
    const control = reflectingControl();

    applyDescribedBy(host, control, 'error helper');
    expect(control.ariaDescribedByElements).toEqual([targets[1], targets[0]]);
  });

  it('drops ids that match no element', () => {
    const { host, targets } = withHelp('helper');
    const control = reflectingControl();

    applyDescribedBy(host, control, 'helper missing');
    expect(control.ariaDescribedByElements).toEqual(targets);
  });

  it('clears the reference when no id resolves', () => {
    const { host } = withHelp();
    const control = reflectingControl();

    expect(applyDescribedBy(host, control, 'missing')).toBe(false);
    expect(control.ariaDescribedByElements).toBeNull();
  });

  it('clears the reference when describedBy is absent or blank', () => {
    const { host } = withHelp('helper');
    const control = reflectingControl();

    applyDescribedBy(host, control, 'helper');
    applyDescribedBy(host, control, '   ');
    expect(control.ariaDescribedByElements).toBeNull();

    applyDescribedBy(host, control, 'helper');
    applyDescribedBy(host, control, undefined);
    expect(control.ariaDescribedByElements).toBeNull();
  });

  it('does nothing without a control', () => {
    const { host } = withHelp('helper');
    expect(applyDescribedBy(host, null, 'helper')).toBe(false);
    expect(applyDescribedBy(host, undefined, 'helper')).toBe(false);
  });

  it('reports false in a browser without element reflection', () => {
    const { host } = withHelp('helper');
    const legacy = {} as Element;
    expect(applyDescribedBy(host, legacy, 'helper')).toBe(false);
  });
});
