/**
 * Type tests against the published declarations in a project with
 * `exactOptionalPropertyTypes`, where an optional property only accepts `undefined` when
 * its type includes it. The declarations themselves are checked as well.
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import { transform, transformKey } from 'deep-case-crafter';
import type { Equal, Expect } from './typeAssertions.js';

const input = { user_id: 1, user_info: { first_name: 'x' } };

type Camel = { userId: number; userInfo: { firstName: string } };
type UserInfoKept = { userId: number; userInfo: { first_name: string } };

const _defaultValue = transform(input);
export type _default = Expect<Equal<typeof _defaultValue, Camel>>;

const _excludeValue = transform(input, { exclude: ['user_info.*'] });
export type _exclude = Expect<Equal<typeof _excludeValue, UserInfoKept>>;

// An option set to undefined is the same as an omitted one
const _undefinedValue = transform(input, {
  targetCase: undefined,
  depth: undefined,
  exclude: undefined,
});
export type _undefined = Expect<Equal<typeof _undefinedValue, Camel>>;

// exclude paths that may be undefined give both results
declare const maybePaths: readonly ['user_info.*'] | undefined;
const _maybePathsValue = transform(input, { exclude: maybePaths });
export type _maybePaths = Expect<
  Equal<typeof _maybePathsValue, Camel | UserInfoKept>
>;

declare const maybeExclude: { exclude?: readonly ['user_info.*'] | undefined };
const _maybeExcludeValue = transform(input, maybeExclude);
export type _maybeExclude = Expect<
  Equal<typeof _maybeExcludeValue, Camel | UserInfoKept>
>;

// transformKey accepts a targetCase set to undefined as well
const _keyUndefinedValue = transformKey('user_id', { targetCase: undefined });
export type _keyUndefined = Expect<Equal<typeof _keyUndefinedValue, 'userId'>>;

declare const maybeSnake: { targetCase?: 'snake' | undefined };
const _keyMaybeValue = transformKey('userId', maybeSnake);
export type _keyMaybe = Expect<
  Equal<typeof _keyMaybeValue, 'user_id' | 'userId'>
>;

// keepReferences set to undefined is the same as omitted
const _keepUndefinedValue = transform(input, { keepReferences: undefined });
export type _keepUndefined = Expect<Equal<typeof _keepUndefinedValue, Camel>>;
