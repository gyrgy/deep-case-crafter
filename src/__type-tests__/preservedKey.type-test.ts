/**
 * Compile-time type tests.
 *
 * These have NO runtime. `tsc --noEmit` (run locally and in CI) fails to compile if any
 * assertion below is false, so they guard the type-level behavior the way jest guards
 * runtime behavior. This file is ignored by jest and never bundled into `dist`.
 */
import type { TransformKey } from '../types/keyTypes';
import type { Equal, Expect } from './typeAssertions';

// Normal transformation still works (regression guard).
export type _normal = Expect<Equal<TransformKey<'user_id', 'camel'>, 'userId'>>;
export type _trailingDigitSegment = Expect<
  Equal<TransformKey<'item_2', 'camel'>, 'item2'>
>;

// Leading-digit keys are preserved, matching runtime.
export type _leadingDigit1 = Expect<
  Equal<TransformKey<'1st_place', 'camel'>, '1st_place'>
>;
export type _leadingDigit2 = Expect<
  Equal<TransformKey<'2nd_place', 'pascal'>, '2nd_place'>
>;

// Other preserved-key categories.
export type _leadingUnderscore = Expect<
  Equal<TransformKey<'_private', 'camel'>, '_private'>
>;
export type _doubleUnderscore = Expect<
  Equal<TransformKey<'a__b', 'camel'>, 'a__b'>
>;

// Out-of-charset keys (symbols / non-ASCII letters) are preserved, matching runtime.
export type _unicode = Expect<
  Equal<TransformKey<'café_table', 'camel'>, 'café_table'>
>;
export type _symbolDot = Expect<Equal<TransformKey<'a.b_c', 'camel'>, 'a.b_c'>>;
export type _symbolDollar = Expect<
  Equal<TransformKey<'foo$bar_baz', 'camel'>, 'foo$bar_baz'>
>;

// Keys ending with a separator are preserved, whatever their length.
export type _trailingUnderscore = Expect<
  Equal<TransformKey<'value_', 'pascal'>, 'value_'>
>;
export type _trailingUnderscoreKebab = Expect<
  Equal<TransformKey<'value_', 'kebab'>, 'value_'>
>;
export type _trailingHyphen = Expect<
  Equal<TransformKey<'count-', 'snake'>, 'count-'>
>;

// Trailing digits do not preserve a key.
export type _letterDigit = Expect<Equal<TransformKey<'s3', 'pascal'>, 'S3'>>;
export type _capitalDigit = Expect<Equal<TransformKey<'S3', 'camel'>, 's3'>>;
export type _kebabDigit = Expect<Equal<TransformKey<'x-1', 'camel'>, 'x1'>>;

// Keys the runtime cannot classify are preserved, at both layers.
export type _mixedCase = Expect<
  Equal<TransformKey<'mixed_Case', 'camel'>, 'mixed_Case'>
>;
export type _screamingSnake = Expect<
  Equal<TransformKey<'USER_ID', 'camel'>, 'USER_ID'>
>;
export type _mixedSeparators = Expect<
  Equal<TransformKey<'a_b-c', 'camel'>, 'a_b-c'>
>;

// The empty key, and keys that are not single literals.
export type _empty = Expect<Equal<TransformKey<'', 'pascal'>, ''>>;
export type _string = Expect<Equal<TransformKey<string, 'camel'>, string>>;
export type _template = Expect<
  Equal<TransformKey<`user_${string}`, 'camel'>, string>
>;
