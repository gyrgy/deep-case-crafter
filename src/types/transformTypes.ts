import { IsAny } from './helperTypes';
import { TransformKey } from './keyTypes';
import { PlainCase, StringCase } from './stringCaseTypes';
import { DepthOf, TargetCaseOf } from './transformOptionTypes';

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
 * The exact type `transform` returns for `data` of type `T`, transformed to `To` (default
 * `'camel'`) for `Depth` nesting levels (default: all of them).
 *
 * `To` and `Depth` distribute over unions: when they are only known to be one of several
 * values, the result is the union of the possible results. A depth that is not a numeric
 * literal (`number`, including `Infinity`) cannot be known, so the result is `unknown`,
 * as it is for a `To` or `Depth` typed `any`. String enum members and branded literals
 * are accepted for `To`.
 *
 * @example
 * ```typescript
 * type User = TransformResult<{ user_id: number; created_at: Date }>;
 * // => { userId: number; createdAt: Date }
 * ```
 */
export type TransformResult<
  T,
  To extends StringCase = 'camel',
  Depth extends number | undefined = undefined,
> =
  IsAny<To> extends true
    ? unknown
    : IsAny<Depth> extends true
      ? unknown
      : To extends unknown
        ? TransformToDepth<T, PlainCase<To>, Depth>
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
 * The result for one options object. An optional `targetCase` or `depth` may also be
 * omitted, which uses its default; those results are added explicitly because, without
 * `strictNullChecks`, `undefined` disappears from the property's type.
 */
type TransformResultForOne<
  T,
  Options,
  To extends StringCase = TargetCaseOf<Options>,
  Depth extends number | undefined = DepthOf<Options> extends infer D extends
    | number
    | undefined
    ? D
    : never,
> =
  | TransformResult<T, To, Depth>
  | (IsOptional<Options, 'targetCase'> extends true
      ? TransformResult<T, 'camel', Depth>
      : never)
  | (IsOptional<Options, 'depth'> extends true
      ? TransformResult<T, To, undefined>
      : never)
  | (IsOptional<Options, 'targetCase'> extends true
      ? IsOptional<Options, 'depth'> extends true
        ? TransformResult<T, 'camel', undefined>
        : never
      : never);

/**
 * The result type for an options object. Each member of a union of options objects gives
 * its own result, so its `targetCase` and `depth` stay paired. Options typed `any`, or
 * with a `targetCase` or `depth` typed `any`, say nothing about the result: `unknown`.
 */
export type TransformResultFor<T, Options> =
  IsAny<Options> extends true
    ? unknown
    : Options extends unknown
      ? IsAnyOption<Options, 'targetCase'> extends true
        ? unknown
        : IsAnyOption<Options, 'depth'> extends true
          ? unknown
          : TransformResultForOne<T, Options>
      : never;
