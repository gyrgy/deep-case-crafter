import transformCase from '../transform/transformCase';
import setKey from '../utils/setKey';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import { TransformObjectReturn } from '../types/transformTypes';

/**
 * Transforms an object's keys to the specified case format (single level only)
 * @param obj - The object to transform
 * @param options - Transformation options including targetCase (required), optional sourceCase and optional preserveSpecialCharacters
 * @returns A new object with transformed keys
 *
 * @remarks
 * - Only string keys are transformed; numeric keys and Symbol keys remain unchanged
 * - `sourceCase` is a type-level hint only; at runtime every key's case is auto-detected
 *   regardless. With it the return type is precise; without it it is Record<string, unknown>.
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

      setKey(result, transformedKey, (obj as Record<string, unknown>)[key]);
    }
  }

  // Handle Symbol keys separately (they won't be caught by for...in).
  // Symbol-keyed properties are copied across unchanged.
  for (const sym of Object.getOwnPropertySymbols(obj)) {
    result[sym] = (obj as Record<symbol, unknown>)[sym];
  }

  return result as TransformObjectReturn<T, O>;
}
