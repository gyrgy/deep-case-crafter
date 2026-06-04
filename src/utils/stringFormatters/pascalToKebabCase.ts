import toSeparatedCase from './toSeparatedCase';

/**
 * Converts a PascalCase string to kebab-case (acronym-aware).
 * Core transformation function without special character handling.
 *
 * @param str - The PascalCase string to convert
 * @returns The kebab-case transformed string
 *
 * @example
 * ```typescript
 * pascalToKebabCase('HelloWorld') // => 'hello-world'
 * pascalToKebabCase('HTTPResponse') // => 'http-response'
 * ```
 * @internal This function is for internal use by the library
 */
export default function pascalToKebabCase(str: string): string {
  return toSeparatedCase(str, '-');
}
