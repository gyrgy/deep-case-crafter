import resolveExclude from './resolveExclude';

describe('resolveExclude', () => {
  it('should return null when there is no path', () => {
    expect(resolveExclude(undefined)).toBeNull();
    expect(resolveExclude(null)).toBeNull();
    expect(resolveExclude([])).toBeNull();
  });

  it('should return the paths sorted and without repeats', () => {
    expect(resolveExclude(['metadata.*'])).toEqual(['metadata.*']);
    expect(
      resolveExclude(['users_by_id.*', 'metadata.*', 'users_by_id.*', '*']),
    ).toEqual(['*', 'metadata.*', 'users_by_id.*']);
  });

  it('should reject anything but an array', () => {
    const cases = [
      ['metadata.*', '"metadata.*"'],
      [new Set(['metadata.*']), '[object Set]'],
      [{ 0: 'metadata.*', length: 1 }, '[object Object]'],
      [1, '1'],
    ] as const;
    for (const [exclude, description] of cases) {
      expect(() => resolveExclude(exclude)).toThrow(
        new TypeError(
          `Unsupported exclude ${description}. Use an array of paths, such as ["metadata.*"].`,
        ),
      );
    }
  });

  it('should reject paths that are not strings or that have an empty key', () => {
    const cases = [
      [1, '1'],
      [undefined, 'undefined'],
      [['metadata'], '[object Array]'],
      ['', '""'],
      ['.metadata', '".metadata"'],
      ['metadata.', '"metadata."'],
      ['metadata..order_ref', '"metadata..order_ref"'],
    ] as const;
    for (const [path, description] of cases) {
      expect(() => resolveExclude(['metadata.*', path])).toThrow(
        new TypeError(
          `Unsupported exclude path ${description}. Use non-empty keys joined with dots, such as "metadata.*".`,
        ),
      );
    }
  });
});
