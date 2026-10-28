import isWordBoundary from '../isWordBoundary';

/**
 * Converts a PascalCase string to camelCase by lowercasing its first word, up to the
 * first word boundary: a leading acronym is lowercased as a whole (`HTTPRequest` ->
 * `httpRequest`), a leading one-letter word on its own (`XAxis` -> `xAxis`). Mirrored by
 * `PascalToCamelCase` in `types/keyTypes.ts`.
 *
 * @param str - The PascalCase string
 * @returns The camelCase string
 *
 * @example
 * ```typescript
 * pascalToCamelCase('UserID') // => 'userID'
 * ```
 * @internal This function is for internal use by the library
 */
export default function pascalToCamelCase(str: string): string {
  let end = 1;
  while (end < str.length && !isWordBoundary(str, end)) end++;
  return str.slice(0, end).toLowerCase() + str.slice(end);
}
