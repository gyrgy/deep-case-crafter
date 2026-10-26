import { KeyCases, KeyName, PathEnds, PathsBelow } from './excludeTypes';
import { IsAny, IsStringLiteral } from './helperTypes';
import { TransformKey } from './keyTypes';
import { PlainCase, StringCase } from './stringCaseTypes';
import { DepthOf, ExcludeOf, TargetCaseOf } from './transformOptionTypes';

/** Primitive values, including branded ones such as `string & { __brand: 'UserId' }` */
type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * Values the runtime returns untouched that TypeScript can recognise: functions and
 * classes, `Date`, `RegExp`, and built-ins that declare a `Symbol.toStringTag` (typed
 * arrays, `ArrayBuffer`, `DataView`, `Promise`, `WeakMap`, `WeakSet`, ...).
 *
 * `Error`, `URL` and other host objects are returned untouched as well, but their types
 * cannot be told apart from plain objects (an `Error` is any `{ name, message }`).
 */
type UntouchedValue =
  // The global Function type covers every function, class and value typed as Function
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  Function | Date | RegExp | { readonly [Symbol.toStringTag]: string };

/**
 * `true` once `Level` (the nesting level so far, as a tuple) reaches `Depth`.
 * `Depth` is `undefined` when every level is transformed. The `undefined` check comes
 * first and is not distributive, so it also holds without `strictNullChecks`; comparing
 * `Depth extends Level['length']` also accepts a branded depth such as `1 & Brand`.
 */
type IsDepthReached<
  Depth extends number | undefined,
  Level extends unknown[],
> = [Depth] extends [undefined]
  ? false
  : Depth extends Level['length']
    ? true
    : false;

/**
 * The nesting level of the values of an object, Map or Set. With unlimited depth the
 * level stays `[]`, so recursive data types reuse the same instantiation.
 */
type NextLevel<Depth extends number | undefined, Level extends unknown[]> = [
  Depth,
] extends [undefined]
  ? Level
  : [...Level, unknown];

/**
 * Transforms `T` the way `internalTransform` does: arrays keep their nesting level,
 * while the values of objects, Maps and Sets are one level deeper.
 *
 * Arrays are typed as arrays of transformed items, which lets TypeScript defer
 * recursive types such as a JSON value type; only tuples are mapped position by position.
 *
 * Use `TransformResult` instead. This type is exported only so that declaration files
 * can refer to it: the result of a generic wrapper around `transform` is written in terms
 * of it, and an unexported recursive type would have to be expanded there without end.
 */
export type TransformValue<
  T,
  To extends StringCase,
  Depth extends number | undefined,
  Level extends unknown[],
> =
  IsAny<T> extends true
    ? T
    : IsDepthReached<Depth, Level> extends true
      ? T
      : T extends Primitive
        ? T
        : T extends readonly (infer Item)[]
          ? number extends T['length']
            ? T extends unknown[]
              ? TransformValue<Item, To, Depth, Level>[]
              : readonly TransformValue<Item, To, Depth, Level>[]
            : { [I in keyof T]: TransformValue<T[I], To, Depth, Level> }
          : T extends ReadonlyMap<infer K, infer V>
            ? Map<
                K extends string ? TransformKey<K, To> : K,
                TransformValue<V, To, Depth, NextLevel<Depth, Level>>
              >
            : T extends ReadonlySet<infer V>
              ? Set<TransformValue<V, To, Depth, NextLevel<Depth, Level>>>
              : T extends UntouchedValue
                ? T
                : T extends object
                  ? {
                      [K in keyof T as K extends string
                        ? TransformKey<K, To>
                        : K]: K extends symbol
                        ? T[K] // symbol-keyed values are copied unchanged
                        : TransformValue<
                            T[K],
                            To,
                            Depth,
                            NextLevel<Depth, Level>
                          >;
                    }
                  : T;

/**
 * `TransformValue` while `exclude` paths still match: `Paths` is the rest of each of them
 * below this level (see `excludeTypes.ts`). A key at which a path ends keeps its name,
 * and the paths that continue below a key go on into its value. Arrays and Sets pass
 * them on to their items, which add no key to a path. Values that no path reaches are
 * transformed by `TransformValue`.
 *
 * Use `TransformResult` instead. This type is exported for the same reason as
 * `TransformValue`.
 */
export type TransformValueExcluding<
  T,
  To extends StringCase,
  Depth extends number | undefined,
  Level extends unknown[],
  Paths extends string,
