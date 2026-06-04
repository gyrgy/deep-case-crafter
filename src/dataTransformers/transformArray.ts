/**
 * Builds the transformed array. Each item is processed by `transformItem` (the
 * recursive transform), which already dispatches by type — so this helper holds no
 * type logic of its own. `register` records the result array before any item is
 * processed, so a self-referencing array resolves to it.
 *
 * @internal This function is for internal use by the library
 */
export default function transformArray(
  arr: readonly unknown[],
  register: (result: unknown[]) => void,
  transformItem: (item: unknown) => unknown,
): unknown[] {
  const result: unknown[] = [];
  register(result);
  for (const item of arr) {
    result.push(transformItem(item));
  }
  return result;
}
