/**
 * Replaces every `from` separator with `to`: snake_case to kebab-case and back. Mirrored
 * by `ReplaceSeparator` in `types/keyTypes.ts`.
 *
 * @param str - The snake_case or kebab-case string
 * @param from - The separator to replace
 * @param to - The separator to put in its place
 * @returns The string with the other separator
 *
 * @example
 * ```typescript
 * replaceSeparator('user_id', '_', '-') // => 'user-id'
 * ```
 * @internal This function is for internal use by the library
 */
export default function replaceSeparator(
  str: string,
  from: string,
  to: string,
): string {
  return str.split(from).join(to);
}
