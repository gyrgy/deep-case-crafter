import { CAMEL_ONLY_REGEX, HAS_UPPER_CASE_REGEX } from '../../constants/regex';

/**
 * Checks if a string is in camelCase format
 * @param str - The string to check
 * @returns boolean indicating if the string is in camelCase
 *
 * @example
 * ```typescript
 * isCamelCase('helloWorld') // => true
 * isCamelCase('hello_world') // => false
 * ```
 * @internal This function is for internal use by the library
 */
export default function isCamelCase(str: string): boolean {
  if (typeof str !== 'string') return false;

  return (
    CAMEL_ONLY_REGEX.test(str) && // starts with lowercase, only letters and numbers
    HAS_UPPER_CASE_REGEX.test(str) // contains at least one uppercase letter
  );
}
