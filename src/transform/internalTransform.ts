import { OBJECT_TAG } from '../constants/objectTag';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import getObjectTag from '../utils/getObjectTag';
import isMap from '../utils/isMap';
import isSet from '../utils/isSet';
import setKey from '../utils/setKey';
import { ExcludeState, excludeStep, stepScope } from './excludePaths';
import transformCase from './transformCase';
import transformObjectKey from './transformObjectKey';

/**
 * Recursively transforms data structures (objects, arrays, Maps, Sets) by changing their keys/property names
 *
 * Plain objects are transformed here (one stack frame per nesting level); arrays, Maps
 * and Sets go through small helper loops that call back into this function directly (two
 * frames per level). No callbacks or closures are created per node.
 *
 * @param data - The data to transform (object, array, Map, Set)
 * @param options - Transformation options
 * @param visitedRefs - Used internally to track circular and shared references, per level.
 * With `exclude`, every set of matching paths has its own (see `ExcludeState`).
 * @param currentDepth - Used internally to track current recursion depth
 * @returns The transformed data
 *
 * @internal This function is for internal use by the library
 */
export default function internalTransform(
  data: unknown,
  options: TransformOptionsInternal,
  visitedRefs: WeakMap<object, unknown>[] = [],
  currentDepth: number = 0,
): unknown {
  // Handle primitive values (and functions)
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Stop recursion if maximum depth is reached. This comes first, so an object that is
  // also referenced from a shallower level is still returned as it is here.
  if (currentDepth >= options.depth) {
    return data;
  }

  // Handle circular and shared references. With a depth limit, an object's result
  // depends on the level it is reached at, so every level has its own map.
  const level = options.depth === Infinity ? 0 : currentDepth;
  const visited = (visitedRefs[level] ??= new WeakMap());
  if (visited.has(data)) {
    return visited.get(data);
  }

  // Every node records its (still empty) result before its children are transformed, so
  // a circular reference back to it resolves to that result.

  // An array is a collection, not a nesting level of its own: its items stay on its level
  if (Array.isArray(data)) {
    const result: unknown[] = [];
    visited.set(data, result);
    transformItems(data, result, options, visitedRefs, currentDepth);
    return result;
  }

  // The values of Maps, Sets and objects sit one nesting level deeper
  const nextDepth = currentDepth + 1;
  const tag = getObjectTag(data);

  if (isMap(data, tag)) {
    const result = new Map<unknown, unknown>();
    visited.set(data, result);
    if (options.exclude === null) {
      transformEntries(data, result, options, visitedRefs, nextDepth);
    } else {
      transformExcludedEntries(data, result, options.exclude, nextDepth);
    }
    return result;
  }

  if (isSet(data, tag)) {
    const result = new Set<unknown>();
    visited.set(data, result);
    transformMembers(data, result, options, visitedRefs, nextDepth);
    return result;
  }

  // Ordinary key/value objects: plain objects, Object.create(null) objects and class
  // instances
  if (tag === OBJECT_TAG) {
    const source = data as Record<PropertyKey, unknown>;
    const result: Record<PropertyKey, unknown> = {};
    visited.set(data, result);

    if (options.exclude === null) {
      // Own enumerable string keys (`for...in` skips symbols, and inherited keys are skipped)
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          setKey(
            result,
            transformObjectKey(key, options.targetCase),
            internalTransform(source[key], options, visitedRefs, nextDepth),
          );
        }
      }
    } else {
      transformExcludedProperties(source, result, options.exclude, nextDepth);
    }

    // Symbol-keyed properties are copied across unchanged
    for (const sym of Object.getOwnPropertySymbols(source)) {
      result[sym] = source[sym];
    }

    return result;
  }

  // Date, RegExp, Error, URL, typed arrays and other built-ins keep their state
  // in internal slots, not in keys: return them untouched.
  return data;
}

// The collection loops are separate functions, not closures, and call internalTransform
// directly: plain objects, the most common node, are transformed inside internalTransform,
// which keeps its stack frame small, and a nested collection takes two small frames.

function transformItems(
  source: readonly unknown[],
  result: unknown[],
  options: TransformOptionsInternal,
  visitedRefs: WeakMap<object, unknown>[],
  depth: number,
): void {
  for (const item of source) {
    result.push(internalTransform(item, options, visitedRefs, depth));
  }
}

function transformEntries(
  source: ReadonlyMap<unknown, unknown>,
  result: Map<unknown, unknown>,
  options: TransformOptionsInternal,
  visitedRefs: WeakMap<object, unknown>[],
  depth: number,
): void {
  for (const [key, value] of source) {
    // Only string keys have a case. They are converted without the key cache: a Map key
    // can be a slice of a much larger string, which a cache entry would keep alive.
    result.set(
      typeof key === 'string' ? transformCase(key, options.targetCase) : key,
      internalTransform(value, options, visitedRefs, depth),
    );
  }
}

function transformMembers(
  source: ReadonlySet<unknown>,
  result: Set<unknown>,
  options: TransformOptionsInternal,
  visitedRefs: WeakMap<object, unknown>[],
  depth: number,
): void {
  for (const value of source) {
    result.add(internalTransform(value, options, visitedRefs, depth));
  }
}

// With `exclude`, objects and Maps where a path still matches go through these loops
// instead: each key keeps its name where a path ends at it, and its value is transformed
// in the scope of the paths that continue below it. Arrays and Sets add no key to a path,
// so their items stay in the scope of their collection.

function transformExcludedProperties(
  source: Record<PropertyKey, unknown>,
  result: Record<PropertyKey, unknown>,
  state: ExcludeState,
  depth: number,
): void {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const step = excludeStep(state, key);
      const scope = stepScope(state, step);
      setKey(
        result,
        step.keepKey ? key : transformObjectKey(key, state.options.targetCase),
        internalTransform(source[key], scope.options, scope.visitedRefs, depth),
      );
    }
  }
}

function transformExcludedEntries(
  source: ReadonlyMap<unknown, unknown>,
  result: Map<unknown, unknown>,
  state: ExcludeState,
  depth: number,
): void {
  for (const [key, value] of source) {
    const step = excludeStep(state, key);
    const scope = stepScope(state, step);
    result.set(
      typeof key === 'string' && !step.keepKey
        ? transformCase(key, state.options.targetCase)
        : key,
      internalTransform(value, scope.options, scope.visitedRefs, depth),
    );
  }
}
