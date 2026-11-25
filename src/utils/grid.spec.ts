import { fitColumns } from './grid';

describe('fitColumns', () => {
  it.each([
    [1100, 240, 16, 4, 4],
    [1000, 240, 16, 4, 3],
    [600, 240, 16, 4, 2],
    [200, 240, 16, 4, 1],
    [1000, 240, 16, 0, 1],
    [1000, 240, 16, NaN, 1],
    [1000, 0, 16, 3, 3],
    [496, 240, 16, 4, 2],
    [495, 240, 16, 4, 1],
  ])('fitColumns(%p, %p, %p, %p) = %p', (width, minItem, gap, max, expected) => {
    expect(fitColumns(width, minItem, gap, max)).toBe(expected);
  });
});
