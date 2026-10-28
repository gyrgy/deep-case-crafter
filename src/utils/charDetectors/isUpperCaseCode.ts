/**
 * Checks whether a character code is an ASCII uppercase letter (`A`-`Z`)
 * @param code - The character code; `NaN` (from `charCodeAt` past the end) is `false`
 * @returns `true` for `A`-`Z`
 * @internal This function is for internal use by the library
 */
export default function isUpperCaseCode(code: number): boolean {
  return code >= 65 && code <= 90;
}
