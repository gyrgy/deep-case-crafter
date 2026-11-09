import resolveDepth from './resolveDepth';

describe('resolveDepth', () => {
  it('should return a number as it is', () => {
    for (const depth of [0, 1, 2.5, -1, Infinity]) {
      expect(resolveDepth(depth)).toBe(depth);
    }
  });

  it('should transform every level when depth is omitted or null', () => {
    expect(resolveDepth(undefined)).toBe(Infinity);
    expect(resolveDepth(null)).toBe(Infinity);
  });

  it('should reject anything but a number, and NaN', () => {
    const cases = [
      ['3', '"3"'],
      [NaN, 'NaN'],
      [BigInt(3), '3n'],
      [false, 'false'],
      [{}, '[object Object]'],
    ] as const;
    for (const [depth, description] of cases) {
      expect(() => resolveDepth(depth)).toThrow(
        new TypeError(
          `Unsupported depth ${description}. Use a number, or omit depth to transform every level.`,
        ),
      );
    }
  });
});
