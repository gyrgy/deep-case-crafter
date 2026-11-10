import { NO_VALUE } from '../constants/fastObjects';
import copyLayout from './copyLayout';

describe('copyLayout', () => {
  it('should copy the keys of the result, in order, with NO_VALUE in every field', () => {
    const sym = Symbol('meta');
    const nested = { deep: 1 };
    const result: Record<PropertyKey, unknown> = {
      count: 7,
      ratio: 0.5,
      name: 'a',
      nested,
      empty: null,
      flag: true,
      [sym]: nested,
    };
    Object.defineProperty(result, '__proto__', {
      value: nested,
      enumerable: true,
      writable: true,
      configurable: true,
    });
    const copy = copyLayout(result);
    expect(copy).not.toBe(result);
    expect(Reflect.ownKeys(copy)).toEqual(Reflect.ownKeys(result));
    for (const key of Reflect.ownKeys(copy)) {
      expect((copy as Record<PropertyKey, unknown>)[key]).toBe(NO_VALUE);
    }
    expect(Object.getPrototypeOf(copy)).toBe(Object.prototype);
    // The result keeps its data
    expect(result.count).toBe(7);
    expect(result[sym]).toBe(nested);
  });
});
