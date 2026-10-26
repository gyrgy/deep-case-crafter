import ts from 'typescript';
import evaluateResultKeyPaths from '../__test-utils__/evaluateResultKeyPaths';
import listKeyPaths from '../__test-utils__/listKeyPaths';
import transform from './transform';

/**
 * Inputs and options of `transform`, written as TypeScript: each call is both
 * type-checked and run, and its result type must have exactly the keys of its result.
 */
const SCENARIOS: readonly (readonly [data: string, options: string])[] = [
  // Records keyed by ID, and free-form metadata
  [
    "{ users_by_id: { abc_1: { first_name: 'Ann' } }, metadata: { order_ref: 'A1' } }",
    "{ exclude: ['users_by_id.*', 'metadata.*'] }",
  ],
  [
    "{ user_info: { home_addr: { zip_code: 1, street_name: 's' }, work_addr: { zip_code: 2 } } }",
    "{ targetCase: 'kebab', exclude: ['user_info.home_addr.zip_code', 'user_info.work_addr'] }",
  ],
  // Wildcards, and paths that end at a key that other paths continue below
  [
    '{ a_b: { c_d: { e_f: 1 }, g_h: { e_f: 2 } }, i_j: { c_d: { e_f: 3 } } }',
    "{ exclude: ['*.c_d.*', 'a_b.*.e_f'] }",
  ],
  [
    '{ a_b: { c_d: 1, e_f: { g_h: 1 } }, i_j: { e_f: { g_h: 2 } } }',
    "{ targetCase: 'pascal', exclude: ['a_b', 'a_b.e_f.g_h', '*.e_f'] }",
  ],
  [
    '{ a_b: { c_d: [{ e_f: 1 }] }, g_h: 1 }',
    "{ exclude: ['*', '*.*', '*.*.*'] }",
  ],
  // Arrays, nested arrays, tuples and Sets add no key to a path
  [
    "{ row_list: [[{ cell_id: 1, cell_name: 'a' }], [{ cell_id: 2 }]] }",
    "{ exclude: ['row_list.cell_id'] }",
  ],
  [
    '{ pair_tuple: [{ a_b: 1 }, { c_d: { e_f: 2 } }] } as const',
    "{ exclude: ['pair_tuple.c_d.e_f'] }",
  ],
  [
    "{ tag_set: new Set([{ tag_name: 'x', tag_id: 1 }]) }",
    "{ targetCase: 'snake', exclude: ['tag_set.tagName'] }",
  ],
  [
    "{ tag_set: new Set([{ tag_name: 'x', tag_id: 1 }]) }",
    "{ exclude: ['tag_set.tag_name'] }",
  ],
  // Map keys add a key to a path, and `*` matches the keys that are not strings
  [
    "new Map<'user_id' | 'last_name', { first_name: number }>([['user_id', { first_name: 1 }], ['last_name', { first_name: 2 }]])",
    "{ exclude: ['user_id.first_name'] }",
  ],
  [
    "new Map<'a_b' | 7, { c_d: number }>([['a_b', { c_d: 1 }], [7, { c_d: 2 }]])",
    "{ exclude: ['*.c_d', 'a_b'] }",
  ],
  [
    "{ score_map: new Map<'u_1' | 'u_2', { x_y: number }>([['u_1', { x_y: 1 }], ['u_2', { x_y: 2 }]]) }",
    "{ targetCase: 'kebab', exclude: ['score_map.*'] }",
  ],
  // The depth limit applies as without exclude
  [
    '{ a_b: { c_d: { e_f: { g_h: 1 } } }, i_j: { k_l: 1 } }',
    "{ exclude: ['a_b.c_d'], depth: 2 }",
  ],
  [
    '{ a_b: { c_d: { e_f: { g_h: 1 } } }, i_j: { k_l: 1 } }',
    "{ exclude: ['a_b.c_d.e_f'], depth: 3 }",
  ],
  [
    "{ tag_set: new Set([{ tag_name: 'x', tag_info: { tag_id: 1 } }]) }",
    "{ exclude: ['tag_set.tag_info'], depth: 2 }",
  ],
  // Keys with dots, numeric keys, keys named `*` and keys the runtime always preserves
  [
    "{ 'x.y': { a_b: 1 }, 200: { status_text: 'OK' }, c_d: 1 }",
    "{ exclude: ['*.a_b', '200.status_text'] }",
  ],
  ["{ '*': { a_b: 1 }, c_d: { a_b: 2 } }", "{ exclude: ['c_d.*'] }"],
  [
    '{ USER_ID: { first_name: 1 }, _private: { a_b: 1 }, HTTPResponse: { StatusCode: 1 } }',
    "{ targetCase: 'snake', exclude: ['USER_ID.first_name', 'HTTPResponse.StatusCode'] }",
  ],
  // An object reached through several paths
  [
    '(() => { const shared = { k_k: 1 }; return { a_a: shared, b_b: shared, c_c: [shared] }; })()',
    "{ exclude: ['a_a.k_k', 'c_c.k_k'] }",
  ],
  // Paths that match nothing, and no path at all
  ['{ a_b: { c_d: 1 } }', "{ exclude: ['x_y.z'] }"],
  ['{ a_b: { c_d: 1 } }', '{ exclude: [] }'],
];

/** Runs a TypeScript expression, with `transform` in scope */
function run(expression: string): unknown {
  const { outputText } = ts.transpileModule(`exports.value = ${expression};`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  });
  const exports: { value?: unknown } = {};
  new Function('exports', 'transform', outputText)(exports, transform);
  return exports.value;
}

describe('exclude type/runtime parity', () => {
  it('should type the keys of every result exactly as the runtime returns them', () => {
    const expressions = SCENARIOS.map(
      ([data, options]) => `transform(${data}, ${options})`,
    );
    const typedPaths = evaluateResultKeyPaths(expressions);

    const mismatches = expressions
      .map((expression, i) => ({
        expression,
        runtime: listKeyPaths(run(expression)),
        type: typedPaths[i],
      }))
      .filter(({ runtime, type }) => runtime.join() !== type.join());

    expect(expressions.length).toBeGreaterThan(20);
    expect(mismatches).toEqual([]);
  }, 60_000);
});
