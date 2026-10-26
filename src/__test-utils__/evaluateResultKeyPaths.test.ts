import evaluateResultKeyPaths from './evaluateResultKeyPaths';

describe('evaluateResultKeyPaths', () => {
  it('should list the key paths of each result type, as listKeyPaths lists a value', () => {
    expect(
      evaluateResultKeyPaths([
        "transform({ a_a: [{ b_b: 1 }], c_c: new Set([{ d_d: 'x' }]) })",
        "transform(new Map<'a_a' | 7, { b_b: number }>(), { exclude: ['*.b_b'] })",
        '[{ a_a: 1 }, null, 2] as const',
      ]),
    ).toEqual([
      ['["aA","bB"]', '["aA"]', '["cC","dD"]', '["cC"]'],
      ['["<values>","b_b"]', '["aA"]'],
      ['["a_a"]'],
    ]);
  });

  it('should mark keys and results that are not single literals', () => {
    expect(
      evaluateResultKeyPaths([
        'new Map<string, { a_a: 1 }>()',
        'transform({ a_a: 1 }, { exclude: [] as string[] })',
        "transform({ a_a: 1 }, { exclude: ['a..b'] })",
      ]),
    ).toEqual([
      ['["<string>"]', '["<values>","a_a"]'],
      ['<unknown>'],
      ['<never>'],
    ]);
  });

  it('should throw the compiler errors when the expressions do not compile', () => {
    expect(() =>
      evaluateResultKeyPaths(["transform({}, { targetCase: 'title' })"]),
    ).toThrow(/No overload matches this call/);
  });
});
