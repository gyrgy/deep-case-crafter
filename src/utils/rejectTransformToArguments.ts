import describeValue from './describeValue';

/**
 * Rejects arguments of `transformTo` in the wrong order or form: an options object in
 * place of the target case, a second argument that is not an options object, or one with
 * a `targetCase`, which is the first argument. Plain JavaScript callers can pass anything,
 * and `transformTo` reads only `depth`, `exclude` and `keepReferences` from its options,
 * so a target case passed there would otherwise be dropped without an error.
 *
 * `undefined` and `null` stand for no options, and so does a number: `map` passes the
 * index when `transformTo` itself is the callback, as in `cases.map(transformTo)`, which
 * `transform` and `transformKey` accept as well.
 *
 * @param targetCase - The target case argument, as passed
 * @param options - The options argument, as passed
 * @throws {TypeError} If `targetCase` is an object, or `options` is not an object, a
 * number, `undefined` or `null`, is an array, or has a `targetCase` other than `undefined`
 * or `null`
 *
 * @example
 * ```typescript
 * rejectTransformToArguments('snake', { depth: 1 }) // returns
 * rejectTransformToArguments({ targetCase: 'snake' }, undefined) // throws a TypeError
 * rejectTransformToArguments('snake', 'kebab') // throws a TypeError
 * rejectTransformToArguments('snake', { targetCase: 'kebab' }) // throws a TypeError
 * ```
 * @internal This function is for internal use by the library
 */
export default function rejectTransformToArguments(
  targetCase: unknown,
  options: unknown,
): void {
  if (typeof targetCase === 'object' && targetCase !== null) {
    throw new TypeError(
      `Unsupported targetCase ${describeValue(targetCase)}. Pass the target case first, then the options: transformTo("snake", { depth: 1 }).`,
    );
  }

  if (
    options === undefined ||
    options === null ||
    typeof options === 'number'
  ) {
    return;
  }
  if (typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError(
      `Unsupported options ${describeValue(options)}. Use an options object, such as { depth: 1 }, after the target case: transformTo("snake", { depth: 1 }).`,
    );
  }
  // `null` stands for an omitted option, as for the other options
  const { targetCase: optionCase } = options as { targetCase?: unknown };
  if (optionCase !== undefined && optionCase !== null) {
    throw new TypeError(
      `Unsupported option targetCase ${describeValue(optionCase)}. Pass the target case as the first argument of transformTo instead.`,
    );
  }
}
