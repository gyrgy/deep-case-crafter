import describeValue from './describeValue';

/**
 * Resolves the `keepReferences` option of `transform` and `transformTo`: `true` when it is
 * omitted or `null`. Plain JavaScript callers can pass anything, so any other value that
 * is not a boolean is rejected before a key is converted.
 *
 * @param keepReferences - The `keepReferences` option, as passed
 * @returns Whether shared and circular references are kept
 * @throws {TypeError} If `keepReferences` is not a boolean
 *
 * @example
 * ```typescript
 * resolveKeepReferences(undefined) // => true
 * resolveKeepReferences(false) // => false
 * resolveKeepReferences('false') // throws a TypeError
 * ```
 * @internal This function is for internal use by the library
 */
export default function resolveKeepReferences(
  keepReferences: unknown,
): boolean {
  const resolved = keepReferences ?? true;
  if (typeof resolved !== 'boolean') {
    throw new TypeError(
      `Unsupported keepReferences ${describeValue(resolved)}. Use true or false.`,
    );
  }
  return resolved;
}
