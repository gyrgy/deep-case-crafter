import { Expand } from './helperTypes';
import { StringCase } from './stringCaseTypes';
import { TransformOptions } from './transformOptionTypes';
/**
 * Type utility that transforms a snake_case string to camelCase
 * Example: 'hello_world' -> 'helloWorld'
 */
export type SnakeToCamel<S extends string> =
  S extends `${infer P}_${infer C}${infer R}`
    ? `${P}${Uppercase<C>}${SnakeToCamel<R>}`
    : S;

/**
 * Type utility that transforms a snake_case string to PascalCase
 * Example: 'hello_world' -> 'HelloWorld'
 */
type SnakeWordsToPascal<Parts extends string[]> = Parts extends [
  infer First extends string,
  ...infer Rest extends string[],
]
  ? `${Capitalize<First>}${SnakeWordsToPascal<Rest>}`
  : '';

type SnakeToWords<S extends string> = S extends `${infer P}_${infer R}`
  ? [P, ...SnakeToWords<R>]
  : [S];

export type SnakeToPascal<S extends string> = S extends `${infer P}_${infer R}`
  ? SnakeWordsToPascal<[P, ...SnakeToWords<R>]>
  : Capitalize<S>;

/**
 * Type utility that transforms a snake_case string to kebab-case
 * Example: 'hello_world' -> 'hello-world'
 */
export type SnakeToKebab<S extends string> = S extends `${infer P}_${infer R}`
  ? `${P}-${SnakeToKebab<R>}`
  : S;

/**
 * Type utility that transforms a camelCase string to snake_case
 * Example: 'helloWorld' -> 'hello_world'
 */
export type CamelToSnake<S extends string> = S extends `${infer C}${infer R}`
  ? C extends Uppercase<C>
    ? `_${Lowercase<C>}${CamelToSnake<R>}`
    : `${C}${CamelToSnake<R>}`
  : S;

/**
 * Type utility that transforms a camelCase string to PascalCase
 * Example: 'helloWorld' -> 'HelloWorld'
 */
export type CamelToPascal<S extends string> = Capitalize<S>;

/**
 * Type utility that transforms a camelCase string to kebab-case
 * Example: 'helloWorld' -> 'hello-world'
 */
export type CamelToKebab<S extends string> = S extends `${infer C}${infer R}`
  ? C extends Uppercase<C>
    ? `-${Lowercase<C>}${CamelToKebab<R>}`
    : `${C}${CamelToKebab<R>}`
  : S;

/**
 * Type utility that transforms a PascalCase string to camelCase
 * Example: 'HelloWorld' -> 'helloWorld'
 */
export type PascalToCamel<S extends string> = S extends `${infer F}${infer R}`
  ? `${Lowercase<F>}${R}`
  : S;

/**
 * Type utility that transforms a PascalCase string to snake_case
 * Example: 'HelloWorld' -> 'hello_world'
 */
export type PascalToSnake<S extends string> = S extends `${infer F}${infer R}`
  ? R extends ``
    ? Lowercase<F>
    : `${Lowercase<F>}${PascalToSnakeInner<R>}`
  : S;

type PascalToSnakeInner<S extends string> = S extends `${infer C}${infer R}`
  ? C extends Uppercase<C>
    ? `_${Lowercase<C>}${PascalToSnakeInner<R>}`
    : `${C}${PascalToSnakeInner<R>}`
  : S;

/**
 * Type utility that transforms a PascalCase string to kebab-case
 * Example: 'HelloWorld' -> 'hello-world'
 */
export type PascalToKebab<S extends string> = S extends `${infer F}${infer R}`
  ? R extends ``
    ? Lowercase<F>
    : `${Lowercase<F>}${PascalToKebabInner<R>}`
  : S;

type PascalToKebabInner<S extends string> = S extends `${infer C}${infer R}`
  ? C extends Uppercase<C>
    ? `-${Lowercase<C>}${PascalToKebabInner<R>}`
    : `${C}${PascalToKebabInner<R>}`
  : S;

/**
 * Type utility that transforms a kebab-case string to camelCase
 * Example: 'hello-world' -> 'helloWorld'
 */
