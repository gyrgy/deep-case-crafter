/**
 * Type tests against the declaration files that declarations.mts compiles to: what a
 * project that uses such a library sees. A declaration can be written without errors
 * and still be wrong, so the types are checked here.
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import {
  createdByIdIn,
  dataIn,
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

const _createdByIdConstantValue = createdByIdIn('constant');
export type _createdByIdConstant = Expect<
  Equal<typeof _createdByIdConstantValue, 'CREATED_BY_ID'>
>;

const _sortParamValue = sortParam('updatedByUser', 'snake');
export type _sortParam = Expect<
  Equal<typeof _sortParamValue, 'created_at' | 'updated_by_user'>
>;

const _toSnakeKeyValue = toSnakeKey('userID');
export type _toSnakeKey = Expect<Equal<typeof _toSnakeKeyValue, 'user_id'>>;

const _keyToCaseValue = keyToCase('created_by_id', 'kebab');
export type _keyToCase = Expect<Equal<typeof _keyToCaseValue, 'created-by-id'>>;

// A target case passed through a generic parameter reaches the declarations by name, so
// cases added in later versions are typed as well
const _keyToConstantValue = keyToCase('created_by_id', 'constant');
export type _keyToConstant = Expect<
  Equal<typeof _keyToConstantValue, 'CREATED_BY_ID'>
>;

const _dataInValue = dataIn(
  { user_id: 1, address: { zip_code: 'z' } },
  'constant',
);
export type _dataIn = Expect<
  Equal<typeof _dataInValue, { USER_ID: number; ADDRESS: { ZIP_CODE: string } }>
>;

const _toKebabKeysValue = toKebabKeys(['userId', 'HTTPResponse'] as const);
export type _toKebabKeys = Expect<
  Equal<typeof _toKebabKeysValue, ('user-id' | 'http-response')[]>
>;
