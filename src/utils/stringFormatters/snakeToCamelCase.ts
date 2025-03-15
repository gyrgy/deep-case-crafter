/**
 * Converts a snake_case string to camelCase
 * Core transformation function without special character handling
 *
 * @param str - The snake_case string to convert
 * @returns The camelCase transformed string
 *
 * @example
 * ```typescript
 * snakeToCamelCase('hello_world') // => 'helloWorld'
 * ```
 * @internal This function is for internal use by the library
 */
export default function snakeToCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}
