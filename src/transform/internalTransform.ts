import { DICTIONARY_MODE_KEYS } from '../constants/fastObjects';
import { OBJECT_TAG } from '../constants/objectTag';
import {
  NESTING_LIMIT_REACHED,
  UNTRACKED_NESTING_LIMIT,
} from '../constants/referenceTables';
import { ReferenceTable } from '../types/referenceTableTypes';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import getObjectTag from '../utils/getObjectTag';
import isMap from '../utils/isMap';
import isSet from '../utils/isSet';
import readProperty from '../utils/readProperty';
import setKey from '../utils/setKey';
import copySymbolProperties from './copySymbolProperties';
import findReference from './findReference';
import learnLayout from './learnLayout';
import recordReference from './recordReference';
// Imported before the collection loops, which import this module back: the bundle then
// declares the key cache constants before any function that reaches them, and the
// minifier can write them into `transformObjectKey` as numbers
import transformObjectKey from './transformObjectKey';
import transformEntries from './transformEntries';
import transformExcludedEntries from './transformExcludedEntries';
import transformExcludedProperties from './transformExcludedProperties';
import transformItems from './transformItems';
import transformMembers from './transformMembers';

/**
 * Recursively transforms data structures (objects, arrays, Maps, Sets) by changing their keys/property names
 *
 * Plain objects, the most common node, are transformed here (one stack frame per nesting
 * level). Arrays, Maps and Sets go through small helper loops that call back into this
 * function directly (two small frames per level): `transformItems`, `transformEntries`
 * and `transformMembers`. The loops are separate functions, not closures, so that no
 * function is created per node and this function's stack frame stays small: with them
 * inlined, a first call converted nested objects about a quarter less deep (1,800 instead
 * of 2,400 levels on Node 24, measured for 3.6.0), though nested arrays deeper. With
 * `exclude`, objects and Maps where a path still matches go through
 * `transformExcludedProperties` and `transformExcludedEntries`; arrays and Sets add no key
 * to a path, so their items stay in the scope of their collection.
 *
 * @param data - The data to transform (object, array, Map, Set)
 * @param options - Transformation options
 * @param visitedRefs - Used internally to track circular and shared references, per level.
 * With `exclude`, every set of matching paths has its own (see `ExcludeState`). Not used
 * with `keepReferences: false`.
 * @param currentDepth - Used internally to track current recursion depth
 * @param nesting - Used internally to count the objects, arrays, Maps and Sets above
 * `data`, for `UNTRACKED_NESTING_LIMIT`
 * @returns The transformed data
 * @throws `NESTING_LIMIT_REACHED` with `keepReferences: false`, at that limit
 *
 * @internal This function is for internal use by the library
 */
export default function internalTransform(
  data: unknown,
  options: TransformOptionsInternal,
  visitedRefs: ReferenceTable[] = [],
  currentDepth: number = 0,
  nesting: number = 0,
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
  // depends on the level it is reached at, so every level has its own table.
  const level = options.depth === Infinity ? 0 : currentDepth;
  const tracked = options.keepReferences;
  if (tracked) {
    // Every level up to this one gets a table, so that the array has no gaps: an index
    // that an array does not have is read from its prototypes, and `Object.prototype` can
    // have a key such as `0`
    while (visitedRefs.length <= level) visitedRefs.push(new Map());
    const seen = findReference(visitedRefs[level], data);
    if (seen !== undefined) return seen;
  } else if (nesting >= UNTRACKED_NESTING_LIMIT) {
    throw NESTING_LIMIT_REACHED;
  }

  // Every node records its (still empty) result before its children are transformed, so
  // a circular reference back to it resolves to that result.

  // An array is a collection, not a nesting level of its own: its items stay on its level
  if (Array.isArray(data)) {
    const result: unknown[] = [];
    if (tracked) recordReference(visitedRefs, level, data, result);
    transformItems(data, result, options, visitedRefs, currentDepth, nesting);
    return result;
  }

  // The values of Maps, Sets and objects sit one nesting level deeper
  const nextDepth = currentDepth + 1;
  const tag = getObjectTag(data);

  if (isMap(data, tag)) {
    const result = new Map<unknown, unknown>();
    if (tracked) recordReference(visitedRefs, level, data, result);
    if (options.exclude === null) {
      transformEntries(data, result, options, visitedRefs, nextDepth, nesting);
    } else {
      transformExcludedEntries(
        data,
        result,
        options.exclude,
        nextDepth,
        nesting,
      );
    }
    return result;
  }

  if (isSet(data, tag)) {
    const result = new Set<unknown>();
    if (tracked) recordReference(visitedRefs, level, data, result);
    transformMembers(data, result, options, visitedRefs, nextDepth, nesting);
    return result;
  }

  // Ordinary key/value objects: plain objects, Object.create(null) objects and class
  // instances
  if (tag === OBJECT_TAG) {
    const source = data as Record<PropertyKey, unknown>;
    const result: Record<PropertyKey, unknown> = {};
    if (tracked) recordReference(visitedRefs, level, data, result);

    if (options.exclude !== null) {
      transformExcludedProperties(
        source,
        result,
        options.exclude,
        nextDepth,
        nesting,
      );
      return result;
    }

    // How many keys `result` gets (see `learnLayout`)
    let width = 0;
    // The key being stored: after the loop, the last one
    let resultKey = '';

    // Own enumerable string keys (`for...in` skips symbols, and inherited keys are skipped;
    // see `readProperty` for what keeps this loop fast in V8). Values that are not
    // objects are stored without a call.
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        resultKey = transformObjectKey(key, options.targetCase);
        width++;
        const value = readProperty(source, key);
        if (typeof value !== 'object' || value === null) {
          setKey(result, resultKey, value);
          continue;
        }
        setKey(
          result,
          resultKey,
          internalTransform(
            value,
            options,
            visitedRefs,
            nextDepth,
            nesting + 1,
          ),
        );
      }
    }

    width += copySymbolProperties(source, result);
    // `done` is checked here as well: once a call has stopped learning, its objects then
    // cost no call
    if (
      width >= DICTIONARY_MODE_KEYS &&
      (options.layouts === null || !options.layouts.done)
    ) {
      learnLayout(options, result, width, resultKey);
    }
    return result;
  }

  // Date, RegExp, Error, URL, typed arrays and other built-ins keep their state
  // in internal slots, not in keys: return them untouched.
  return data;
}
