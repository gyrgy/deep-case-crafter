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

  it('should compare keys, as Reflect.ownKeys returns them, with an object', () => {
    expect(haveSameKeys(['a', 'b'], { a: 3, b: 4 })).toBe(true);
    expect(haveSameKeys(['b', 'a'], { a: 3, b: 4 })).toBe(false);
    expect(haveSameKeys(['a'], { a: 3, b: 4 })).toBe(false);
    expect(haveSameKeys([], {})).toBe(true);
  });

  it('should compare the symbols too when the keys end with one', () => {
    const users = Symbol('users');
    const orders = Symbol('orders');
    const keys = Reflect.ownKeys({ a: 1, [users]: 2 });
    expect(haveSameKeys(keys, { a: 3, [users]: 4 })).toBe(true);
    expect(haveSameKeys(keys, { a: 3, [orders]: 4 })).toBe(false);
    expect(haveSameKeys(keys, { a: 3 })).toBe(false);
    expect(haveSameKeys(keys, { a: 3, b: 4 })).toBe(false);
    // Keys without symbols: a result with a symbol has one string key less
    expect(haveSameKeys(['a', 'b'], { a: 3, [users]: 4 })).toBe(false);
  });
});
