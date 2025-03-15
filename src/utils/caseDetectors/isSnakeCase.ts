import {
  SINGLE_WORD_REGEX,
  SNAKE_CONSECUTIVE_UNDERSCORES_REGEX,
  SNAKE_ONLY_REGEX,
} from '../../constants/regex';

/**
 * Checks if a string is in snake_case format
 * @param str - The string to check
 * @returns boolean indicating if the string is in snake_case
 *
 * @example
 * ```typescript
 * isSnakeCase('hello_world') // => true
 * isSnakeCase('helloWorld') // => false
 * ```
 *
 * @internal This function is for internal use by the library
 */
export default function isSnakeCase(str: string): boolean {
  if (typeof str !== 'string') return false;

  return (
    SNAKE_ONLY_REGEX.test(str) && // only lowercase, numbers and underscores
    !SNAKE_CONSECUTIVE_UNDERSCORES_REGEX.test(str) && // no consecutive underscores
    (str.includes('_') || SINGLE_WORD_REGEX.test(str)) // has underscore or is single word
  );
}
