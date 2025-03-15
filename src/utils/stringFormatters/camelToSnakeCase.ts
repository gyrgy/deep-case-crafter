/**
 * Converts a camelCase string to snake_case
 * Core transformation function without special character handling
 *
 * @param str - The camelCase string to convert
 * @returns The snake_case transformed string
 *
 * @example
 * ```typescript
 * camelToSnakeCase('helloWorld') // => 'hello_world'
 * ```
 * @internal This function is for internal use by the library
 */
export default function camelToSnakeCase(str: string): string {
  if (!str) return str;

  // First, handle the beginning of an acronym
  let result = str.replace(/([a-z0-9])([A-Z])/g, '$1_$2');

  // Then handle consecutive uppercase letters
  result = result.replace(/([A-Z])(?=[A-Z])/g, '$1_');

  return result.toLowerCase();
}
