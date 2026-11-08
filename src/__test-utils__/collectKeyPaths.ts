import { MAP_VALUES } from './mapValues';

/**
 * Adds the key paths of `value` to `paths`, below `segments`: the work of `listKeyPaths`,
 * one nesting level at a time
 *
 * @param value - The value
 * @param segments - The keys that lead to it
 * @param paths - The paths found so far, written as JSON arrays
 * @param ancestors - The objects above it, to report a circular reference
 */
export default function collectKeyPaths(
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
    for (const item of value) collectKeyPaths(item, segments, paths, inside);
  } else if (value instanceof Map) {
    for (const [key, item] of value) {
      if (typeof key === 'string')
        paths.add(JSON.stringify([...segments, key]));
      collectKeyPaths(item, [...segments, MAP_VALUES], paths, inside);
    }
  } else {
    for (const [key, item] of Object.entries(value)) {
      paths.add(JSON.stringify([...segments, key]));
      collectKeyPaths(item, [...segments, key], paths, inside);
    }
  }
}
