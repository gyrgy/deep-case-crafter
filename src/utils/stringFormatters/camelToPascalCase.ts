/**
 * Converts a camelCase string to PascalCase
 * Core transformation function without special character handling
 *
 * @param str - The camelCase string to convert
 * @returns The PascalCase transformed string
 *
 * @example
 * ```typescript
 * camelToPascalCase('helloWorld') // => 'HelloWorld'
 * ```
 * @internal This function is for internal use by the library
 */
export default function camelToPascalCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
