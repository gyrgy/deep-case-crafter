import transformArray from '../dataTransformers/transformArray';
import transformMap from '../dataTransformers/transformMap';
import transformObject from '../dataTransformers/transformObject';
import { TransformOptionsInternal } from '../types/transformOptionTypes';

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

  // Get max depth (default to 3 if not specified)
  const maxDepth = options.depth ?? 3;

  // Stop recursion if maximum depth is reached
  if (currentDepth >= maxDepth) {
    return data;
  }

  // Create options for recursive calls
  const recursiveOptions = {
    ...options,
    depth: maxDepth,
  };

  let result: unknown;

  // Apply the appropriate transformer based on the data type
  if (Array.isArray(data)) {
    // Transform array
    result = transformArray(data, options);

    // Add the result to visited references to handle circular refs
    visitedRefs.set(data, result);

    // Recursively transform array items that are objects or arrays
    if (currentDepth < maxDepth) {
      result = (result as unknown[]).map((item) =>
        internalTransform(
          item,
          recursiveOptions,
          visitedRefs,
          currentDepth + 1,
        ),
      );
    }
  } else if (data instanceof Map) {
    // Transform Map keys
    result = transformMap(data, options);

    // Add the result to visited references to handle circular refs
    visitedRefs.set(data, result);

    // Recursively transform Map values that are objects or arrays
    if (currentDepth < maxDepth) {
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
    }
  } else if (data instanceof Set) {
    // Don't transform Set values, just create a new Set
    result = new Set(data);

    // Add the result to visited references to handle circular refs
    visitedRefs.set(data, result);

    // But recursively transform Set items that are objects or arrays
    if (currentDepth < maxDepth) {
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
    }
  } else {
    // Transform plain object
    result = transformObject(data as Record<string, unknown>, options);

    // Add the result to visited references to handle circular refs
    visitedRefs.set(data, result);

    // Recursively transform nested objects
    if (currentDepth < maxDepth) {
      const transformedObj = result as Record<string, unknown>;
      for (const key in transformedObj) {
        const value = transformedObj[key];
        if (value !== null && typeof value === 'object') {
          transformedObj[key] = internalTransform(
            value,
            recursiveOptions,
            visitedRefs,
            currentDepth + 1,
          );
        }
      }
    }
  }

  return result;
}
