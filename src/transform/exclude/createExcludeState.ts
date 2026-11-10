import { ExcludeRoot, ExcludeState } from '../../types/excludeStateTypes';
import { LayoutStore } from '../../types/layoutTypes';
import { TransformOptionsInternal } from '../../types/transformOptionTypes';
import createState from './createState';

/**
 * Creates the state for the top of the data, for one call
 *
 * @param paths - The `exclude` paths, checked, sorted and without repeats (see
 * `resolveExclude`), not empty
 * @param options - The resolved options, with `exclude` set to `null`
 * @param store - The layout memories that a function made by `transformTo` keeps across
 * its calls, or `null`
 * @returns The state
 *
 * @example
 * ```typescript
 * createExcludeState(['users_by_id.*'], options, null).named.get('users_by_id')?.pathsBelow
 * // => ['*']
 * ```
 * @internal This function is for internal use by the library
 */
export default function createExcludeState(
  paths: readonly string[],
  options: TransformOptionsInternal,
  store: LayoutStore | null,
): ExcludeState {
  const root: ExcludeRoot = {
    plain: { options, visitedRefs: [] },
    states: new Map(),
    store,
  };
  // Not recorded in `states`: the paths below any key are shorter than the longest path
  // here, so no other state can have the same paths
  return createState(paths, root);
}
