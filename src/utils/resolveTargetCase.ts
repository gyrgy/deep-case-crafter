import { STRING_CASES } from '../constants/stringCases';
import { StringCase } from '../types/stringCaseTypes';
import describeValue from './describeValue';
import isStringCase from './isStringCase';

/**
 * Resolves the `targetCase` option of `transform` and `transformKey`: `'camel'` when it
 * is omitted or falsy. Plain JavaScript callers can pass anything, so any other value
 * that is not a supported case is rejected before a key is converted.
 *
 * @param targetCase - The `targetCase` option, as passed
 * @returns The target case to use
 * @throws {TypeError} If `targetCase` is not a supported case
 *
 * @example
 * ```typescript
 * resolveTargetCase(undefined) // => 'camel'
 * resolveTargetCase('snake') // => 'snake'
 * resolveTargetCase('SNAKE') // throws a TypeError
 * ```
 * @internal This function is for internal use by the library
 */
export default function resolveTargetCase(targetCase: unknown): StringCase {
  const resolved = targetCase || 'camel';
  if (!isStringCase(resolved)) {
    throw new TypeError(
      `Unsupported targetCase ${describeValue(resolved)}. Use one of: ${STRING_CASES.join(', ')}.`,
    );
  }
  return resolved;
}
