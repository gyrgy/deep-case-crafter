import { ACRONYM_PLURAL_SUFFIX } from '../constants/acronymPlural';
import isDigitCode from './charDetectors/isDigitCode';
import isLowerCaseCode from './charDetectors/isLowerCaseCode';
import isUpperCaseCode from './charDetectors/isUpperCaseCode';

const PLURAL_SUFFIX_CODE = ACRONYM_PLURAL_SUFFIX.charCodeAt(0);

/**
 * Checks whether a new word starts at `index` of a camelCase or PascalCase string.
 *
 * A new word starts at an uppercase character when either:
 * - the previous character is a lowercase letter or digit (`fooBar` -> `foo|Bar`), or
 * - the previous character is uppercase and the next is lowercase, so the capitals
 *   before it are an acronym or a one-letter word (`HTTPResponse` -> `HTTP|Response`,
 *   `XAxis` -> `X|Axis`, `isAValidUser` -> `is|A|Valid|User`). A plural `s` that is not
 *   followed by another lowercase letter stays with the acronym instead (`URLs`, `IDs`,
 *   `URLs|For`).
 *
 * This is the single source of truth for word boundaries, shared by `toSeparatedCase`
 * and `pascalToCamelCase`, and mirrored by `IsWordBoundary` in `types/keyTypes.ts`.
 *
 * @param str - The camelCase or PascalCase string
 * @param index - The position to check, from 1
 * @returns `true` if a new word starts at `index`
 *
 * @example
 * ```typescript
 * isWordBoundary('fooBar', 3) // => true
 * isWordBoundary('HTTPResponse', 4) // => true
 * isWordBoundary('HTTPResponse', 3) // => false
 * isWordBoundary('XAxis', 1) // => true
 * ```
 * @internal This function is for internal use by the library
 */
export default function isWordBoundary(str: string, index: number): boolean {
  if (!isUpperCaseCode(str.charCodeAt(index))) return false;

  const prev = str.charCodeAt(index - 1);
  if (isLowerCaseCode(prev) || isDigitCode(prev)) return true;

  const next = str.charCodeAt(index + 1);
  if (!isUpperCaseCode(prev) || !isLowerCaseCode(next)) return false;

  // `URLs`, `IDs`: an `s` after an acronym is its plural, unless a word goes on after it
  return (
    next !== PLURAL_SUFFIX_CODE || isLowerCaseCode(str.charCodeAt(index + 2))
  );
}
