/**
 * Converts a kebab-case string to camelCase
 * Core transformation function without special character handling
 *
 * @param str - The kebab-case string to convert
 * @returns The camelCase transformed string
 *
 * @example
 * ```typescript
 * kebabToCamelCase('hello-world') // => 'helloWorld'
 * ```
 * @internal This function is for internal use by the library
 */
export default function kebabToCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/-+([a-z0-9])/g, (_, char) => char.toUpperCase());
}
