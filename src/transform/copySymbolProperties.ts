/**
 * Copies the enumerable symbol-keyed properties of `source` to `result` unchanged, as
 * `{ ...source }` copies them: like string keys, non-enumerable ones are left out.
 *
 * @param source - The object being transformed
 * @param result - Its result
 * @returns How many properties it copied
 * @internal This function is for internal use by the library
 */
export default function copySymbolProperties(
  source: Record<PropertyKey, unknown>,
  result: Record<PropertyKey, unknown>,
): number {
  let count = 0;
  for (const sym of Object.getOwnPropertySymbols(source)) {
    if (Object.prototype.propertyIsEnumerable.call(source, sym)) {
      result[sym] = source[sym];
      count++;
    }
  }
  return count;
}
