/** The key that stands for the values of a Map, whatever their key */
export const MAP_VALUES = '<values>';

/**
 * Lists every key of a value, at every nesting level, as the path of keys that leads to
 * it (written as a JSON array). Array items and Set members add no key to a path. A Map
 * adds its string keys, and its values are listed below `MAP_VALUES`, as a Map type has
 * one value type for all of its keys (see `evaluateResultKeyPaths`).
 *
 * Used by the exclude parity test to compare a transformed value with its result type.
 *
 * @example
 * ```typescript
 * listKeyPaths({ user_info: [{ first_name: 'x' }] })
 * // => ['["user_info","first_name"]', '["user_info"]']
 * ```
 */
export default function listKeyPaths(value: unknown): string[] {
  const paths = new Set<string>();
  collect(value, [], paths, []);
  return [...paths].sort();
}

function collect(
  value: unknown,
  segments: readonly string[],
  paths: Set<string>,
  ancestors: readonly unknown[],
): void {
  if (value === null || typeof value !== 'object') return;
  if (ancestors.includes(value)) {
    throw new Error(`Circular reference at ${JSON.stringify(segments)}`);
  }
  const inside = [...ancestors, value];

  if (Array.isArray(value) || value instanceof Set) {
    for (const item of value) collect(item, segments, paths, inside);
  } else if (value instanceof Map) {
    for (const [key, item] of value) {
      if (typeof key === 'string')
        paths.add(JSON.stringify([...segments, key]));
      collect(item, [...segments, MAP_VALUES], paths, inside);
    }
  } else {
    for (const [key, item] of Object.entries(value)) {
      paths.add(JSON.stringify([...segments, key]));
      collect(item, [...segments, key], paths, inside);
    }
  }
}
