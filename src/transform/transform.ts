import { createExcludeState } from './excludePaths';
import internalTransform, { NESTING_LIMIT_REACHED } from './internalTransform';
import { IsAny } from '../types/helperTypes';
import { StringCase } from '../types/stringCaseTypes';
import {
  NoUnknownOptions,
  TransformOptions,
  TransformOptionsInternal,
} from '../types/transformOptionTypes';
import {
  HasAnyTargetCase,
  TransformResult,
  TransformResultFor,
} from '../types/transformTypes';
import describeValue from '../utils/describeValue';
import resolveTargetCase from '../utils/resolveTargetCase';

/**
 * Transforms the keys of `data` to camelCase, at every nesting level.
 *
 * Every key of the result type is typed the way the runtime transforms it, except in
 * values TypeScript cannot tell apart from plain objects (see "Result types" in the
 * readme).
 */
function transform<T>(data: T, options?: undefined): TransformResult<T>;

/**
 * Transforms the keys of `data` to `targetCase` (default `'camel'`), at every nesting
 * level unless `depth` is set, except the keys at the `exclude` paths.
 *
 * Every key of the result type is typed the way the runtime transforms it, except in
 * values TypeScript cannot tell apart from plain objects (see "Result types" in the
 * readme).
 *
 * `To` and `Depth` capture the literal values of `targetCase` and `depth`. `Options`
 * captures the options object as a whole, so a value that may be `undefined` (which the
 * runtime treats as omitted) is reflected in the result type, and each member of a union
 * of options objects gets its own result. `NoUnknownOptions` keeps rejecting unknown
 * option names. An options object that may itself be `undefined` matches neither this
 * overload nor the one above, and gets an `unknown` result type from the last one.
 *
 * The constraint of `Options` makes it capture an inline `exclude` array as a tuple of
 * string literals: `[...Paths]` keeps the strings literal, and `readonly [string?]`
 * makes TypeScript 4.7 read the array as a tuple, an empty one included; any array of
 * strings is still accepted, and so is `undefined`: with `exactOptionalPropertyTypes`, an
 * optional property only accepts it when its type includes it. The parameter type does
 * not mention `exclude` itself: intersecting the captured tuple with these types would
 * make every call compare array types member by member.
 *
 * The type parameter defaults only apply when type arguments are passed explicitly, and
 * give an `unknown` result type. An explicit `any` as the second type argument was the
 * output type before `To` existed, so it still gives `any` (`To` is `any` there, while
 * the options keep their default type); a `targetCase` typed `any` gives `unknown`.
 */
function transform<
  T,
  To extends StringCase | undefined = StringCase | undefined,
  Depth extends number | undefined = number | undefined,
  Options extends TransformOptions & {
    exclude?:
      | readonly [...Paths]
      | readonly [string?]
      | readonly string[]
      | undefined;
  } = TransformOptions,
  Paths extends readonly string[] = readonly string[],
>(
  data: T,
  options: Options & {
    targetCase?: To;
    depth?: Depth;
  } & NoUnknownOptions<Options>,
): IsAny<To> extends true
  ? true extends HasAnyTargetCase<Options>
    ? unknown
    : To
  : TransformResultFor<T, Options>;

/**
 * The 2.x form with explicit `<Data, SourceCase, TargetCase>` type arguments.
 *
 * @deprecated `sourceCase` has no effect: leave out the type arguments and `sourceCase`,
 * and the result type is inferred, `depth` and `exclude` included. This form does not
 * accept `depth`, `exclude` or `keepReferences`.
 */
function transform<T, From extends StringCase, To extends StringCase>(
  data: T,
  options: {
    sourceCase: From;
    targetCase: To;
    depth?: undefined;
    exclude?: undefined;
  },
): TransformResult<T, To>;

/**
 * Transform data to a specified output type.
 *
 * Note: When using this overload, type safety is not enforced between the input, options, and output type.
 * The deprecated 'sourceCase' option is not accepted here, as it has no effect.
 */
function transform<T, K>(
  data: T,
  options?: Omit<TransformOptions, 'sourceCase'>,
): K;

// Implementation
function transform(data: unknown, options?: TransformOptions): unknown {
  const targetCaseOption = options?.targetCase;
  const depth = options?.depth ?? Infinity;

  // Plain JavaScript callers can pass anything; reject it before any key is converted
  const targetCase = resolveTargetCase(targetCaseOption);
  if (typeof depth !== 'number' || Number.isNaN(depth)) {
    throw new TypeError(
      `Unsupported depth ${describeValue(depth)}. Use a number, or omit depth to transform every level.`,
    );
  }

  const exclude = options?.exclude;
  const keepReferences = options?.keepReferences ?? true;
  if (typeof keepReferences !== 'boolean') {
    throw new TypeError(
      `Unsupported keepReferences ${describeValue(keepReferences)}. Use true or false.`,
    );
  }

  if (!keepReferences) {
    try {
      return run(
        data,
        { targetCase, depth, keepReferences, exclude: null },
        exclude,
      );
    } catch (error) {
      // Nested too deep to go on without reference tables, as circular references are:
      // start over with them
      if (error !== NESTING_LIMIT_REACHED) throw error;
    }
  }
  return run(
    data,
    { targetCase, depth, keepReferences: true, exclude: null },
    exclude,
  );
}

/** Transforms `data` with the resolved options and the `exclude` option as passed */
function run(
  data: unknown,
  internalOptions: TransformOptionsInternal,
  exclude: unknown,
): unknown {
  const excludeState =
    exclude === undefined ? null : createExcludeState(exclude, internalOptions);

  return excludeState === null
    ? internalTransform(data, internalOptions)
    : internalTransform(data, excludeState.options, excludeState.visitedRefs);
}

export default transform;
