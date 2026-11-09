import runTransform from './runTransform';
import resolveExclude from './exclude/resolveExclude';
import { StringCase } from '../types/stringCaseTypes';
import {
  NoUnknownOptions,
  TransformToOptions,
} from '../types/transformOptionTypes';
import { TransformTo } from '../types/transformTypes';
import rejectTransformToArguments from '../utils/rejectTransformToArguments';
import resolveDepth from '../utils/resolveDepth';
import resolveKeepReferences from '../utils/resolveKeepReferences';
import resolveTargetCase from '../utils/resolveTargetCase';

/**
 * Makes a function that transforms the keys of its argument to `targetCase`, at every
 * nesting level, as `transform(data, { targetCase })` does. The function uses only its
 * first argument, so it can be passed as a callback, and its result type is exact there
 * too: `fetchUser().then(transformTo('camel'))`, `items.map(transformTo('snake'))`.
 *
 * As for `transform`, an `undefined` target case means `'camel'`.
 */
function transformTo<To extends StringCase | undefined>(
  targetCase: To,
  options?: undefined,
): TransformTo<To>;

/**
 * Makes a function that transforms the keys of its argument to `targetCase`, at every
 * nesting level unless `depth` is set, except the keys at the `exclude` paths, as
 * `transform` does with the same options. The function uses only its first argument, so
 * it can be passed as a callback, and its result type is exact there too.
 *
 * The options are checked and read here, once: changing the options object or the
 * `exclude` array afterwards does not change the function.
 *
 * As in `transform`, `Depth` captures a literal `depth`, and `Options` the options object
 * as a whole, with an inline `exclude` array as a tuple of string literals. Options typed
 * loosely, such as `TransformToOptions` itself, match too, and give results typed
 * `unknown`, as they do for `transform`.
 *
 * `NoUnknownOptions` rejects unknown option names, `targetCase` included, which is the
 * first argument. It sees only the names every member of a union has, so `targetCase?:
 * undefined` rejects a target case in any member as well, and `length?: never` rejects
 * arrays and functions, which `object` and an empty `NoUnknownOptions` would let through.
 * An options object that may itself be `undefined` does not match this overload, and gets
 * results typed `unknown` from the last one.
 */
function transformTo<
  To extends StringCase | undefined,
  Depth extends number | undefined = number | undefined,
  Options extends TransformToOptions & {
    exclude?:
      | readonly [...Paths]
      | readonly [string?]
      | readonly string[]
      | undefined;
  } = TransformToOptions,
  Paths extends readonly string[] = readonly string[],
>(
  targetCase: To,
  options: Options & {
    depth?: Depth;
    targetCase?: undefined;
    length?: never;
  } & NoUnknownOptions<Options, TransformToOptions> &
    object,
): TransformTo<To, Options>;

/**
 * Makes a function that transforms the keys of its argument to `targetCase`, as
 * `transform` does with the same options, for options that are not known exactly: an
 * options object that may be `undefined`, or one with properties that are not options.
 * The function's results are typed `unknown`. A `targetCase` among the options is
 * rejected here too, as it is at runtime.
 */
function transformTo<To extends StringCase | undefined>(
  targetCase: To,
  options?: TransformToOptions & { targetCase?: undefined },
): TransformTo<To, TransformToOptions>;

// Implementation
function transformTo(
  targetCase: StringCase | undefined,
  options?: TransformToOptions,
): (data: unknown) => unknown {
  // Plain JavaScript callers can pass anything; reject it before the function is made.
  // A number in place of the options, the index `map` passes, has none of them.
  rejectTransformToArguments(targetCase, options);
  const resolvedCase = resolveTargetCase(targetCase);
  const depth = resolveDepth(options?.depth);
  const keepReferences = resolveKeepReferences(options?.keepReferences);
  // A copy of the paths: changing the array afterwards does not change the function
  const exclude = options?.exclude;
  const paths = resolveExclude(Array.isArray(exclude) ? [...exclude] : exclude);

  return (data) =>
    runTransform(data, resolvedCase, depth, keepReferences, paths);
}

export default transformTo;
