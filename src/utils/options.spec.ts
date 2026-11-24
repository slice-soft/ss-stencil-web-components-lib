import { matches, readOptions } from './options';

describe('matches', () => {
  it('ignores case and accents', () => {
    expect(matches('Perú', 'peru')).toBe(true);
    expect(matches('Colombia', 'COL')).toBe(true);
    expect(matches('São Tomé', 'sao tome')).toBe(true);
  });

  it('matches anywhere in the label', () => {
    expect(matches('Costa Rica', 'rica')).toBe(true);
  });

  it('rejects a label without the query', () => {
    expect(matches('Chile', 'peru')).toBe(false);
  });

  it('an empty or blank query matches everything', () => {
    expect(matches('x', '')).toBe(true);
    expect(matches('x', '   ')).toBe(true);
  });
});

describe('readOptions', () => {
  function host(html: string) {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el;
  }

  it('reads value, label, disabled and selected from ss-option children', () => {
    expect(readOptions(host('<ss-option value="co" selected>Colombia</ss-option><ss-option disabled> Perú </ss-option>'))).toEqual([
      { value: 'co', label: 'Colombia', disabled: false, selected: true },
      { value: 'Perú', label: 'Perú', disabled: true, selected: false },
    ]);
  });

  it('reads direct children only', () => {
    expect(readOptions(host('<div><ss-option value="x">X</ss-option></div><ss-option value="y">Y</ss-option>')).map(o => o.value)).toEqual(['y']);
  });
});
