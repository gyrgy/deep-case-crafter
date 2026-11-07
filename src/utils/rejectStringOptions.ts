import describeValue from './describeValue';
import isStringCase from './isStringCase';

/**
 * Rejects a string passed where `transform` and `transformKey` take their options: the
 * likely mistake of passing the target case itself, as in `transform(data, 'snake')`,
 * which would otherwise convert to the default camelCase without an error. Another
 * string there most likely comes from a callback that passes a key, such as lodash's
 * `mapValues(object, transform)`. Other values that are not options objects are
 * ignored: `rows.map(transform)` and `keys.map(transformKey)` pass each item's index.
 *
 * @param options - The options argument, as passed
 * @throws {TypeError} If `options` is a string
 *
 * @example
 * ```typescript
 * rejectStringOptions({ targetCase: 'snake' }) // returns
 * rejectStringOptions('snake') // throws a TypeError
 * ```
 * @internal This function is for internal use by the library
 */
export default function rejectStringOptions(options: unknown): void {
  if (typeof options !== 'string') return;
  const found = describeValue(options);
  throw new TypeError(
    isStringCase(options)
      ? `Unsupported options ${found}. Use an options object: { targetCase: ${found} }.`
      : `Unsupported options ${found}. Use an options object, such as { targetCase: "snake" }. To pass the function as a callback, wrap it so that it gets only its first argument.`,
  );
}
