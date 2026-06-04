import transformArray from './transformArray';

describe('transformArray', () => {
  it('transforms each item via transformItem, preserving order', () => {
    const result = transformArray(
      [1, 2, 3],
      () => {},
      (n) => (n as number) * 10,
    );
    expect(result).toEqual([10, 20, 30]);
  });

  it('registers the (still empty) result before any item is processed', () => {
    let registered: unknown[] | undefined;
    const result = transformArray(
      ['a', 'b'],
      (out) => {
        registered = out;
        expect(out).toEqual([]); // registered before filling -> self-refs can resolve
      },
      (x) => x,
    );
    expect(registered).toBe(result);
    expect(result).toEqual(['a', 'b']);
  });

  it('returns an empty array for empty input', () => {
    expect(
      transformArray(
        [],
        () => {},
        (x) => x,
      ),
    ).toEqual([]);
  });
});
