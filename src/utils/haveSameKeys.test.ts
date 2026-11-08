import haveSameKeys from './haveSameKeys';

describe('haveSameKeys', () => {
  it('should compare own enumerable string keys and their order', () => {
    expect(haveSameKeys({ a: 1, b: 2 }, { a: 3, b: 4 })).toBe(true);
    expect(haveSameKeys({ a: 1, b: 2 }, { b: 1, a: 2 })).toBe(false);
    expect(haveSameKeys({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(haveSameKeys({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(haveSameKeys({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
    expect(haveSameKeys({ a: 1, b: 2 }, { c: 1, b: 2 })).toBe(false);
    expect(haveSameKeys({ a: 1, [Symbol('s')]: 2 }, { a: 1 })).toBe(true);
  });
});
