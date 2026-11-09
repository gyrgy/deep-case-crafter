import resolveKeepReferences from './resolveKeepReferences';

describe('resolveKeepReferences', () => {
  it('should return a boolean as it is', () => {
    expect(resolveKeepReferences(true)).toBe(true);
    expect(resolveKeepReferences(false)).toBe(false);
  });

  it('should keep references when keepReferences is omitted or null', () => {
    expect(resolveKeepReferences(undefined)).toBe(true);
    expect(resolveKeepReferences(null)).toBe(true);
  });

  it('should reject anything but a boolean', () => {
    const cases = [
      ['false', '"false"'],
      [0, '0'],
      [{}, '[object Object]'],
    ] as const;
    for (const [keepReferences, description] of cases) {
      expect(() => resolveKeepReferences(keepReferences)).toThrow(
        new TypeError(
          `Unsupported keepReferences ${description}. Use true or false.`,
        ),
      );
    }
  });
});
