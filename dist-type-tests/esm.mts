/**
 * Type tests against the published declarations, as an ES module consumer sees them
 * (`dist/index.d.mts`, resolved through the package `exports`).
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import {
  transform,
  transformKey,
  type StringCase,
  type TransformKey,
  type TransformKeyOptions,
  type TransformOptions,
  type TransformResult,
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
};
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
