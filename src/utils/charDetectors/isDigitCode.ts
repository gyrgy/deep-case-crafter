/**
 * Checks whether a character code is an ASCII digit (`0`-`9`)
 * @param code - The character code; `NaN` (from `charCodeAt` past the end) is `false`
 * @returns `true` for `0`-`9`
 * @internal This function is for internal use by the library
 */
export default function isDigitCode(code: number): boolean {
  return code >= 48 && code <= 57;
}
