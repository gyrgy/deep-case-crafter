import isWordBoundary from '../isWordBoundary';

/**
 * Converts a camelCase or PascalCase string to a separated lower-case form
 * (snake_case when `separator` is `_`, kebab-case when `-`), with acronym-aware
 * word boundaries (see `isWordBoundary`):
 * `fooBar` -> `foo_bar`, `HTTPResponse` -> `http_response`, `userID` -> `user_id`.
 *
 * This is shared by the camel/pascal → snake/kebab formatters, and it mirrors the
 * `ToSeparatedCase` type in `types/keyTypes.ts` exactly so the runtime and
 * type-level results never diverge.
 *
 * @param str - The camelCase or PascalCase string to convert
 * @param separator - The separator to put between words
 * @returns The separated lower-case string
 *
 * @internal This function is for internal use by the library
 */
export default function toSeparatedCase(
  str: string,
  separator: string,
): string {
  if (!str) return str;

  let result = '';
  for (let i = 0; i < str.length; i++) {
    if (isWordBoundary(str, i)) {
      result += separator;
    }
    result += str[i].toLowerCase();
  }

  return result;
}
