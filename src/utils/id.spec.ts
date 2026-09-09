import { nextId, resolveId } from './id';

describe('nextId', () => {
  it('starts a prefix at zero', () => {
    expect(nextId('spec-start')).toBe('spec-start-0');
  });

  it('increments on every call for the same prefix', () => {
    const prefix = 'spec-increment';
    expect([nextId(prefix), nextId(prefix), nextId(prefix)]).toEqual([`${prefix}-0`, `${prefix}-1`, `${prefix}-2`]);
  });

  it('keeps a separate sequence per prefix', () => {
    nextId('spec-a');
    nextId('spec-a');
    expect(nextId('spec-b')).toBe('spec-b-0');
  });

  it('never repeats an id for the same prefix', () => {
    const prefix = 'spec-unique';
    const ids = Array.from({ length: 50 }, () => nextId(prefix));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('resolveId', () => {
  it('returns the explicit id unchanged', () => {
    expect(resolveId('email', 'spec-explicit')).toBe('email');
  });

  it('trims a padded explicit id', () => {
    expect(resolveId('  email  ', 'spec-trim')).toBe('email');
  });

  it('generates an id when none is supplied', () => {
    expect(resolveId(undefined, 'spec-generated')).toBe('spec-generated-0');
  });

  it('generates an id when the explicit one is empty or blank', () => {
    const prefix = 'spec-blank';
    expect(resolveId('', prefix)).toBe(`${prefix}-0`);
    expect(resolveId('   ', prefix)).toBe(`${prefix}-1`);
  });

  it('does not consume a sequence number for an explicit id', () => {
    const prefix = 'spec-no-consume';
    expect(resolveId(undefined, prefix)).toBe(`${prefix}-0`);
    expect(resolveId('given', prefix)).toBe('given');
    expect(resolveId(undefined, prefix)).toBe(`${prefix}-1`);
  });
});