> =
  IsAny<T> extends true
    ? T
    : IsDepthReached<Depth, Level> extends true
      ? T
      : T extends Primitive
        ? T
        : T extends readonly (infer Item)[]
          ? number extends T['length']
            ? T extends unknown[]
              ? TransformValueExcluding<Item, To, Depth, Level, Paths>[]
              : readonly TransformValueExcluding<
                  Item,
                  To,
                  Depth,
                  Level,
                  Paths
                >[]
            : {
                [I in keyof T]: TransformValueExcluding<
                  T[I],
                  To,
                  Depth,
                  Level,
                  Paths
                >;
              }
          : T extends ReadonlyMap<infer K, infer V>
            ? Map<
                ExcludingKey<K, To, PathEnds<Paths>>,
                TransformBelowMapKeys<
                  V,
                  To,
                  Depth,
                  NextLevel<Depth, Level>,
                  MapPathsBelow<K, Paths>
                >
              >
            : T extends ReadonlySet<infer V>
              ? Set<
                  TransformValueExcluding<
                    V,
                    To,
                    Depth,
                    NextLevel<Depth, Level>,
                    Paths
                  >
                >
              : T extends UntouchedValue
                ? T
                : T extends object
                  ? {
                      [K in keyof T as ExcludingKey<
                        K,
                        To,
                        PathEnds<Paths>
                      >]: K extends symbol
                        ? T[K] // symbol-keyed values are copied unchanged
                        : TransformBelowKey<
                            T[K],
                            To,
                            Depth,
                            NextLevel<Depth, Level>,
                            Paths,
                            KeyName<K & (string | number)>
                          >;
                    }
                  : T;

/**
 * A key of an object, or a member of a Map's key type: it keeps its name where a path
 * of `Ends` ends at it, and is transformed otherwise. A key type that is not a single
 * literal keeps its name only where `*` ends.
 */
type ExcludingKey<
  K,
  To extends StringCase,
  Ends extends string,
> = K extends string
  ? '*' extends Ends
    ? K
    : IsStringLiteral<K> extends true
      ? [KeyName<K> & Ends] extends [never]
        ? TransformKey<K, To>
        : K
      : TransformKey<K, To>
  : K;

/** `T` with the paths `Paths` that go on into it: by `TransformValue` once none is left */
type TransformBelow<
  T,
  To extends StringCase,
  Depth extends number | undefined,
  Level extends unknown[],
  Paths extends string,
> = [Paths] extends [never]
  ? TransformValue<T, To, Depth, Level>
  : TransformValueExcluding<T, To, Depth, Level, Paths>;

/**
 * The value `T` under the key `Key`. A key type that is not a single literal may stand
 * for several keys, which the paths may treat differently: each gives its own result.
 */
type TransformBelowKey<
  T,
  To extends StringCase,
  Depth extends number | undefined,
  Level extends unknown[],
  Paths extends string,
  Key extends string,
> =
  IsStringLiteral<Key> extends true
    ? TransformBelow<T, To, Depth, Level, PathsBelow<Paths, Key>>
    : TransformBelowEach<T, To, Depth, Level, Paths, KeyCases<Paths, Key>>;

/** `T` under each of `Keys` (distributes over them) */
type TransformBelowEach<
  T,
  To extends StringCase,
  Depth extends number | undefined,
  Level extends unknown[],
  Paths extends string,
  Keys extends string,
> = Keys extends unknown
  ? TransformBelow<T, To, Depth, Level, PathsBelow<Paths, Keys>>
  : never;

/**
 * The paths below the keys of a Map with key type `K`, one tuple per set of them: a Map
 * has one value type for all of its keys, while the paths below each key may differ.
 * Only `*` matches a key that is not a string, and a key type that may also hold strings
 * (`unknown`, `{}`) stands for every string key as well.
 */
type MapPathsBelow<K, Paths extends string> = K extends string
  ? IsStringLiteral<K> extends true
    ? [PathsBelow<Paths, KeyName<K>>]
    : EachPathsBelow<Paths, KeyCases<Paths, K>>
  : string extends K
    ? EachPathsBelow<Paths, KeyCases<Paths, string>>
    : [PathsBelow<Paths, '*'>];

/** The paths below each of `Keys`, as a tuple each (distributes over them) */
type EachPathsBelow<
  Paths extends string,
  Keys extends string,
> = Keys extends unknown ? [PathsBelow<Paths, Keys>] : never;

/** The value type of a Map, below each set of paths of `Below` (see `MapPathsBelow`) */
type TransformBelowMapKeys<
  V,
  To extends StringCase,
  Depth extends number | undefined,
  Level extends unknown[],
  Below,
