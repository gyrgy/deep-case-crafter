import transformPrimitive from './primitiveTransformer';

describe('primitiveTransformer', () => {
  it('should return primitive values unchanged', () => {
    expect(transformPrimitive('hello')).toBe('hello');
    expect(transformPrimitive(42)).toBe(42);
    expect(transformPrimitive(true)).toBe(true);
    expect(transformPrimitive(null)).toBeNull();
    expect(transformPrimitive(undefined)).toBeUndefined();

    const sym = Symbol('test');
    expect(transformPrimitive(sym)).toBe(sym);

    const bigInt = BigInt(42);
    expect(transformPrimitive(bigInt)).toBe(bigInt);
  });
});
