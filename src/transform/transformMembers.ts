import { ReferenceTable } from '../types/referenceTableTypes';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import internalTransform from './internalTransform';

/**
 * Transforms the members of a Set into `result`: one of the collection loops of
 * `internalTransform`, which it calls back directly for each member.
 *
 * @param source - The Set
 * @param result - Its (still empty) result
 * @param options - The options of the call
 * @param visitedRefs - The reference tables (see `internalTransform`)
 * @param depth - The level of the members: one below the Set
 * @param nesting - The objects, arrays, Maps and Sets above the Set, for
 * `UNTRACKED_NESTING_LIMIT`
 * @internal This function is for internal use by the library
 */
export default function transformMembers(
  source: ReadonlySet<unknown>,
  result: Set<unknown>,
  options: TransformOptionsInternal,
  visitedRefs: ReferenceTable[],
  depth: number,
  nesting: number,
): void {
  for (const value of source) {
    result.add(
      internalTransform(value, options, visitedRefs, depth, nesting + 1),
    );
  }
}
