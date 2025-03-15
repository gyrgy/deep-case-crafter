/**
 * Converts a kebab-case string to PascalCase
 * Core transformation function without special character handling
 *
 * @param str - The kebab-case string to convert
 * @returns The PascalCase transformed string
 *
 * @example
 * ```typescript
 * kebabToPascalCase('hello-world') // => 'HelloWorld'
 * ```
 * @internal This function is for internal use by the library
 */
export default function kebabToPascalCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/-+([a-z0-9])/g, (_, char) => char.toUpperCase())
    .replace(/^[a-z]/, (match) => match.toUpperCase());
}
