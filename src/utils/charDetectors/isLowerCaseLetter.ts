/**
 * Checks if a character is a lowercase ASCII letter
 * @param char - The character to check
 * @returns `true` for `a` to `z`
 *
 * @example
 * ```typescript
 * isLowerCaseLetter('h') // => true
 * isLowerCaseLetter('H') // => false
 * ```
 * @internal This function is for internal use by the library
 */
export default function isLowerCaseLetter(char: string): boolean {
  return char >= 'a' && char <= 'z';
}
