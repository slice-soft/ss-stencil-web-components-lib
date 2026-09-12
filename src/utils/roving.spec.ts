import { rovingIndex, typeaheadIndex } from './roving';

describe('rovingIndex along a vertical list', () => {
  it('steps down and up by one', () => {
    expect(rovingIndex('ArrowDown', 1, 4)).toBe(2);
    expect(rovingIndex('ArrowUp', 1, 4)).toBe(0);
  });

  it('wraps at both ends', () => {
    expect(rovingIndex('ArrowDown', 3, 4)).toBe(0);
    expect(rovingIndex('ArrowUp', 0, 4)).toBe(3);
  });

  it('jumps to the ends on Home and End', () => {
    expect(rovingIndex('Home', 2, 4)).toBe(0);
    expect(rovingIndex('End', 1, 4)).toBe(3);
  });

  it('leaves the cross axis alone', () => {
    // A vertical menu that swallowed Left and Right would take them from a
    // submenu or from the page.
    expect(rovingIndex('ArrowRight', 1, 4)).toBeNull();
    expect(rovingIndex('ArrowLeft', 1, 4)).toBeNull();
  });

  it('ignores keys the pattern does not use', () => {
    expect(rovingIndex('Enter', 1, 4)).toBeNull();
    expect(rovingIndex('a', 1, 4)).toBeNull();
  });
});

describe('rovingIndex along a horizontal row', () => {
  it('uses Left and Right, and leaves Up and Down alone', () => {
    const horizontal = { orientation: 'horizontal' as const };

    expect(rovingIndex('ArrowRight', 0, 3, horizontal)).toBe(1);
    expect(rovingIndex('ArrowLeft', 0, 3, horizontal)).toBe(2);
    expect(rovingIndex('ArrowDown', 0, 3, horizontal)).toBeNull();
  });
});

describe('rovingIndex with nothing focused yet', () => {
  it('lands on the first item going forward and the last going back', () => {
    expect(rovingIndex('ArrowDown', -1, 4)).toBe(0);
    expect(rovingIndex('ArrowUp', -1, 4)).toBe(3);
  });
});

describe('rovingIndex with disabled items', () => {
  const disabled = (index: number) => index === 1 || index === 3;

  it('steps over them', () => {
    expect(rovingIndex('ArrowDown', 0, 4, { disabled })).toBe(2);
    expect(rovingIndex('ArrowUp', 2, 4, { disabled })).toBe(0);
  });

  it('steps over them when jumping to an end', () => {
    expect(rovingIndex('End', 0, 4, { disabled })).toBe(2);
    expect(rovingIndex('Home', 2, 4, { disabled: index => index === 0 })).toBe(1);
  });

  it('has nowhere to go when every item is disabled', () => {
    expect(rovingIndex('ArrowDown', 0, 3, { disabled: () => true })).toBeNull();
  });

  it('has nowhere to go in an empty set', () => {
    expect(rovingIndex('ArrowDown', -1, 0)).toBeNull();
  });
});

describe('typeaheadIndex', () => {
  const labels = ['Edit', 'Duplicate', 'Delete', 'Archive'];

  it('finds the next item starting with the typed letter, ignoring case', () => {
    expect(typeaheadIndex('a', 0, labels)).toBe(3);
    expect(typeaheadIndex('D', 0, labels)).toBe(1);
  });

  it('walks through every match when the same letter is typed again', () => {
    expect(typeaheadIndex('d', 1, labels)).toBe(2);
    expect(typeaheadIndex('d', 2, labels)).toBe(1);
  });

  it('skips disabled items', () => {
    expect(typeaheadIndex('d', 0, labels, index => index === 1)).toBe(2);
  });

  it('ignores anything that is not a single printable character', () => {
    expect(typeaheadIndex('ArrowDown', 0, labels)).toBeNull();
    expect(typeaheadIndex(' ', 0, labels)).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(typeaheadIndex('z', 0, labels)).toBeNull();
  });
});
