/**
 * Converts a PascalCase string to kebab-case
 * Core transformation function without special character handling
 *
 * @param str - The PascalCase string to convert
 * @returns The kebab-case transformed string
 *
 * @example
 * ```typescript
 * pascalToKebabCase('HelloWorld') // => 'hello-world'
 * pascalToKebabCase('HTTPResponse') // => 'http-response'
 * ```
 * @internal This function is for internal use by the library
 */
export default function pascalToKebabCase(str: string): string {
  if (!str) return str;

  // Step 1: Handle acronym patterns explicitly
  // - Find sequences like "HTTP" in "HTTPResponse" and convert to "HTTP-Response"
  let intermediate = str.replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1-$2');

  // Step 2: Handle standard PascalCase pattern
  // - Convert "HelloWorld" to "Hello-World"
  intermediate = intermediate.replace(/([a-z0-9])([A-Z])/g, '$1-$2');

  // Step 3: Convert to lowercase
  return intermediate.toLowerCase();
}
