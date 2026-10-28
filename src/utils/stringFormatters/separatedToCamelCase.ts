/**
 * Converts snake_case or kebab-case to camelCase, or to PascalCase with `pascal`: every
 * `separator` is dropped and the character after it uppercased. Mirrored by
 * `SeparatedToCamelCase` in `types/keyTypes.ts`.
 *
 * @param str - The string: lowercase, not starting or ending with `separator`, and
 * without two in a row
 * @param separator - `_` for snake_case, `-` for kebab-case
 * @param pascal - Uppercase the first character as well
 * @returns The camelCase or PascalCase string
 *
 * @example
 * ```typescript
 * separatedToCamelCase('user_id', '_', false) // => 'userId'
 * separatedToCamelCase('api-key', '-', true) // => 'ApiKey'
 * ```
 * @internal This function is for internal use by the library
 */
export default function separatedToCamelCase(
  str: string,
  separator: string,
  pascal: boolean,
): string {
  let result = pascal ? str[0].toUpperCase() : str[0];
  let start = 1;
  let index = str.indexOf(separator, 1);
  while (index !== -1) {
    result += str.slice(start, index) + str[index + 1].toUpperCase();
    start = index + 2;
    index = str.indexOf(separator, start);
  }
  return result + str.slice(start);
}
