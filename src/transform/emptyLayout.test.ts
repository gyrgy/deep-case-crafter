import { NO_VALUE } from '../constants/fastObjects';
import emptyLayout from './emptyLayout';

describe('emptyLayout', () => {
  it('should store NO_VALUE in every field, symbols included when the width counts them', () => {
    const sym = Symbol('meta');
    const copy: Record<PropertyKey, unknown> = { a_b: 1, c_d: 'x', [sym]: 2 };
    emptyLayout(copy, 3);
    expect(Reflect.ownKeys(copy)).toEqual(['a_b', 'c_d', sym]);
    for (const key of Reflect.ownKeys(copy)) expect(copy[key]).toBe(NO_VALUE);

    // A width without symbols: no time spent looking for them
    const plain: Record<PropertyKey, unknown> = { a_b: 1 };
    emptyLayout(plain, 1);
    expect(plain).toEqual({ a_b: NO_VALUE });
  });
});
