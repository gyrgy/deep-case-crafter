import internalTransform from './internalTransform';
import { STRING_CASES } from '../constants/stringCases';
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
import isStringCase from '../utils/isStringCase';

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
 * level unless `depth` is set.
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
 * The type parameter defaults only apply when type arguments are passed explicitly, and
 * give an `unknown` result type. An explicit `any` as the second type argument was the
 * output type before `To` existed, so it still gives `any` (`To` is `any` there, while
 * the options keep their default type); a `targetCase` typed `any` gives `unknown`.
 */
function transform<
  T,
  To extends StringCase | undefined = StringCase | undefined,
  Depth extends number | undefined = number | undefined,
  Options extends TransformOptions = TransformOptions,
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
 * and the result type is inferred, `depth` included. This form does not accept `depth`.
 */
function transform<T, From extends StringCase, To extends StringCase>(
  data: T,
  options: { sourceCase: From; targetCase: To; depth?: undefined },
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
  const targetCase = options?.targetCase || 'camel';
  const depth = options?.depth ?? Infinity;

  // Plain JavaScript callers can pass anything; reject it before any key is converted
  if (!isStringCase(targetCase)) {
    throw new TypeError(
      `Unsupported targetCase ${describeValue(targetCase)}. Use one of: ${STRING_CASES.join(', ')}.`,
    );
  }
  if (typeof depth !== 'number' || Number.isNaN(depth)) {
    throw new TypeError(
      `Unsupported depth ${describeValue(depth)}. Use a number, or omit depth to transform every level.`,
    );
  }

  const internalOptions: TransformOptionsInternal = { targetCase, depth };

  return internalTransform(data, internalOptions);
}

export default transform;
