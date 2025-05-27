import { parseStyleString } from './style';

describe('parseStyleString', () => {
  it('parses a simple style string', () => {
    const input = 'color: red; font-size: 16px;';
    const expected = { 'color': 'red', 'font-size': '16px' };
    expect(parseStyleString(input)).toEqual(expected);
  });

  it('ignores empty styles', () => {
    const input = 'color: red; ; font-size: 16px; ;';
    const expected = { 'color': 'red', 'font-size': '16px' };
    expect(parseStyleString(input)).toEqual(expected);
  });

  it('trims whitespace around keys and values', () => {
    const input = ' color : red ; font-size : 16px ; ';
    const expected = { 'color': 'red', 'font-size': '16px' };
    expect(parseStyleString(input)).toEqual(expected);
  });

  it('returns an empty object for an empty string', () => {
    expect(parseStyleString('')).toEqual({});
  });

  it('handles styles without values', () => {
    const input = 'color: red; font-size;';
    const expected = { color: 'red' };
    expect(parseStyleString(input)).toEqual(expected);
  });
});
