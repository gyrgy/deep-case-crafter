import transformCase from '../transform/transformCase';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import { TransformMapReturn } from '../types/transformTypes';

/**
 * Transforms string keys in a Map (single level only)
 *
 * @param map - The Map to transform
 * @param options - Transformation options including targetCase (required), optional sourceCase and optional preserveSpecialCharacters
 * @returns A new Map with transformed keys
 *
 * @remarks
 * - Only string keys are transformed; other key types remain unchanged
 * - Values are not transformed, only copied to the new Map
 * - When sourceCase is specified, provides precise type transformations
 * - This function does not transform nested structures
 *
 * @internal This function is for internal use by the library
 */
export default function transformMap<K, V, O extends TransformOptionsInternal>(
  map: Map<K, V>,
  options: O,
): TransformMapReturn<K, V, O> {
  if (!(map instanceof Map)) {
    return map as unknown as TransformMapReturn<K, V, O>;
  }

  // Use the explicit Map entries constructor pattern for clarity
  const entries: Array<[unknown, V]> = [];

  for (const [key, value] of map.entries()) {
    if (typeof key === 'string') {
      // Transform string keys
      const transformedKey = transformCase(key, options);
      entries.push([transformedKey, value]);
    } else {
      // Keep non-string keys as-is
      entries.push([key, value]);
    }
  }

  return new Map(entries) as TransformMapReturn<K, V, O>;
}
