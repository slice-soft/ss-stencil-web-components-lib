import { composeDescribedBy } from './a11y';

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
