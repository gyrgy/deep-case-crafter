import { EXCLUDE_PATH_REGEX } from '../../constants/regex';
import { ExcludeRoot, ExcludeState } from '../../types/excludeStateTypes';
import { TransformOptionsInternal } from '../../types/transformOptionTypes';
import describeValue from '../../utils/describeValue';
import createState from './createState';
import sortedPaths from './sortedPaths';

/**
 * Validates the `exclude` option of `transform` and creates the state for the top of the
 * data.
 *
 * @param exclude - The `exclude` option, as passed to `transform`
 * @param options - The resolved options, with `exclude` set to `null`
 * @returns The state, or `null` when there is no path (`exclude` omitted, `null` or empty)
 * @throws TypeError for anything but an array of non-empty keys joined with dots
 *
 * @example
 * ```typescript
 * createExcludeState(['users_by_id.*'], options)?.named.get('users_by_id')?.pathsBelow
 * // => ['*']
 * ```
 * @internal This function is for internal use by the library
 */
export default function createExcludeState(
  exclude: unknown,
  options: TransformOptionsInternal,
): ExcludeState | null {
  if (exclude === undefined || exclude === null) return null;

  if (!Array.isArray(exclude)) {
    throw new TypeError(
      `Unsupported exclude ${describeValue(exclude)}. Use an array of paths, such as ["metadata.*"].`,
    );
  }
  for (const path of exclude) {
    if (typeof path !== 'string' || !EXCLUDE_PATH_REGEX.test(path)) {
      throw new TypeError(
        `Unsupported exclude path ${describeValue(path)}. Use non-empty keys joined with dots, such as "metadata.*".`,
      );
    }
  }

  if (exclude.length === 0) return null;

  const root: ExcludeRoot = {
    plain: { options, visitedRefs: [] },
    states: new Map(),
  };
  // Not recorded in `states`: the paths below any key are shorter than the longest path
  // here, so no other state can have the same paths
  return createState(sortedPaths(exclude), root);
}
