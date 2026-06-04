const isUpper = (c: string): boolean => c >= 'A' && c <= 'Z';
const isLower = (c: string): boolean => c >= 'a' && c <= 'z';
const isDigit = (c: string): boolean => c >= '0' && c <= '9';

/**
 * Converts a camelCase or PascalCase string to a separated lower-case form
 * (snake_case when `separator` is `_`, kebab-case when `-`), with acronym-aware
 * word boundaries.
 *
 * A separator is inserted before an uppercase character when either:
 * - the previous character is a lowercase letter or digit (`fooBar` -> `foo_bar`), or
 * - it is the last letter of an acronym run that starts a new word — i.e. the two
 *   preceding characters are uppercase and the next is lowercase
 *   (`HTTPResponse` -> `http_response`, `userID` -> `user_id`).
 *
 * This is the single source of truth shared by the camel/pascal → snake/kebab
 * formatters, and it mirrors the `SeparatorCase` type in `types/transformTypes.ts`
 * exactly so the runtime and type-level results never diverge.
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
    const char = str[i];

    if (isUpper(char)) {
      const prev = str[i - 1] ?? '';
      const afterLowerOrDigit = isLower(prev) || isDigit(prev);
      const acronymBoundary =
        isUpper(prev) && isUpper(str[i - 2] ?? '') && isLower(str[i + 1] ?? '');

      if (afterLowerOrDigit || acronymBoundary) {
        result += separator;
      }
    }

    result += char.toLowerCase();
  }

  return result;
}
