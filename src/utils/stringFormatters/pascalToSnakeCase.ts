import toSeparatedCase from './toSeparatedCase';

/**
 * Converts a PascalCase string to snake_case (acronym-aware).
 * Core transformation function without special character handling.
 *
 * @param str - The PascalCase string to convert
 * @returns The snake_case transformed string
 *
 * @example
 * ```typescript
 * pascalToSnakeCase('HelloWorld') // => 'hello_world'
 * pascalToSnakeCase('HTTPResponse') // => 'http_response'
 * ```
 * @internal This function is for internal use by the library
 */
export default function pascalToSnakeCase(str: string): string {
  return toSeparatedCase(str, '_');
}
