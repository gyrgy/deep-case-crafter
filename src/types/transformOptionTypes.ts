import { PlainCase, StringCase } from './stringCaseTypes';

/**
 * Options for the transform function
 */
export interface TransformOptions {
  /**
   * The target casing format to transform to
   * @default 'camel'
   */
  targetCase?: StringCase | undefined;

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
   * @deprecated Has no effect. Every key's case is detected from the key itself, both at
   * runtime and in the result type, so there is nothing to declare.
   */
  sourceCase?: StringCase | undefined;
}

/**
 * Internal options for transformation (used within the package).
 * Both fields are resolved by `transform` before the recursion starts.
 */
export interface TransformOptionsInternal {
  /** The target casing format to transform to */
  targetCase: StringCase;

  /** How many nesting levels to transform (`Infinity` for all of them) */
  depth: number;
}

/**
 * Rejects option names `transform` does not know. The options object is inferred as a
 * whole, so without this an object literal would accept any extra property, typos such
 * as `depht` included. The error names the unknown option.
 */
export type NoUnknownOptions<Options> = {
  [K in Exclude<keyof Options, keyof TransformOptions>]: `Unknown option: ${K &
    string}`;
};

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
