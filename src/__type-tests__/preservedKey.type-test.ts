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

// UUIDs are data, not names: they are preserved in either case, whatever their first
// character.
export type _uuid = Expect<
  Equal<
    TransformKey<'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'camel'>,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  >
>;
export type _uuidUpperCase = Expect<
  Equal<
    TransformKey<'F47AC10B-58CC-4372-A567-0E02B2C3D479', 'snake'>,
    'F47AC10B-58CC-4372-A567-0E02B2C3D479'
  >
>;
export type _uuidLettersOnly = Expect<
  Equal<
    TransformKey<'abcdefab-cdef-abcd-efab-cdefabcdefab', 'pascal'>,
    'abcdefab-cdef-abcd-efab-cdefabcdefab'
  >
>;

// Keys that are not quite UUIDs are transformed like any other key.
export type _uuidShortSegment = Expect<
  Equal<
    TransformKey<'f47ac10b-58cc-4372-a567-0e02b2c3d47', 'camel'>,
    'f47ac10b58cc4372A5670e02b2c3d47'
  >
>;
export type _uuidLongSegment = Expect<
  Equal<
    TransformKey<'f47ac10b-58cc-4372-a5670-e02b2c3d479', 'snake'>,
    'f47ac10b_58cc_4372_a5670_e02b2c3d479'
  >
>;
export type _uuidExtraCharacter = Expect<
  Equal<
    TransformKey<'f47ac10b-58cc-4372-a567-0e02b2c3d4790', 'pascal'>,
    'F47ac10b58cc4372A5670e02b2c3d4790'
  >
>;
export type _uuidNonHexLetter = Expect<
  Equal<
    TransformKey<'g47ac10b-58cc-4372-a567-0e02b2c3d479', 'camel'>,
    'g47ac10b58cc4372A5670e02b2c3d479'
  >
>;
export type _uuidWithoutDashes = Expect<
  Equal<
    TransformKey<'f47ac10b58cc4372a5670e02b2c3d479', 'pascal'>,
    'F47ac10b58cc4372a5670e02b2c3d479'
  >
>;
export type _uuidUnderscores = Expect<
  Equal<
    TransformKey<'f47ac10b_58cc_4372_a567_0e02b2c3d479', 'camel'>,
    'f47ac10b58cc4372A5670e02b2c3d479'
  >
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
