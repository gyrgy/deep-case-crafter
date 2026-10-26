import type { ExcludeState } from '../transform/excludePaths';
import { PlainCase, StringCase } from './stringCaseTypes';

/**
 * Options for the transformKey function. The transform function takes them as well.
 */
export interface TransformKeyOptions {
  /**
   * The target casing format to transform to
   * @default 'camel'
   */
  targetCase?: StringCase | undefined;
}

/**
 * Options for the transform function
 */
export interface TransformOptions extends TransformKeyOptions {
  /**
   * How many nesting levels to transform: `1` transforms only the top-level keys, `2`
   * also the keys one level down, and so on. The values of objects, Maps and Sets are one
   * level deeper; array items stay on their array's level. Deeper values are returned
   * as they are.
   *
   * Pass a numeric literal to get a precise result type. A depth that is only known to be
   * a `number` (a variable, or `Infinity`) gives an `unknown` result type; omit `depth`
   * to transform every level.
   *
   * @default Infinity
   */
  depth?: number | undefined;

  /**
   * Keys to leave unchanged, each given as its path: the keys of the input that lead to
   * it, joined with `.`. `'metadata.*'` keeps the keys of `metadata`, `'users_by_id.*'`
   * the IDs of a record. `*` stands for any key. Array items and Set members add no key
   * to a path; Map keys do, and `*` also matches a Map key that is not a string. A key
   * that contains a `.` can only be matched by `*`. Only the keys themselves are kept:
   * the values under them are transformed as usual.
   *
   * Pass the paths inline, or `as const`, to get a precise result type. Paths only known
   * as `string[]` give an `unknown` result type.
   *
   * @default []
   */
  exclude?: readonly string[] | undefined;

  /**
   * @deprecated Has no effect. Every key's case is detected from the key itself, both at
   * runtime and in the result type, so there is nothing to declare.
   */
  sourceCase?: StringCase | undefined;
}

/**
 * Internal options for transformation (used within the package).
 * They are resolved by `transform` before the recursion starts.
 */
export interface TransformOptionsInternal {
  /** The target casing format to transform to */
  targetCase: StringCase;

  /** How many nesting levels to transform (`Infinity` for all of them) */
  depth: number;

  /**
   * The `exclude` paths that match the keys leading to the value being transformed, or
   * `null` where none does (everywhere, without `exclude`)
   */
  exclude: ExcludeState | null;
}

/**
 * Rejects option names that are not in `Known` (by default, the options of `transform`).
 * The options object is inferred as a whole, so without this an object literal would
 * accept any extra property, typos such as `depht` included. The error names the
 * unknown option.
 */
export type NoUnknownOptions<Options, Known = TransformOptions> = {
  [K in Exclude<keyof Options, keyof Known>]: `Unknown option: ${K & string}`;
};

/**
 * `NoUnknownOptions` for `transformKey`, but `unknown` when every option name is known.
 * The options parameter is then `TransformKeyOptions` itself rather than an
 * intersection, so TypeScript checks the argument for a property in common with it, as
 * it does for every type whose properties are all optional: `'snake'`, an array, or a
 * stored options object with only a misspelled option is rejected.
 */
export type NoUnknownKeyOptions<Options> = [
  Exclude<keyof Options, keyof TransformKeyOptions>,
] extends [never]
  ? unknown
  : NoUnknownOptions<Options, TransformKeyOptions>;

/** `To` as a plain case literal, or `'camel'` (the default) for `undefined` */
type CaseOrDefault<To> = To extends undefined ? 'camel' : PlainCase<To>;

/**
 * The target case the runtime uses for one options object: `'camel'` when `targetCase`
 * is omitted or `undefined`.
 */
export type TargetCaseOf<Options> = 'targetCase' extends keyof Options
  ? CaseOrDefault<Options['targetCase']>
  : 'camel';

/**
 * The depth the runtime uses for one options object: `undefined` (every level) when
 * `depth` is omitted.
 */
export type DepthOf<Options> = 'depth' extends keyof Options
  ? Options['depth']
  : undefined;

/**
 * The `exclude` paths the runtime uses for one options object: `undefined` (none) when
 * `exclude` is omitted.
 */
export type ExcludeOf<Options> = 'exclude' extends keyof Options
  ? Options['exclude']
  : undefined;
