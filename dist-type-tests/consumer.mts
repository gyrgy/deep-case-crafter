/**
 * Type tests against the declaration files that declarations.mts compiles to: what a
 * project that uses such a library sees. A declaration can be written without errors
 * and still be wrong, so the types are checked here.
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import {
  createdByIdIn,
  keyToCase,
  sortParam,
  toKebabKeys,
  toSnakeKey,
} from '../node_modules/.cache/dist-type-tests/declarations.mjs';
import type { Equal, Expect } from './typeAssertions.js';

const _createdByIdCamelValue = createdByIdIn('camel');
export type _createdByIdCamel = Expect<
  Equal<typeof _createdByIdCamelValue, 'createdById'>
>;

const _createdByIdPascalValue = createdByIdIn('pascal');
export type _createdByIdPascal = Expect<
  Equal<typeof _createdByIdPascalValue, 'CreatedById'>
>;

const _sortParamValue = sortParam('updatedByUser', 'snake');
export type _sortParam = Expect<
  Equal<typeof _sortParamValue, 'created_at' | 'updated_by_user'>
>;

const _toSnakeKeyValue = toSnakeKey('userID');
export type _toSnakeKey = Expect<Equal<typeof _toSnakeKeyValue, 'user_id'>>;

const _keyToCaseValue = keyToCase('created_by_id', 'kebab');
export type _keyToCase = Expect<Equal<typeof _keyToCaseValue, 'created-by-id'>>;

const _toKebabKeysValue = toKebabKeys(['userId', 'HTTPResponse'] as const);
export type _toKebabKeys = Expect<
  Equal<typeof _toKebabKeysValue, ('user-id' | 'http-response')[]>
>;
