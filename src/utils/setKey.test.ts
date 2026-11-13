import setKey from './setKey';

describe('setKey', () => {
  const ownData = (value: unknown) => ({
    value,
    enumerable: true,
    writable: true,
    configurable: true,
  });

  it('should store a value under a key', () => {
    const target: Record<string, unknown> = {};
    setKey(target, 'userId', 1);
    expect(target).toEqual({ userId: 1 });
  });

  it('should store __proto__ as a key of its own, leaving the prototype alone', () => {
    const target: Record<string, unknown> = {};
    const value = { nested: 1 };
    setKey(target, '__proto__', value);
    expect(Object.getPrototypeOf(target)).toBe(Object.prototype);
    expect(Object.getOwnPropertyDescriptor(target, '__proto__')).toEqual(
      ownData(value),
    );
  });

  it('should store a key that Object.prototype has as a property that cannot be written', () => {
    // As every key of a frozen Object.prototype is: an assignment then throws
    const target: Record<string, unknown> = {};
    Object.defineProperty(Object.prototype, 'toString', { writable: false });
    try {
      setKey(target, 'toString', 1);
    } finally {
      Object.defineProperty(Object.prototype, 'toString', { writable: true });
    }
    expect(Object.keys(target)).toEqual(['toString']);
    expect(Object.getOwnPropertyDescriptor(target, 'toString')).toEqual(
      ownData(1),
    );
  });
});
