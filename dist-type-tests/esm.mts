/**
 * Type tests against the published declarations, as an ES module consumer sees them
 * (`dist/index.d.mts`, resolved through the package `exports`).
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import {
  transform,
  transformKey,
  transformTo,
  type StringCase,
  type TransformKey,
  type TransformKeyOptions,
  type TransformOptions,
  type TransformResult,
  type TransformTo,
  type TransformToOptions,
} from 'deep-case-crafter';
import type { Equal, Expect } from './typeAssertions.js';

const _resultValue = transform({
  user_id: 1,
  created_at: new Date(),
  tag_list: ['a'] as readonly string[],
});
export type _result = Expect<
  Equal<
    typeof _resultValue,
    { userId: number; createdAt: Date; tagList: readonly string[] }
  >
>;

const _shallowValue = transform(
  { user_info: { first_name: 'x' } },
  { targetCase: 'kebab', depth: 1 },
);
export type _shallow = Expect<
  Equal<typeof _shallowValue, { 'user-info': { first_name: string } }>
>;

export type _named = Expect<
  Equal<
    TransformResult<{ HTTPResponse: 1; firstName: 2 }, 'snake'>,
    { http_response: 1; first_name: 2 }
  >
>;

// One-letter words are kept apart, and UUID keys are left unchanged
export type _keyRules = Expect<
  Equal<
    TransformResult<
      { isAValidUser: 1; XAxis: 2; 'f47ac10b-58cc-4372-a567-0e02b2c3d479': 3 },
      'snake'
    >,
    { is_a_valid_user: 1; x_axis: 2; 'f47ac10b-58cc-4372-a567-0e02b2c3d479': 3 }
  >
>;

// The keys at the exclude paths keep their names; inline paths are captured as literals
const _excludeValue = transform(
  { users_by_id: { u_1: { first_name: 'x' } }, metadata: { order_ref: 'A1' } },
  { exclude: ['users_by_id.*', 'metadata.*'] },
);
export type _exclude = Expect<
  Equal<
    typeof _excludeValue,
    {
      usersById: { u_1: { firstName: string } };
      metadata: { order_ref: string };
    }
  >
>;

const _excludeEmptyValue = transform({ user_id: 1 }, { exclude: [] });
export type _excludeEmpty = Expect<
  Equal<typeof _excludeEmptyValue, { userId: number }>
>;

export type _excludeNamed = Expect<
  Equal<
    TransformResult<{ tag_map: Map<'a_b', { c_d: 1 }> }, 'kebab', 2, ['*.a_b']>,
    { 'tag-map': Map<'a_b', { c_d: 1 }> }
  >
>;

export const options: TransformOptions = {
  targetCase: 'pascal',
  depth: 3,
  exclude: ['metadata.*'],
  keepReferences: false,
};

// keepReferences does not change the result type
const _keepReferencesValue = transform(
  { user_info: { first_name: 'x' } },
  { keepReferences: false },
);
export type _keepReferences = Expect<
  Equal<typeof _keepReferencesValue, { userInfo: { firstName: string } }>
>;
export const targetCase: StringCase = 'camel';

// One key, transformed and typed like the keys of transform's result
const _keyValue = transformKey('userID', { targetCase: 'snake' });
export type _key = Expect<Equal<typeof _keyValue, 'user_id'>>;

const _keyDefaultValue = transformKey('user_id');
export type _keyDefault = Expect<Equal<typeof _keyDefaultValue, 'userId'>>;

declare const field: 'createdAt' | 'userID';
const _keyUnionValue = transformKey(field, { targetCase: 'kebab' });
export type _keyUnion = Expect<
  Equal<typeof _keyUnionValue, 'created-at' | 'user-id'>
>;

export type _keyNamed = Expect<
  Equal<
    TransformKey<'HTTPResponse' | 'XAxis', 'snake'>,
    'http_response' | 'x_axis'
  >
>;

export const keyOptions: TransformKeyOptions = { targetCase: 'kebab' };
export const allOptions: TransformOptions = { ...keyOptions, depth: 1 };

// Generic code reads the result's properties through the constraint of its input
export function userIdOf<T extends { user_id: number; created_at: Date }>(
  user: T,
): [number, Date] {
  const result = transform(user);
  return [result.userId, result.createdAt];
}

// A generic result annotated with its options: the inline paths are still read as a tuple
// (TypeScript 4.7 infers them from the annotation too, and the call's result was `unknown`)
export function withPaths<T>(
  data: T,
): TransformResult<T, 'snake', undefined, ['meta.*']> {
  return transform(data, { targetCase: 'snake', exclude: ['meta.*'] });
}
export function withDepthAndPaths<T>(
  data: T,
): TransformResult<T, 'pascal', 2, ['a', 'b.*']> {
  return transform(data, {
    targetCase: 'pascal',
    depth: 2,
    exclude: ['a', 'b.*'],
  });
}
export function withDepth<T>(data: T): TransformResult<T, 'kebab', 3> {
  return transform(data, { targetCase: 'kebab', depth: 3 });
}

// @ts-expect-error the target case goes in an options object: { targetCase: 'snake' }
transform({ user_id: 1 }, 'snake');

// transformTo: a function with fixed options that keeps its types where it is passed by
// name, as a callback
const _mappedValue = [{ user_id: 1, created_at: new Date() }].map(
  transformTo('kebab'),
);
export type _mapped = Expect<
  Equal<typeof _mappedValue, { 'user-id': number; 'created-at': Date }[]>
>;

const _thenValue = Promise.resolve({ user_info: { first_name: 'x' } }).then(
  transformTo('camel', { depth: 1, exclude: ['user_info.*'] }),
);
export type _then = Expect<
  Equal<typeof _thenValue, Promise<{ userInfo: { first_name: string } }>>
>;

export const toPascal: TransformTo<'pascal'> = transformTo('pascal');
export const converterOptions: TransformToOptions = {
  depth: 2,
  exclude: ['metadata.*'],
  keepReferences: false,
};

// A member of a union of options whose targetCase is undefined keeps its result
declare const someOptions:
  | { depth: 1 }
  | { targetCase: undefined; exclude: ['user_info.*'] };
const _someOptionsValue = transformTo(
  'camel',
  someOptions,
)({
  user_info: { first_name: 'x' },
});
export type _someOptions = Expect<
  Equal<
    typeof _someOptionsValue,
    { userInfo: { first_name: string } } | { userInfo: { first_name: string } }
  >
>;

// A function for one target case is a TransformTo<StringCase> as well
export const anyCase: TransformTo<StringCase> = toPascal;

// @ts-expect-error the target case is the first argument: transformTo('snake')
transformTo('camel', { targetCase: 'snake' });
declare const presets: { depth: 1 } | { targetCase: 'snake' };
// @ts-expect-error also in a member of a union
transformTo('camel', presets);
// @ts-expect-error the paths go in an options object: { exclude: [...] }
transformTo('camel', ['metadata.*']);
