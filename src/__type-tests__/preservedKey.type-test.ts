/**
 * Compile-time type tests.
 *
 * These have NO runtime. `tsc --noEmit` (run locally and in CI) fails to compile if any
 * assertion below is false, so they guard the type-level behavior the way jest guards
 * runtime behavior. This file is ignored by jest and never bundled into `dist`.
 */
import type { TransformKey } from '../types/transformTypes';

type Expect<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type SnakeToCamelKey<K extends string> = TransformKey<
  K,
  { sourceCase: 'snake'; targetCase: 'camel' }
>;

// Normal transformation still works (regression guard).
export type _normal = Expect<Equal<SnakeToCamelKey<'user_id'>, 'userId'>>;
export type _trailingDigitSegment = Expect<
  Equal<SnakeToCamelKey<'item_2'>, 'item2'>
>;

// Leading-digit keys are preserved at the type level, matching runtime
// (the `${number}` entry in ForbiddenStartChars). This is the fix under test.
export type _leadingDigit1 = Expect<
  Equal<SnakeToCamelKey<'1st_place'>, '1st_place'>
>;
export type _leadingDigit2 = Expect<
  Equal<SnakeToCamelKey<'2nd_place'>, '2nd_place'>
>;

// Other preserved-key categories that already worked (regression guards).
export type _leadingUnderscore = Expect<
  Equal<SnakeToCamelKey<'_private'>, '_private'>
>;
export type _doubleUnderscore = Expect<Equal<SnakeToCamelKey<'a__b'>, 'a__b'>>;

// Out-of-charset keys (symbols / non-ASCII letters) are preserved, matching runtime.
export type _unicode = Expect<
  Equal<SnakeToCamelKey<'café_table'>, 'café_table'>
>;
export type _symbolDot = Expect<Equal<SnakeToCamelKey<'a.b_c'>, 'a.b_c'>>;
export type _symbolDollar = Expect<
  Equal<SnakeToCamelKey<'foo$bar_baz'>, 'foo$bar_baz'>
>;
