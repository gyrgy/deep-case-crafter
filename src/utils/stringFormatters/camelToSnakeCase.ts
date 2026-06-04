import toSeparatedCase from './toSeparatedCase';

/**
 * Converts a camelCase string to snake_case (acronym-aware).
 * Core transformation function without special character handling.
 *
 * @param str - The camelCase string to convert
 * @returns The snake_case transformed string
 *
 * @example
 * ```typescript
 * camelToSnakeCase('helloWorld') // => 'hello_world'
 * camelToSnakeCase('getHTTPResponse') // => 'get_http_response'
 * ```
 * @internal This function is for internal use by the library
 */
export default function camelToSnakeCase(str: string): string {
  return toSeparatedCase(str, '_');
}
