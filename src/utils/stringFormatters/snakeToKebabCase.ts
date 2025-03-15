/**
 * Converts a snake_case string to kebab-case
 * Core transformation function without special character handling
 *
 * @param str - The snake_case string to convert
 * @returns The kebab-case transformed string
 *
 * @example
 * ```typescript
 * snakeToKebabCase('hello_world') // => 'hello-world'
 * ```
 * @internal This function is for internal use by the library
 */
export default function snakeToKebabCase(str: string): string {
  return str.replace(/_/g, '-');
}