export type KebabToCamel<S extends string> =
  S extends `${infer P}-${infer C}${infer R}`
    ? `${P}${Uppercase<C>}${KebabToCamel<R>}`
    : S;

/**
 * Type utility that transforms a kebab-case string to PascalCase
 * Example: 'hello-world' -> 'HelloWorld'
 */
type KebabWordsToPascal<Parts extends string[]> = Parts extends [
  infer First extends string,
  ...infer Rest extends string[],
]
  ? `${Capitalize<First>}${KebabWordsToPascal<Rest>}`
  : '';

type KebabToWords<S extends string> = S extends `${infer P}-${infer R}`
  ? [P, ...KebabToWords<R>]
  : [S];

/**
 * Type utility that transforms a kebab-case string to PascalCase
 * Example: 'hello-world' -> 'HelloWorld'
 */
export type KebabToPascal<S extends string> = S extends `${infer P}-${infer R}`
  ? KebabWordsToPascal<[P, ...KebabToWords<R>]>
  : Capitalize<S>;

/**
 * Type utility that transforms a kebab-case string to snake_case
 * Example: 'hello-world' -> 'hello_world'
 */
export type KebabToSnake<S extends string> = S extends `${infer P}-${infer R}`
  ? `${P}_${KebabToSnake<R>}`
  : S;

// /**
//  * Utility type to detect preserved keys that shouldn't be transformed.
//  * Preserved keys include those with leading/trailing special characters,
//  * unsupported patterns, or invalid starting/ending characters.
//  */
// type ForbiddenStartChars = '_' | '-' | '$' | '&' | '%' | '#';
// type ForbiddenEndChars = '_' | '-' | '$' | '&' | '%' | '#';

// type PreservedKey<K extends string> =
//   // Starts with a forbidden character or ends with a forbidden character (allowing numbers at the end)
//   K extends `${infer First}${string}`
//     ? First extends ForbiddenStartChars
//       ? true
//       : K extends `${string}${infer Last}`
//         ? Last extends ForbiddenEndChars | `${number}`
//           ? true
//           : K extends `${string}__${string}` | `${string}--${string}`
//             ? true
//             : false
//         : false
//     : false;

/**
 * Utility type to detect preserved keys that shouldn't be transformed.
 * Preserved keys include those with leading/trailing special characters,
 * unsupported patterns, or invalid starting/ending characters.
 */
type ForbiddenStartChars =
  | '_'
  | '-'
  | '$'
  | '&'
  | '%'
  | '#'
  | '@'
  | '!'
  | '*'
  | '+'
  | '='
  | '~'
  | '`'
  | '^'
  | '('
  | ')'
  | '['
  | ']'
  | '{'
  | '}'
  | '|'
  | '\\'
  | ':'
  | ';'
  | '"'
  | "'"
  | '<'
  | '>'
  | ','
  | '.'
  | '?'
  | '/';

type ForbiddenEndChars =
  | '_'
  | '-'
  | '$'
  | '&'
  | '%'
  | '#'
  | '@'
  | '!'
  | '*'
  | '+'
  | '='
  | '~'
  | '`'
  | '^'
  | '('
  | ')'
  | '['
  | ']'
  | '{'
  | '}'
  | '|'
  | '\\'
  | ':'
  | ';'
  | '"'
  | "'"
  | '<'
  | '>'
  | ','
  | '.'
  | '?'
  | '/'
  | `${number}`;

type PreservedKey<K extends string> =
  // Starts with a forbidden character or ends with a forbidden character (allowing numbers at the end)
  K extends `${infer First}${string}`
    ? First extends ForbiddenStartChars
      ? true
      : K extends `${string}${infer Last}`
        ? Last extends ForbiddenEndChars
          ? true
          : K extends `${string}__${string}` | `${string}--${string}`
            ? true
            : false
        : false
    : false;

/**
 * Type utility that selects the correct string transformation based on source and target casing
 */