> = Below extends [infer Paths extends string]
  ? TransformBelow<V, To, Depth, Level, Paths>
  : never;

/**
 * Applies a numeric literal `Depth`: a negative depth transforms nothing, and a
 * fractional depth is not supported precisely, so its result is `unknown`.
 */
type TransformWithDepth<
  T,
  To extends StringCase,
  Depth extends number,
> = `${Depth}` extends `-${string}`
  ? T
  : `${Depth}` extends `${string}${'.' | 'e'}${string}`
    ? unknown
    : TransformValue<T, To, Depth, []>;

/**
 * `true` for a numeric literal, branded or not (`2`, `2 & Brand`), and `false` for
 * `number` and a branded `number`: a literal shares no value with at least one of two
 * different literals, while `number` shares one with both.
 */
type IsNumberLiteral<N extends number> = [N & 0] extends [never]
  ? true
  : [N & 1] extends [never]
    ? true
    : false;

/**
 * The result for one `Depth` (distributes over a union of depths): every level for
 * `undefined`, `unknown` for a depth that is only known to be a `number`.
 */
type TransformToDepth<
  T,
  To extends StringCase,
  Depth extends number | undefined,
> = Depth extends unknown
  ? [Depth] extends [undefined]
    ? TransformValue<T, To, undefined, []>
    : IsNumberLiteral<Depth & number> extends true
      ? TransformWithDepth<T, To, Depth & number>
      : unknown
  : never;

/**
 * `TransformToDepth` (and `TransformWithDepth`) for the `exclude` paths `Paths`. Kept
 * apart, so that results without `exclude` take no extra step.
 */
type TransformToDepthExcluding<
  T,
  To extends StringCase,
  Depth extends number | undefined,
  Paths extends string,
> = Depth extends unknown
  ? [Depth] extends [undefined]
    ? TransformValueExcluding<T, To, undefined, [], Paths>
    : IsNumberLiteral<Depth & number> extends true
      ? `${Depth & number}` extends `-${string}`
        ? T
        : `${Depth & number}` extends `${string}${'.' | 'e'}${string}`
          ? unknown
          : TransformValueExcluding<T, To, Depth & number, [], Paths>
      : unknown
  : never;

/**
 * The result for an `exclude` tuple, collecting its paths into `Paths`. A union element
 * stands for several tuples, which give their own results. A path with an empty key makes
 * `transform` throw (`never`), and paths that are not all known (`string[]`, a rest
 * element, a `string` element) give `unknown`.
 */
type TransformExcluding<
  T,
  To extends StringCase,
  Depth extends number | undefined,
  Exclude extends readonly string[],
  Paths extends string = never,
> = Exclude extends readonly []
  ? [Paths] extends [never]
    ? TransformToDepth<T, To, Depth>
    : TransformToDepthExcluding<T, To, Depth, Paths>
  : Exclude extends readonly [
        infer Path extends string,
        ...infer Rest extends readonly string[],
      ]
    ? Path extends unknown
      ? IsStringLiteral<Path> extends true
        ? Path extends '' | `.${string}` | `${string}.` | `${string}..${string}`
          ? never
          : TransformExcluding<T, To, Depth, Rest, Paths | Path>
        : unknown
      : never
    : unknown;

/**
 * Includes `true` when a member of `Exclude` is an array that is not a tuple (`string[]`,
 * or a tuple with a rest element), or when `Exclude` is `any`: paths that cannot be known.
 * Their result is `unknown`, and so is the result of a union that includes them, so
 * checking this first saves working out the other members.
 */
type HasUnknownPaths<Exclude> = Exclude extends readonly string[]
  ? number extends Exclude['length']
    ? true
    : false
  : false;

/**
 * The result for each member of `Exclude` (distributes over them): no path for an
 * `undefined` one.
 */
type TransformExcludingEach<
  T,
  To extends StringCase,
  Depth extends number | undefined,
  Exclude extends readonly string[] | undefined,
> =
  true extends HasUnknownPaths<Exclude>
    ? unknown
    : Exclude extends readonly string[]
      ? TransformExcluding<T, To, Depth, Exclude>
      : TransformToDepth<T, To, Depth>;

