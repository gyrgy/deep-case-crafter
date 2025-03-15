import {
  HAS_LOWER_CASE_REGEX,
  PASCAL_CASE_FULL_REGEX,
} from '../../constants/regex';

/**
 * Checks if a string is in PascalCase format
 * @param str - The string to check
 * @returns boolean indicating if the string is in PascalCase
 *
 * @example
 * ```typescript
 * isPascalCase('HelloWorld') // => true
 * isPascalCase('helloWorld') // => false
 * ```
 *
 * @internal This function is for internal use by the library
 */
export default function isPascalCase(str: string): boolean {
  if (typeof str !== 'string') return false;

  // Must start with uppercase, contain at least one lowercase letter, and only have letters and numbers
  return PASCAL_CASE_FULL_REGEX.test(str) && HAS_LOWER_CASE_REGEX.test(str);
}
