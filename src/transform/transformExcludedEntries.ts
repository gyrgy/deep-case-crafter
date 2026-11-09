import { ExcludeState } from '../types/excludeStateTypes';
import excludeStep from './exclude/excludeStep';
import stepScope from './exclude/stepScope';
import internalTransform from './internalTransform';
import transformCase from './transformCase';

/**
 * With `exclude`, transforms the entries of a Map where a path still matches into
 * `result`: each key keeps its name where a path ends at it, and its value is transformed
 * in the scope of the paths that continue below it. One of the collection loops of
 * `internalTransform`, which it calls back directly for each value.
 *
 * @param source - The Map
 * @param result - Its (still empty) result
 * @param state - The `exclude` state of the Map
 * @param depth - The level of the values: one below the Map
 * @param nesting - The objects, arrays, Maps and Sets above the Map, for
 * `UNTRACKED_NESTING_LIMIT`
 * @internal This function is for internal use by the library
 */
export default function transformExcludedEntries(
  source: ReadonlyMap<unknown, unknown>,
  result: Map<unknown, unknown>,
  state: ExcludeState,
  depth: number,
  nesting: number,
): void {
  for (const [key, value] of source) {
    const step = excludeStep(state, key);
    const scope = stepScope(state, step);
    result.set(
      typeof key === 'string' && !step.keepKey
        ? transformCase(key, state.options.targetCase)
        : key,
      internalTransform(
        value,
        scope.options,
        scope.visitedRefs,
        depth,
        nesting + 1,
      ),
    );
  }
}
