import isWordBoundary from '../isWordBoundary';

/**
 * Converts a camelCase or PascalCase string to lowercase words joined by `separator`
 * (snake_case or kebab-case), or with `upperCase` to words in capitals (CONSTANT_CASE).
 * Acronyms and plural acronyms stay whole words, as `isWordBoundary` decides. Mirrored by
 * `ToSeparatedCase` in `types/keyTypes.ts` (with `Uppercase` for CONSTANT_CASE).
 *
 * @param str - The camelCase or PascalCase string
 * @param separator - `_` for snake_case and CONSTANT_CASE, `-` for kebab-case
 * @param upperCase - Put the words in capitals instead of lowercase
 * @returns The separated string
 *
 * @example
 * ```typescript
 * toSeparatedCase('getHTTPResponse', '_', false) // => 'get_http_response'
 * toSeparatedCase('XAxis', '-', false) // => 'x-axis'
 * toSeparatedCase('userID', '_', true) // => 'USER_ID'
 * ```
 * @internal This function is for internal use by the library
 */
export default function toSeparatedCase(
  str: string,
  separator: string,
  upperCase: boolean,
): string {
  let result = '';
  let start = 0;
  for (let i = 1; i < str.length; i++) {
    if (isWordBoundary(str, i)) {
      result += str.slice(start, i) + separator;
      start = i;
    }
  }
  result += str.slice(start);
  return upperCase ? result.toUpperCase() : result.toLowerCase();
}
