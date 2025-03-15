/**
 * Converts a PascalCase string to camelCase
 * Core transformation function without special character handling
 *
 * @param str - The PascalCase string to convert
 * @returns The camelCase transformed string
 *
 * @example
 * ```typescript
 * pascalToCamelCase('HelloWorld') // => 'helloWorld'
 * ```
 * @internal This function is for internal use by the library
 */
export default function pascalToCamelCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}
