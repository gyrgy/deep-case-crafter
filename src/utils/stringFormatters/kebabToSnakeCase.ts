/**
 * Converts a kebab-case string to snake_case
 * Core transformation function without special character handling
 *
 * @param str - The kebab-case string to convert
 * @returns The snake_case transformed string
 *
 * @example
 * ```typescript
 * kebabToSnakeCase('hello-world') // => 'hello_world'
 * ```
 * @internal This function is for internal use by the library
 */
export default function kebabToSnakeCase(str: string): string {
  return str.replace(/-/g, '_');
}