export type TransformKey<K extends string, O extends TransformOptions> =
  PreservedKey<K> extends true
    ? K // Preserve keys that match special patterns
    : undefined extends O['sourceCase']
      ? string // When source is not specified, we can't guarantee the exact transformation
      : O['sourceCase'] extends 'snake'
        ? undefined extends O['targetCase']
          ? SnakeToCamel<K> // Default to camelCase when casing is not specified
          : O['targetCase'] extends 'camel'
            ? SnakeToCamel<K>
            : O['targetCase'] extends 'pascal'
              ? SnakeToPascal<K>
              : O['targetCase'] extends 'kebab'
                ? SnakeToKebab<K>
                : K
        : O['sourceCase'] extends 'camel'
          ? undefined extends O['targetCase']
            ? K // No transformation needed if target is not specified
            : O['targetCase'] extends 'snake'
              ? CamelToSnake<K>
              : O['targetCase'] extends 'pascal'
                ? CamelToPascal<K>
                : O['targetCase'] extends 'kebab'
                  ? CamelToKebab<K>
                  : K
          : O['sourceCase'] extends 'pascal'
            ? undefined extends O['targetCase']
              ? PascalToCamel<K> // Default to camelCase when casing is not specified
              : O['targetCase'] extends 'camel'
                ? PascalToCamel<K>
                : O['targetCase'] extends 'snake'
                  ? PascalToSnake<K>
                  : O['targetCase'] extends 'kebab'
                    ? PascalToKebab<K>
                    : K
            : O['sourceCase'] extends 'kebab'
              ? undefined extends O['targetCase']
                ? KebabToCamel<K> // Default to camelCase when casing is not specified
                : O['targetCase'] extends 'camel'
                  ? KebabToCamel<K>
                  : O['targetCase'] extends 'pascal'
                    ? KebabToPascal<K>
                    : O['targetCase'] extends 'snake'
                      ? KebabToSnake<K>
                      : K
              : K; // Fallback

/**
 * Type utility that transforms all keys in an object from the source case to the target case
 */
export type TransformObjectKeys<
  T,
  O extends TransformOptions = { targetCase: 'camel' },
> = {
  [K in keyof T as TransformKey<K & string, O>]: T[K];
};

/**
 * Helper type to determine the return type of transformObject based on options
 */
export type TransformObjectReturn<T, O> = O extends { sourceCase: StringCase }
  ? Expand<TransformObjectKeys<T, O>>
  : Record<string | number | symbol, unknown>;

/**
 * Helper type to determine the return type of transformMap based on options
 */
export type TransformMapReturn<K, V, O> = O extends { sourceCase: StringCase }
  ? Map<K extends string ? TransformKey<K & string, O> : K, V>
  : Map<string | Exclude<K, string>, V>;

/**
 * Object transformation type aliases
 * These provide more readable type names for common transformations
 */

// Snake case object transformations
export type SnakeToCamelObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'snake'; targetCase: 'camel' }
>;
export type SnakeToPascalObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'snake'; targetCase: 'pascal' }
>;
export type SnakeToKebabObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'snake'; targetCase: 'kebab' }
>;

// Camel case object transformations
export type CamelToSnakeObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'camel'; targetCase: 'snake' }
>;
export type CamelToPascalObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'camel'; targetCase: 'pascal' }
>;
export type CamelToKebabObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'camel'; targetCase: 'kebab' }
>;

// Pascal case object transformations
export type PascalToCamelObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'pascal'; targetCase: 'camel' }
>;
export type PascalToSnakeObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'pascal'; targetCase: 'snake' }
>;
export type PascalToKebabObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'pascal'; targetCase: 'kebab' }
>;

// Kebab case object transformations
export type KebabToCamelObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'kebab'; targetCase: 'camel' }
>;
export type KebabToPascalObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'kebab'; targetCase: 'pascal' }
>;
export type KebabToSnakeObject<T> = TransformObjectKeys<
  T,
  { sourceCase: 'kebab'; targetCase: 'snake' }
>;

/**
 * Array transformation type aliases
 */
// Snake case array transformations
export type SnakeToCamelArray<T> = Array<SnakeToCamelObject<T>>;
export type SnakeToPascalArray<T> = Array<SnakeToPascalObject<T>>;
export type SnakeToKebabArray<T> = Array<SnakeToKebabObject<T>>;

