import { HYPHEN_CODE, UNDERSCORE_CODE } from '../constants/charCodes';
import { StringCase } from '../types/stringCaseTypes';
import isDigitCode from '../utils/charDetectors/isDigitCode';
import isLowerCaseCode from '../utils/charDetectors/isLowerCaseCode';
import isUpperCaseCode from '../utils/charDetectors/isUpperCaseCode';
import isUuid from '../utils/isUuid';
import pascalToCamelCase from '../utils/stringFormatters/pascalToCamelCase';
import replaceSeparator from '../utils/stringFormatters/replaceSeparator';
import separatedToCamelCase from '../utils/stringFormatters/separatedToCamelCase';
import singleWordToCase from '../utils/stringFormatters/singleWordToCase';
import toSeparatedCase from '../utils/stringFormatters/toSeparatedCase';

/**
 * Transforms a key to the target case. One pass over the key's characters detects its
 * case, and the formatter for that case converts it.
 *
 * The key is returned unchanged unless every character is a letter, a digit, `_` or `-`,
 * the first is a letter and the last a letter or digit, and it is written in one case:
 * - a single word: lowercase, or with only its first letter in capitals (`user`, `User`)
 * - camelCase: a lowercase first letter and a capital, no separator
 * - PascalCase: a capital first letter, another capital and a lowercase letter, no
 *   separator (a word of capitals only, such as `ID` or `USD`, is kept)
 * - snake_case or kebab-case: lowercase, one kind of separator, never two in a row, and
 *   not a UUID
 *
 * These are the readme's key preservation rules; `TransformKey` in `types/keyTypes.ts`
 * mirrors them.
 *
 * @param str - The key to transform
 * @param targetCase - The target case
 * @returns The key in the target case, or the key unchanged
 *
 * @example
 * ```typescript
 * transformCase('hello_world', 'camel') // => 'helloWorld'
 * transformCase('HelloWorld', 'snake') // => 'hello_world'
 * transformCase('USER_ID', 'camel') // => 'USER_ID'
 * ```
 * @internal This function is for internal use by the library
 */
export default function transformCase(
  str: string,
  targetCase: StringCase,
): string {
  const length = str.length;
  if (length === 0) return str;

  let code = str.charCodeAt(0);
  const capitalized = isUpperCaseCode(code);
  if (!capitalized && !isLowerCaseCode(code)) return str;

  // Count the capitals and separators, and stop at a character no case allows
  let capitals = capitalized ? 1 : 0;
  let hasLowerCase = !capitalized;
  let underscores = 0;
  let hyphens = 0;
  let doubled = false;
  let prev = code;
  for (let i = 1; i < length; i++) {
    code = str.charCodeAt(i);
    if (isLowerCaseCode(code)) {
      hasLowerCase = true;
    } else if (isUpperCaseCode(code)) {
      capitals++;
    } else if (code === UNDERSCORE_CODE) {
      underscores++;
      if (prev === UNDERSCORE_CODE) doubled = true;
    } else if (code === HYPHEN_CODE) {
      hyphens++;
      if (prev === HYPHEN_CODE) doubled = true;
    } else if (!isDigitCode(code)) {
      return str;
    }
    prev = code;
  }
  if (prev === UNDERSCORE_CODE || prev === HYPHEN_CODE) return str;

  if (underscores === 0 && hyphens === 0) {
    if (capitals === 0 || (capitals === 1 && capitalized)) {
      return singleWordToCase(str, targetCase);
    }

    if (!capitalized) {
      // camelCase
      switch (targetCase) {
        case 'snake':
          return toSeparatedCase(str, '_');
        case 'kebab':
          return toSeparatedCase(str, '-');
        case 'pascal':
          return str[0].toUpperCase() + str.slice(1);
        default:
          return str;
      }
    }

    // A word of capitals only is not PascalCase
    if (!hasLowerCase) return str;

    // PascalCase
    switch (targetCase) {
      case 'snake':
        return toSeparatedCase(str, '_');
      case 'kebab':
        return toSeparatedCase(str, '-');
      case 'camel':
        return pascalToCamelCase(str);
      default:
        return str;
    }
  }

  // snake_case and kebab-case are lowercase, with one kind of separator, never doubled
  if (capitals > 0 || doubled || (underscores > 0 && hyphens > 0)) return str;

  if (underscores > 0) {
    // snake_case
    switch (targetCase) {
      case 'camel':
        return separatedToCamelCase(str, '_', false);
      case 'pascal':
        return separatedToCamelCase(str, '_', true);
      case 'kebab':
        return replaceSeparator(str, '_', '-');
      default:
        return str;
    }
  }

  // kebab-case, unless it is a UUID: data, not a name
  if (isUuid(str)) return str;
  switch (targetCase) {
    case 'camel':
      return separatedToCamelCase(str, '-', false);
    case 'pascal':
      return separatedToCamelCase(str, '-', true);
    case 'snake':
      return replaceSeparator(str, '-', '_');
    default:
      return str;
  }
}
