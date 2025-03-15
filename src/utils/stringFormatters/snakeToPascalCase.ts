/**
 * Converts a snake_case string to PascalCase
 * Core transformation function without special character handling
 *
 * @param str - The snake_case string to convert
 * @returns The PascalCase transformed string
 *
 * @example
 * ```typescript
 * snakeToPascalCase('hello_world') // => 'HelloWorld'
 * ```
 * @internal This function is for internal use by the library
 */
export default function snakeToPascalCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_+([a-z0-9])/g, (_, char) => char.toUpperCase())
    .replace(/^[a-z]/, (match) => match.toUpperCase());
}
