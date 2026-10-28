import { HYPHEN_CODE } from '../constants/charCodes';
import isDigitCode from './charDetectors/isDigitCode';

/**
 * Checks whether a string is a UUID in canonical form: 8-4-4-4-12 hexadecimal digits, in
 * either case. Mirrored by `IsUuid` in `types/keyTypes.ts`.
 *
 * Character by character rather than with a regular expression: it runs on keys at any
 * depth of the data, and a regular expression compiled for the first time near the end of
 * the call stack throws a `SyntaxError` instead of the usual `RangeError`.
 *
 * @param str - The string to check
 * @returns `true` for a UUID
 *
 * @example
 * ```typescript
 * isUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479') // => true
 * isUuid('user-id') // => false
 * ```
 * @internal This function is for internal use by the library
 */
export default function isUuid(str: string): boolean {
  if (str.length !== 36) return false;
  for (let i = 0; i < 36; i++) {
    const code = str.charCodeAt(i);
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      if (code !== HYPHEN_CODE) return false;
    } else if (
      // A hexadecimal digit: 0-9, a-f or A-F
      !isDigitCode(code) &&
      !(code >= 97 && code <= 102) &&
      !(code >= 65 && code <= 70)
    ) {
      return false;
    }
  }
  return true;
}
