import isWordBoundary from '../isWordBoundary';

/**
 * Converts a camelCase or PascalCase string to lowercase words joined by `separator`
 * (snake_case or kebab-case). Acronyms and plural acronyms stay whole words, as
 * `isWordBoundary` decides. Mirrored by `ToSeparatedCase` in `types/keyTypes.ts`.
 *
 * @param str - The camelCase or PascalCase string
 * @param separator - `_` for snake_case, `-` for kebab-case
 * @returns The separated string
 *
 * @example
 * ```typescript
 * toSeparatedCase('getHTTPResponse', '_') // => 'get_http_response'
 * toSeparatedCase('XAxis', '-') // => 'x-axis'
 * ```
 * @internal This function is for internal use by the library
 */
export default function toSeparatedCase(
  str: string,
  separator: string,
): string {
  let result = '';
  let start = 0;
  for (let i = 1; i < str.length; i++) {
    if (isWordBoundary(str, i)) {
      result += str.slice(start, i) + separator;
      start = i;
    }
  }
  return (result + str.slice(start)).toLowerCase();
}
