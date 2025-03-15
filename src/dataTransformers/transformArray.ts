import { Expand } from '../types/helperTypes';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import { TransformArrayReturn } from '../types/transformTypes';
import transformMap from './transformMap';
import transformObject from './transformObject';

/**
 * Transforms all objects and Maps within an array (single level only)
 *
 * @param arr - The array to transform
 * @param options - Transformation options including targetCase (required) and optional sourceCase
 * @returns A new array with transformed items
 *
 * @remarks
 * - This function transforms keys in objects and Maps contained in the array
 * - Only transforms at the current level (not recursive)
 * - Non-object values in the array are kept as-is
 * - When sourceCase is specified, provides more precise type information
 *
 * @internal This function is for internal use by the library
 */
export default function transformArray<
  T extends unknown[],
  O extends TransformOptionsInternal,
>(arr: T, options: O): Expand<TransformArrayReturn<T, O>> {
  if (!Array.isArray(arr)) {
    return arr as unknown as Expand<TransformArrayReturn<T, O>>;
  }

  return arr.map((item) => {
    // Handle null and undefined
    if (item === null || item === undefined) {
      return item as unknown as Expand<TransformArrayReturn<T, O>[number]>;
    }

    // Handle Maps
    if (item instanceof Map) {
      return transformMap(item, options) as unknown as Expand<
        TransformArrayReturn<T, O>[number]
      >;
    }

    // Handle plain objects (not arrays or other special objects)
    if (
      typeof item === 'object' &&
      !Array.isArray(item) &&
      !(item instanceof Set)
    ) {
      return transformObject(item, options) as unknown as Expand<
        TransformArrayReturn<T, O>[number]
      >;
    }

    // Leave other types unchanged
    return item as unknown as Expand<TransformArrayReturn<T, O>[number]>;
  }) as unknown as Expand<TransformArrayReturn<T, O>>;
}
