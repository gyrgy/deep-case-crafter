import describeValue from './describeValue';

describe('describeValue', () => {
  it('should quote strings', () => {
    expect(describeValue('SNAKE')).toBe('"SNAKE"');
    expect(describeValue('')).toBe('""');
  });

  it('should write other primitives as they are', () => {
    expect(describeValue(NaN)).toBe('NaN');
    expect(describeValue(2)).toBe('2');
    expect(describeValue(true)).toBe('true');
    expect(describeValue(undefined)).toBe('undefined');
    expect(describeValue(Symbol('case'))).toBe('Symbol(case)');
    expect(describeValue(BigInt(10))).toBe('10n');
  });

  it('should describe objects by their tag, without calling them', () => {
    expect(describeValue(null)).toBe('null');
    expect(describeValue({})).toBe('[object Object]');
    expect(describeValue(Object.create(null))).toBe('[object Object]');
    expect(describeValue(['snake'])).toBe('[object Array]');
    expect(describeValue(() => 'snake')).toBe('[object Function]');
  });

  it('should not throw for objects whose tag cannot be read', () => {
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();
    const throwingTag = {
      get [Symbol.toStringTag](): string {
        throw new Error('no tag');
      },
    };

    expect(describeValue(proxy)).toBe('an object');
    expect(describeValue(throwingTag)).toBe('an object');
  });
});
