/**
 * Every string of 1 to `maxLength` characters drawn from `alphabet`.
 *
 * Used by the type/runtime parity test: the case rules only look at a few neighbouring
 * characters, so all short combinations of a few character classes cover every rule.
 *
 * @example
 * ```typescript
 * generateKeys(['a', 'B'], 2) // => ['a', 'B', 'aa', 'aB', 'Ba', 'BB']
 * ```
 */
export default function generateKeys(
  alphabet: readonly string[],
  maxLength: number,
): string[] {
  const keys: string[] = [];
  let current = [''];

  for (let length = 1; length <= maxLength; length++) {
    current = current.flatMap((prefix) =>
      alphabet.map((char) => prefix + char),
    );
    keys.push(...current);
  }

  return keys;
}