/**
 * The exact type `transform` returns for `data` of type `T`, transformed to `To` (default
 * `'camel'`) for `Depth` nesting levels (default: all of them), with the keys at the
 * `Exclude` paths left unchanged (the type of the `exclude` option; default: none).
 *
 * `To`, `Depth` and `Exclude` distribute over unions: when they are only known to be one
 * of several values, the result is the union of the possible results. A depth that is not
 * a numeric literal (`number`, including `Infinity`) cannot be known, so the result is
 * `unknown`, as it is for paths that are not a tuple of string literals (`string[]`), and
 * for a `To`, `Depth` or `Exclude` typed `any`. String enum members and branded literals
 * are accepted for `To`.
 *
 * @example
 * ```typescript
 * type User = TransformResult<{ user_id: number; created_at: Date }>;
 * // => { userId: number; createdAt: Date }
 *
 * type Page = TransformResult<
 *   { page_items: Record<string, { item_id: number }> },
 *   'camel',
 *   undefined,
 *   ['page_items.*']
 * >;
 * // => { pageItems: { [x: string]: { itemId: number } } }
 * ```
 */
export type TransformResult<
  T,
  To extends StringCase = 'camel',
  Depth extends number | undefined = undefined,
  Exclude extends readonly string[] | undefined = undefined,
> =
  IsAny<To | Depth | Exclude> extends true
    ? unknown
    : [Exclude] extends [undefined]
      ? To extends unknown
        ? TransformToDepth<T, PlainCase<To>, Depth>
        : never
      : To extends unknown
        ? TransformExcludingEach<T, PlainCase<To>, Depth, Exclude>
        : never;

/** `true` when `Options` may omit `Key` (an optional property) */
type IsOptional<Options, Key extends PropertyKey> = Key extends keyof Options
  ? Record<never, never> extends Pick<Options, Key>
    ? true
    : false
  : false;

/** `true` when the option `Key` of `Options` is typed `any` */
type IsAnyOption<Options, Key extends PropertyKey> = Key extends keyof Options
  ? IsAny<Options[Key]>
  : false;

/**
 * Includes `true` when a member of a union of options objects has a `targetCase` typed
 * `any` (check it with `true extends HasAnyTargetCase<Options>`)
 */
export type HasAnyTargetCase<Options> = Options extends unknown
  ? IsAnyOption<Options, 'targetCase'>
  : never;

/**
 * The result for one options object, with the `exclude` paths `Exclude`. An optional
 * `targetCase` or `depth` may also be omitted, which uses its default; those results are
 * added explicitly because, without `strictNullChecks`, `undefined` disappears from the
 * property's type.
 */
type TransformResultForOne<
  T,
  Options,
  Exclude extends readonly string[] | undefined = undefined,
  To extends StringCase = TargetCaseOf<Options>,
  Depth extends number | undefined = DepthOf<Options> extends infer D extends
    | number
    | undefined
    ? D
    : never,
> =
  | TransformResult<T, To, Depth, Exclude>
  | (IsOptional<Options, 'targetCase'> extends true
      ? TransformResult<T, 'camel', Depth, Exclude>
      : never)
  | (IsOptional<Options, 'depth'> extends true
      ? TransformResult<T, To, undefined, Exclude>
      : never)
  | (IsOptional<Options, 'targetCase'> extends true
      ? IsOptional<Options, 'depth'> extends true
        ? TransformResult<T, 'camel', undefined, Exclude>
        : never
      : never);

/**
 * The result for one options object with an `exclude` option, which may also be omitted
 * when it is optional (see `TransformResultForOne`). Options whose paths cannot be known,
 * such as `TransformOptions` itself, give `unknown` straight away.
 *
 * Use `TransformResult` instead. This type is exported only so that declaration files
 * can refer to it, as they do to `TransformResultFor`: the result of a generic wrapper
 * whose `exclude` paths are a type parameter is written in terms of it.
 */
export type TransformResultForExcluding<T, Options> =
  ExcludeOf<Options> extends infer Exclude extends readonly string[] | undefined
    ? true extends HasUnknownPaths<Exclude>
      ? unknown
      :
          | TransformResultForOne<T, Options, Exclude>
          | (IsOptional<Options, 'exclude'> extends true
              ? TransformResultForOne<T, Options>
              : never)
    : never;

/**
 * The result type for an options object. Each member of a union of options objects gives
 * its own result, so its `targetCase`, `depth` and `exclude` stay paired. Options typed
 * `any`, or with a `targetCase`, `depth` or `exclude` typed `any`, say nothing about the
 * result: `unknown`.
 */
export type TransformResultFor<T, Options> =
  IsAny<Options> extends true
    ? unknown
    : Options extends unknown
      ? IsAnyOption<Options, 'targetCase'> extends true
        ? unknown
        : IsAnyOption<Options, 'depth'> extends true
          ? unknown
          : 'exclude' extends keyof Options
            ? TransformResultForExcluding<T, Options>
            : TransformResultForOne<T, Options>
      : never;
