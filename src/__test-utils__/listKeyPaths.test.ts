import listKeyPaths from './listKeyPaths';

describe('listKeyPaths', () => {
  it('should list the path of every key, sorted', () => {
    expect(listKeyPaths({ b_b: { c_c: 1 }, a_a: null })).toEqual([
      '["a_a"]',
      '["b_b","c_c"]',
      '["b_b"]',
    ]);
  });

  it('should add no key for array items and Set members', () => {
    expect(
      listKeyPaths({ a_a: [[{ b_b: 1 }], new Set([{ c_c: 1 }, 'x'])] }),
    ).toEqual(['["a_a","b_b"]', '["a_a","c_c"]', '["a_a"]']);
  });

  it('should list the string keys of a Map, and its values below <values>', () => {
    const map = new Map<unknown, unknown>([
      ['a_a', { b_b: 1 }],
      [7, { c_c: 1 }],
    ]);
    expect(listKeyPaths(map)).toEqual([
      '["<values>","b_b"]',
      '["<values>","c_c"]',
      '["a_a"]',
    ]);
  });

  it('should list a shared object below each of its keys, and reject a cycle', () => {
    const shared = { c_c: 1 };
    expect(listKeyPaths({ a_a: shared, b_b: shared })).toEqual([
      '["a_a","c_c"]',
      '["a_a"]',
      '["b_b","c_c"]',
      '["b_b"]',
    ]);

    const node: Record<string, unknown> = {};
    node.self_ref = node;
    expect(() => listKeyPaths(node)).toThrow(
      'Circular reference at ["self_ref"]',
    );
  });
});
