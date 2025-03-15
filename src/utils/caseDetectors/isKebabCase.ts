import {
  KEBAB_CONSECUTIVE_HYPHENS_REGEX,
  KEBAB_LOWER_NUMBERS_HYPHENS_REGEX,
  SINGLE_WORD_REGEX,
} from '../../constants/regex';

/**
 * Checks if a string is in kebab-case format
 * @param str - The string to check
 * @returns boolean indicating if the string is in kebab-case
 *
 * @example
 * ```typescript
 * isKebabCase('hello-world') // => true
 * isKebabCase('helloWorld') // => false
 * ```
 * @internal This function is for internal use by the library
 */
export function isKebabCase(str: string): boolean {
  if (typeof str !== 'string') return false;

  return (
    KEBAB_LOWER_NUMBERS_HYPHENS_REGEX.test(str) && // only lowercase, numbers and hyphens
    !KEBAB_CONSECUTIVE_HYPHENS_REGEX.test(str) && // no consecutive hyphens
    (str.includes('-') || SINGLE_WORD_REGEX.test(str)) // has hyphen or is single word
  );
}
