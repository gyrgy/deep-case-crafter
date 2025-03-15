/**
 * Converts a PascalCase string to snake_case
 * Core transformation function without special character handling
 *
 * @param str - The PascalCase string to convert
 * @returns The snake_case transformed string
 *
 * @example
 * ```typescript
 * pascalToSnakeCase('HelloWorld') // => 'hello_world'
 * pascalToSnakeCase('HTTPResponse') // => 'http_response'
 * ```
 * @internal This function is for internal use by the library
 */
export default function pascalToSnakeCase(str: string): string {
  if (!str) return str;

  // Step 1: Handle acronym patterns explicitly
  // - Find sequences like "HTTP" in "HTTPResponse" and convert to "HTTP_Response"
  let intermediate = str.replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1_$2');

  // Step 2: Handle standard PascalCase pattern
  // - Convert "HelloWorld" to "Hello_World"
  intermediate = intermediate.replace(/([a-z0-9])([A-Z])/g, '$1_$2');

  // Step 3: Convert to lowercase
  return intermediate.toLowerCase();
}
