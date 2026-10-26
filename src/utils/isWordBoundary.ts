import { ACRONYM_PLURAL_SUFFIX } from '../constants/acronymPlural';
import isDigit from './charDetectors/isDigit';
import isLowerCaseLetter from './charDetectors/isLowerCaseLetter';
import isUpperCaseLetter from './charDetectors/isUpperCaseLetter';

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
 * @param index - The position to check
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
  if (!isUpperCaseLetter(str[index] ?? '')) return false;

  const prev = str[index - 1] ?? '';
  if (isLowerCaseLetter(prev) || isDigit(prev)) return true;

  const startsWordAfterCapital =
    isUpperCaseLetter(prev) && isLowerCaseLetter(str[index + 1] ?? '');
  if (!startsWordAfterCapital) return false;

  const isPluralSuffix =
    str[index + 1] === ACRONYM_PLURAL_SUFFIX &&
    !isLowerCaseLetter(str[index + 2] ?? '');
  return !isPluralSuffix;
}
