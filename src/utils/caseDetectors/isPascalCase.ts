import {
  HAS_LOWER_CASE_REGEX,
  PASCAL_CASE_FULL_REGEX,
} from '../../constants/regex';

/**
 * Checks if a string is in PascalCase format.
 * A word written only in capitals (`ID`, `USD`, `GET`) is not: like a SCREAMING_SNAKE
 * key, it is not in one recognisable case, so it is left unchanged.
 *
 * @param str - The string to check
 * @returns boolean indicating if the string is in PascalCase
 *
 * @example
 * ```typescript
 * isPascalCase('HelloWorld') // => true
 * isPascalCase('HTTPResponse') // => true
 * isPascalCase('ID') // => false
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
