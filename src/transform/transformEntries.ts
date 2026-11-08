import { ReferenceTable } from '../types/referenceTableTypes';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import internalTransform from './internalTransform';
import transformCase from './transformCase';

/**
 * Transforms the entries of a Map into `result`: one of the collection loops of
 * `internalTransform`, which it calls back directly for each value.
 *
 * @param source - The Map
 * @param result - Its (still empty) result
 * @param options - The options of the call
 * @param visitedRefs - The reference tables (see `internalTransform`)
 * @param depth - The level of the values: one below the Map
 * @param nesting - The objects, arrays, Maps and Sets above the Map, for
 * `UNTRACKED_NESTING_LIMIT`
 * @internal This function is for internal use by the library
 */
export default function transformEntries(
  source: ReadonlyMap<unknown, unknown>,
  result: Map<unknown, unknown>,
  options: TransformOptionsInternal,
  visitedRefs: ReferenceTable[],
  depth: number,
  nesting: number,
): void {
  for (const [key, value] of source) {
    // Only string keys have a case. They are converted without the key cache: a Map key
    // can be a slice of a much larger string, which a cache entry would keep alive.
    result.set(
      typeof key === 'string' ? transformCase(key, options.targetCase) : key,
      internalTransform(value, options, visitedRefs, depth, nesting + 1),
    );
  }
}