// Camel case array transformations
export type CamelToSnakeArray<T> = Array<CamelToSnakeObject<T>>;
export type CamelToPascalArray<T> = Array<CamelToPascalObject<T>>;
export type CamelToKebabArray<T> = Array<CamelToKebabObject<T>>;

// Pascal case array transformations
export type PascalToCamelArray<T> = Array<PascalToCamelObject<T>>;
export type PascalToSnakeArray<T> = Array<PascalToSnakeObject<T>>;
export type PascalToKebabArray<T> = Array<PascalToKebabObject<T>>;

// Kebab case array transformations
export type KebabToCamelArray<T> = Array<KebabToCamelObject<T>>;
export type KebabToPascalArray<T> = Array<KebabToPascalObject<T>>;
export type KebabToSnakeArray<T> = Array<KebabToSnakeObject<T>>;

/**
 * Generic transformation utility for objects
 */
export type TransformObject<
  T,
  From extends StringCase,
  To extends StringCase,
> = TransformObjectKeys<T, { sourceCase: From; targetCase: To }>;

/**
 * Generic transformation utility for arrays
 */
export type TransformArray<
  T,
  From extends StringCase,
  To extends StringCase,
> = Array<TransformObject<T, From, To>>;

/**
 * Helper type to determine array return type based on options
 */
export type TransformArrayReturn<T extends unknown[], O> = O extends {
  sourceCase: StringCase;
}
  ? {
      [K in keyof T]: T[K] extends object
        ? TransformObjectKeys<T[K], O>
        : T[K] extends Map<infer KT, infer VT>
          ? Map<KT extends string ? string : KT, VT>
          : T[K];
    }
  : unknown[];

/**
 * Recursive type transformations
 * These types handle nested structures like arrays, objects, Maps, and Sets
 */

// Snake case to other formats (recursive)
export type SnakeToCamelRecursive<T> =
  T extends Array<infer U>
    ? Array<SnakeToCamelRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? SnakeToCamel<K> : K, SnakeToCamelRecursive<V>>
      : T extends Set<infer V>
        ? Set<SnakeToCamelRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'snake'; targetCase: 'camel' }
              >]: SnakeToCamelRecursive<T[K]>;
            }
          : T;

export type SnakeToPascalRecursive<T> =
  T extends Array<infer U>
    ? Array<SnakeToPascalRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? SnakeToPascal<K> : K, SnakeToPascalRecursive<V>>
      : T extends Set<infer V>
        ? Set<SnakeToPascalRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'snake'; targetCase: 'pascal' }
              >]: SnakeToPascalRecursive<T[K]>;
            }
          : T;

export type SnakeToKebabRecursive<T> =
  T extends Array<infer U>
    ? Array<SnakeToKebabRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? SnakeToKebab<K> : K, SnakeToKebabRecursive<V>>
      : T extends Set<infer V>
        ? Set<SnakeToKebabRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'snake'; targetCase: 'kebab' }
              >]: SnakeToKebabRecursive<T[K]>;
            }
          : T;

// Camel case to other formats (recursive)
export type CamelToSnakeRecursive<T> =
  T extends Array<infer U>
    ? Array<CamelToSnakeRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? CamelToSnake<K> : K, CamelToSnakeRecursive<V>>
      : T extends Set<infer V>
        ? Set<CamelToSnakeRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'camel'; targetCase: 'snake' }
              >]: CamelToSnakeRecursive<T[K]>;
            }
          : T;

export type CamelToPascalRecursive<T> =
  T extends Array<infer U>
    ? Array<CamelToPascalRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? CamelToPascal<K> : K, CamelToPascalRecursive<V>>
      : T extends Set<infer V>
        ? Set<CamelToPascalRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'camel'; targetCase: 'pascal' }
              >]: CamelToPascalRecursive<T[K]>;
            }
          : T;

export type CamelToKebabRecursive<T> =
  T extends Array<infer U>
    ? Array<CamelToKebabRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? CamelToKebab<K> : K, CamelToKebabRecursive<V>>
      : T extends Set<infer V>
        ? Set<CamelToKebabRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'camel'; targetCase: 'kebab' }
              >]: CamelToKebabRecursive<T[K]>;
            }
          : T;

