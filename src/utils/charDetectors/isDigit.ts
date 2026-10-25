/**
 * Checks if a character is an ASCII digit
 * @param char - The character to check
 * @returns `true` for `0` to `9`
 *
 * @example
 * ```typescript
 * isDigit('7') // => true
 * isDigit('x') // => false
 * ```
 * @internal This function is for internal use by the library
 */
export default function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}
