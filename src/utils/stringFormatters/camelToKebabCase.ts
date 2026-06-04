import toSeparatedCase from './toSeparatedCase';

/**
 * Converts a camelCase string to kebab-case (acronym-aware).
 * Core transformation function without special character handling.
 *
 * @param str - The camelCase string to convert
 * @returns The kebab-case transformed string
 *
 * @example
 * ```typescript
 * camelToKebabCase('helloWorld') // => 'hello-world'
 * camelToKebabCase('getHTTPResponse') // => 'get-http-response'
 * ```
 * @internal This function is for internal use by the library
 */
export default function camelToKebabCase(str: string): string {
  return toSeparatedCase(str, '-');
}
