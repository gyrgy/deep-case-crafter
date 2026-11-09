import describeValue from './describeValue';

/**
 * Resolves the `depth` option of `transform` and `transformTo`: `Infinity` (every level)
 * when it is omitted or `null`. Plain JavaScript callers can pass anything, so a value
 * that is not a number is rejected before a key is converted.
 *
 * @param depth - The `depth` option, as passed
 * @returns The number of levels to transform
 * @throws {TypeError} If `depth` is not a number, or is `NaN`
 *
 * @example
 * ```typescript
 * resolveDepth(undefined) // => Infinity
 * resolveDepth(2) // => 2
 * resolveDepth('2') // throws a TypeError
 * ```
 * @internal This function is for internal use by the library
 */
export default function resolveDepth(depth: unknown): number {
  const resolved = depth ?? Infinity;
  if (typeof resolved !== 'number' || Number.isNaN(resolved)) {
    throw new TypeError(
      `Unsupported depth ${describeValue(resolved)}. Use a number, or omit depth to transform every level.`,
    );
  }
  return resolved;
}
