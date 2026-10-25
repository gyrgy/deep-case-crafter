/**
 * Checks if a character is an uppercase ASCII letter
 * @param char - The character to check
 * @returns `true` for `A` to `Z`
 *
 * @example
 * ```typescript
 * isUpperCaseLetter('H') // => true
 * isUpperCaseLetter('h') // => false
 * ```
 * @internal This function is for internal use by the library
 */
export default function isUpperCaseLetter(char: string): boolean {
  return char >= 'A' && char <= 'Z';
}
