/**
 * Converts a camelCase string to kebab-case
 * Core transformation function without special character handling
 *
 * @param str - The camelCase string to convert
 * @returns The kebab-case transformed string
 *
 * @example
 * ```typescript
 * camelToKebabCase('helloWorld') // => 'hello-world'
 * ```
 * @internal This function is for internal use by the library
 */
export default function camelToKebabCase(str: string): string {
  if (!str) return str;

  // First, handle the beginning of an acronym
  let result = str.replace(/([a-z0-9])([A-Z])/g, '$1-$2');

  // Then handle consecutive uppercase letters
  result = result.replace(/([A-Z])(?=[A-Z])/g, '$1-');

  return result.toLowerCase();
}
