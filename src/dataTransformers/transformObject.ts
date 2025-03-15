import transformCase from '../transform/transformCase';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import { TransformObjectReturn } from '../types/transformTypes';

/**
 * Transforms an object's keys to the specified case format (single level only)
 * @param obj - The object to transform
 * @param options - Transformation options including targetCase (required), optional sourceCase and optional preserveSpecialCharacters
 * @returns A new object with transformed keys
 *
 * @remarks
 * - Only string keys will be transformed; numeric keys and Symbol keys remain unchanged
 * - When sourceCase is specified:
 *   - TypeScript provides precise property type information
 *   - Transformation is more efficient (bypasses runtime detection)
 * - When sourceCase is not specified:
 *   - Automatic case detection is used for each key
 *   - Return type is Record<string, unknown> for type safety
 * - The preserveSpecialCharacters option retains special characters at the beginning and end of keys
 *
 * @internal This function is for internal use by the library
 */
export default function transformObject<
  T extends object,
  O extends TransformOptionsInternal,
>(obj: T, options: O): TransformObjectReturn<T, O> {
  // Handle non-object inputs
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj as unknown as TransformObjectReturn<T, O>;
  }

  const { targetCase, sourceCase } = options;

  const result: Record<string | number | symbol, unknown> = {};

  // Transform normal string/number keys
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Handle numeric keys differently
      const isNumericKey = !isNaN(Number(key)) && String(Number(key)) === key;
      const transformedKey = isNumericKey
        ? Number(key)
        : transformCase(key, {
            targetCase,
            sourceCase,
          });

      result[transformedKey] = (obj as Record<string, unknown>)[key];
    }
  }

  // Handle Symbol keys separately (they won't be caught by for...in)
  if (Object.getOwnPropertySymbols) {
    const symbolKeys = Object.getOwnPropertySymbols(obj);
    for (const sym of symbolKeys) {
      // Use a more type-safe approach for symbol properties
      result[sym] = (obj as Record<symbol, unknown>)[sym];
    }
  }

  return result as TransformObjectReturn<T, O>;
}
