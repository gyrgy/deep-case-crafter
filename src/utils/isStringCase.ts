import { STRING_CASES } from '../constants/stringCases';
import { StringCase } from '../types/stringCaseTypes';

/**
 * Checks whether a value is a supported case format
 * @param value - The value to check
 * @returns `true` for `'camel'`, `'snake'`, `'pascal'` and `'kebab'`
 *
 * @example
 * ```typescript
 * isStringCase('snake') // => true
 * isStringCase('toString') // => false
 * ```
 * @internal This function is for internal use by the library
 */
export default function isStringCase(value: unknown): value is StringCase {
  return (STRING_CASES as readonly unknown[]).includes(value);
}
