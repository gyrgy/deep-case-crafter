import transformArray from '../dataTransformers/transformArray';
import transformMap from '../dataTransformers/transformMap';
import transformObject from '../dataTransformers/transformObject';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import setKey from '../utils/setKey';

/**
 * Recursively transforms data structures (objects, arrays, Maps) by changing their keys/property names
 *
 * @param data - The data to transform (object, array, Map)
 * @param options - Transformation options
 * @param visitedRefs - Used internally to track circular references
 * @param currentDepth - Used internally to track current recursion depth
 * @returns The transformed data
 *
 * @internal This function is for internal use by the library
 */
export default function internalTransform(
  data: unknown,
  options: TransformOptionsInternal & { depth?: number },
  visitedRefs: WeakMap<object, unknown> = new WeakMap(),
  currentDepth: number = 0,
): unknown {
  // Handle primitive values
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }

  // Handle circular references
  if (visitedRefs.has(data as object)) {
    return visitedRefs.get(data as object);
  }

  // Get max depth (default to unlimited recursion if not specified).
  // Circular references are still handled via `visitedRefs`, so Infinity is safe.
  const maxDepth = options.depth ?? Infinity;

  // Stop recursion if maximum depth is reached
  if (currentDepth >= maxDepth) {
    return data;
  }

  // Options for recursive calls. `depth` is constant for the whole call, so once
  // `options` already carries it (always true via the public `transform`, and after the
  // first node otherwise) we reuse the same object instead of re-spreading it per node.
  const recursiveOptions =
    options.depth === maxDepth ? options : { ...options, depth: maxDepth };

  // Reaching this point guarantees `currentDepth < maxDepth` (we returned
  // early above otherwise), so recursion into children is always performed
  // here; the recursive call's own depth guard stops it at the boundary.
  let result: unknown;

  // Apply the appropriate transformer based on the data type
  if (Array.isArray(data)) {
    // An array is a collection, not a nesting level of its own, so each item is
    // recursed at the current depth (one pass — `transformArray` no longer
    // re-implements the type dispatch). `register` records the result before items
    // are processed so a self-referencing array resolves to it.
    result = transformArray(
      data,
      (out) => visitedRefs.set(data, out),
      (item) =>
        internalTransform(item, recursiveOptions, visitedRefs, currentDepth),
    );
  } else if (data instanceof Map) {
    // Transform Map keys
    result = transformMap(data, options);
    visitedRefs.set(data, result);

    // Recursively transform Map values that are objects or arrays
    const transformedMap = result as Map<unknown, unknown>;
    for (const [key, value] of transformedMap.entries()) {
      if (value !== null && typeof value === 'object') {
        transformedMap.set(
          key,
          internalTransform(
            value,
            recursiveOptions,
            visitedRefs,
            currentDepth + 1,
          ),
        );
      }
    }
  } else if (data instanceof Set) {
    // Don't transform Set values, just create a new Set
    result = new Set(data);
    visitedRefs.set(data, result);

    // But recursively transform Set items that are objects or arrays
    const transformedSet = result as Set<unknown>;
    const originalValues = Array.from(transformedSet);
    transformedSet.clear();

    for (const value of originalValues) {
      if (value !== null && typeof value === 'object') {
        transformedSet.add(
          internalTransform(
            value,
            recursiveOptions,
            visitedRefs,
            currentDepth + 1,
          ),
        );
      } else {
        transformedSet.add(value);
      }
    }
  } else {
    // Transform plain object
    result = transformObject(data as Record<string, unknown>, options);
    visitedRefs.set(data, result);

    // Recursively transform nested objects
    const transformedObj = result as Record<string, unknown>;
    for (const key in transformedObj) {
      const value = transformedObj[key];
      if (value !== null && typeof value === 'object') {
        setKey(
          transformedObj,
          key,
          internalTransform(
            value,
            recursiveOptions,
            visitedRefs,
            currentDepth + 1,
          ),
        );
      }
    }
  }

  return result;
}