// Pascal case to other formats (recursive)
export type PascalToCamelRecursive<T> =
  T extends Array<infer U>
    ? Array<PascalToCamelRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? PascalToCamel<K> : K, PascalToCamelRecursive<V>>
      : T extends Set<infer V>
        ? Set<PascalToCamelRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'pascal'; targetCase: 'camel' }
              >]: PascalToCamelRecursive<T[K]>;
            }
          : T;

export type PascalToSnakeRecursive<T> =
  T extends Array<infer U>
    ? Array<PascalToSnakeRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? PascalToSnake<K> : K, PascalToSnakeRecursive<V>>
      : T extends Set<infer V>
        ? Set<PascalToSnakeRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'pascal'; targetCase: 'snake' }
              >]: PascalToSnakeRecursive<T[K]>;
            }
          : T;

export type PascalToKebabRecursive<T> =
  T extends Array<infer U>
    ? Array<PascalToKebabRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? PascalToKebab<K> : K, PascalToKebabRecursive<V>>
      : T extends Set<infer V>
        ? Set<PascalToKebabRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'pascal'; targetCase: 'kebab' }
              >]: PascalToKebabRecursive<T[K]>;
            }
          : T;

// Kebab case to other formats (recursive)
export type KebabToCamelRecursive<T> =
  T extends Array<infer U>
    ? Array<KebabToCamelRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? KebabToCamel<K> : K, KebabToCamelRecursive<V>>
      : T extends Set<infer V>
        ? Set<KebabToCamelRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'kebab'; targetCase: 'camel' }
              >]: KebabToCamelRecursive<T[K]>;
            }
          : T;

export type KebabToPascalRecursive<T> =
  T extends Array<infer U>
    ? Array<KebabToPascalRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? KebabToPascal<K> : K, KebabToPascalRecursive<V>>
      : T extends Set<infer V>
        ? Set<KebabToPascalRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'kebab'; targetCase: 'pascal' }
              >]: KebabToPascalRecursive<T[K]>;
            }
          : T;

export type KebabToSnakeRecursive<T> =
  T extends Array<infer U>
    ? Array<KebabToSnakeRecursive<U>>
    : T extends Map<infer K, infer V>
      ? Map<K extends string ? KebabToSnake<K> : K, KebabToSnakeRecursive<V>>
      : T extends Set<infer V>
        ? Set<KebabToSnakeRecursive<V>>
        : T extends object
          ? {
              [K in keyof T as TransformKey<
                K & string,
                { sourceCase: 'kebab'; targetCase: 'snake' }
              >]: KebabToSnakeRecursive<T[K]>;
            }
          : T;

/**
 * Generic recursive transformation type
 * Allows dynamically selecting the transformation based on source and target cases
 */
export type TransformRecursive<
  T,
  FromCase extends StringCase,
  ToCase extends StringCase,
> = FromCase extends 'snake'
  ? ToCase extends 'camel'
    ? SnakeToCamelRecursive<T>
    : ToCase extends 'pascal'
      ? SnakeToPascalRecursive<T>
      : ToCase extends 'kebab'
        ? SnakeToKebabRecursive<T>
        : T
  : FromCase extends 'camel'
    ? ToCase extends 'snake'
      ? CamelToSnakeRecursive<T>
      : ToCase extends 'pascal'
        ? CamelToPascalRecursive<T>
        : ToCase extends 'kebab'
          ? CamelToKebabRecursive<T>
          : T
    : FromCase extends 'pascal'
      ? ToCase extends 'snake'
        ? PascalToSnakeRecursive<T>
        : ToCase extends 'camel'
          ? PascalToCamelRecursive<T>
          : ToCase extends 'kebab'
            ? PascalToKebabRecursive<T>
            : T
      : FromCase extends 'kebab'
        ? ToCase extends 'snake'
          ? KebabToSnakeRecursive<T>
          : ToCase extends 'camel'
            ? KebabToCamelRecursive<T>
            : ToCase extends 'pascal'
              ? KebabToPascalRecursive<T>
              : T
        : T;
