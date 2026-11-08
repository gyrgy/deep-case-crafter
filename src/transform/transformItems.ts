import { ReferenceTable } from '../types/referenceTableTypes';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import internalTransform from './internalTransform';

/**
 * Transforms the items of an array into `result`: one of the collection loops of
 * `internalTransform`, which it calls back directly for each item that is an object.
 *
 * @param source - The array
 * @param result - Its (still empty) result
 * @param options - The options of the call
 * @param visitedRefs - The reference tables (see `internalTransform`)
 * @param depth - The level of the items: an array is not a level of its own
 * @param nesting - The objects, arrays, Maps and Sets above the array, for
 * `UNTRACKED_NESTING_LIMIT`
 * @internal This function is for internal use by the library
 */
export default function transformItems(
  source: readonly unknown[],
  result: unknown[],
  options: TransformOptionsInternal,
  visitedRefs: ReferenceTable[],
  depth: number,
  nesting: number,
): void {
  // Read through the array's iterator, as `for...of` does elsewhere. An indexed read here
  // would see every array of the data, and V8 then stores the input's arrays of
  // non-integer numbers as boxed values, more than doubling their memory. Items that are
  // not objects are copied without a call, by a `push` of their own: one `push` of either
  // kind of value makes arrays of numbers and strings about 1.4 times slower once the
  // loop has seen both kinds.
  for (const item of source) {
    if (typeof item !== 'object' || item === null) {
      result.push(item);
      continue;
    }
    result.push(
      internalTransform(item, options, visitedRefs, depth, nesting + 1),
    );
  }
}
