import { ACRONYM_PLURAL_SUFFIX } from '../../constants/acronymPlural';
import isLowerCaseLetter from '../charDetectors/isLowerCaseLetter';
import isUpperCaseLetter from '../charDetectors/isUpperCaseLetter';
import isWordBoundary from '../isWordBoundary';

/**
 * Converts a PascalCase string to camelCase by lowercasing its first word.
 * A leading acronym is lowercased as a whole (`HTTPRequest` -> `httpRequest`), but two
 * capitals before a lowercase letter are a one-letter word and the next word
 * (`XAxis` -> `xAxis`, `ETag` -> `eTag`), as in most camelCase converters, unless that
 * letter is a plural `s` ending the acronym (`IDs` -> `ids`).
 * Core transformation function without special character handling
 *
 * @param str - The PascalCase string to convert
 * @returns The camelCase transformed string
 *
 * @example
 * ```typescript
 * pascalToCamelCase('HelloWorld') // => 'helloWorld'
 * pascalToCamelCase('HTTPRequest') // => 'httpRequest'
 * pascalToCamelCase('XAxis') // => 'xAxis'
 * pascalToCamelCase('IDsList') // => 'idsList'
 * ```
 * @internal This function is for internal use by the library
 */
export default function pascalToCamelCase(str: string): string {
  if (!str) return str;

  // A one-letter first word: two capitals followed by a lowercase letter that is not a
  // plural s ending the acronym (an s followed by anything but a lowercase letter)
  const third = str[2] ?? '';
  if (
    isUpperCaseLetter(str[0]) &&
    isUpperCaseLetter(str[1] ?? '') &&
    isLowerCaseLetter(third) &&
    (third !== ACRONYM_PLURAL_SUFFIX || isLowerCaseLetter(str[3] ?? ''))
  ) {
    return str[0].toLowerCase() + str.slice(1);
  }

  // The first word ends where the second one starts (see `isWordBoundary`)
  let end = 1;
  while (end < str.length && !isWordBoundary(str, end)) {
    end++;
  }

  return str.slice(0, end).toLowerCase() + str.slice(end);
}
