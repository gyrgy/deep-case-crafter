import collectKeyPaths from './collectKeyPaths';

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
  collectKeyPaths(value, [], paths, []);
  return [...paths].sort();
}
