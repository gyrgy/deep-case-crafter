/**
 * Describes a value for an error message, without ever throwing: strings are quoted,
 * other primitives are written as they are, and objects by their tag. (`String(value)`
 * would throw for an object without a prototype or for a symbol in a template.)
 *
 * @param value - The value to describe
 * @returns A short, readable description
 *
 * @example
 * ```typescript
 * describeValue('SNAKE') // => '"SNAKE"'
 * describeValue(NaN) // => 'NaN'
 * describeValue({}) // => '[object Object]'
 * ```
 * @internal This function is for internal use by the library
 */
export default function describeValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  // Written like a literal, so it does not read as a valid number
  if (typeof value === 'bigint') return `${value}n`;
  if (value === null) return 'null';
  if (typeof value === 'object' || typeof value === 'function') {
    try {
      return Object.prototype.toString.call(value);
    } catch {
      // A revoked Proxy, or a Symbol.toStringTag getter that throws
      return 'an object';
    }
  }
  return String(value);
}
