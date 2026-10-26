import { IsStringLiteral } from './helperTypes';

/**
 * Type-level mirror of the `exclude` matching (`excludePaths.ts`).
 *
 * The paths that still match at a level are a union of strings: the rest of each
 * `exclude` path below the keys that lead there. `'users_by_id.*' | 'metadata.*'` at the
 * top becomes `'*'` below `users_by_id`. `never` stands for no path.
 */

/**
 * A key type `K` as the paths name its keys: a single key as its string literal, so that
 * a string enum member or a number matches the key a path names, and any other key type
 * (`string`, a branded `string`, a template literal pattern) as it is.
 */
export type KeyName<K extends string | number> = K extends string
  ? IsStringLiteral<K> extends true
    ? `${K}`
    : K
  : `${K}`;

/** The paths of `Paths` that end at this level: the keys they match keep their names */
export type PathEnds<Paths extends string> = Paths extends `${string}.${string}`
  ? never
  : Paths;

/**
 * The rest of each path of `Paths` that continues below the key `Key`, or below every
 * key that no path names when `Key` is `'*'`
 */
export type PathsBelow<
  Paths extends string,
  Key extends string,
> = Paths extends `${infer Head}.${infer Rest}`
  ? Head extends Key | '*'
    ? Rest
    : never
  : never;

/**
 * The keys that a key type `K` which is not a single literal (an index signature) may
 * stand for, as far as `Paths` is concerned: each key in it that a path continues below,
 * and `'*'` for every other key. A key is in `K` when they share a value, as `'u1'` does
 * with a branded `string`.
 */
export type KeyCases<Paths extends string, K extends string> =
  | (Paths extends `${infer Head}.${string}`
      ? Head extends '*'
        ? never
        : [Head & K] extends [never]
          ? never
          : Head
      : never)
  | '*';
