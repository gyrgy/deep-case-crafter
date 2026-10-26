import isWordBoundary from '../isWordBoundary';

/**
 * Converts a PascalCase string to camelCase by lowercasing its first word.
 * A leading acronym is lowercased as a whole (`HTTPRequest` -> `httpRequest`), and a
 * leading one-letter word on its own (`XAxis` -> `xAxis`, `ETag` -> `eTag`), as in most
 * camelCase converters. A plural `s` stays with the acronym before it (`IDs` -> `ids`).
 * Core transformation function without special character handling
 *
 * @param str - The PascalCase string to convert
 * @returns The camelCase transformed string
 *
 * @example
 * ```typescript
 * pascalToCamelCase('HelloWorld') // => 'helloWorld'
 * pascalToCamelCase('HTTPRequest') // => 'httpRequest'
 * pascalToCamelCase('XAxis') // => 'xAxis'
 * pascalToCamelCase('IDsList') // => 'idsList'
 * ```
 * @internal This function is for internal use by the library
 */
export default function pascalToCamelCase(str: string): string {
  if (!str) return str;

  // The first word ends where the second one starts (see `isWordBoundary`)
  let end = 1;
  while (end < str.length && !isWordBoundary(str, end)) {
    end++;
  }

  return str.slice(0, end).toLowerCase() + str.slice(end);
}
