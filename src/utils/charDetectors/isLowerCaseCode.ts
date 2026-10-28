/**
 * Checks whether a character code is an ASCII lowercase letter (`a`-`z`)
 * @param code - The character code; `NaN` (from `charCodeAt` past the end) is `false`
 * @returns `true` for `a`-`z`
 * @internal This function is for internal use by the library
 */
export default function isLowerCaseCode(code: number): boolean {
  return code >= 97 && code <= 122;
}
