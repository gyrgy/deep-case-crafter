import { DICTIONARY_MODE_KEYS } from '../constants/fastObjects';
import { ExcludeState } from '../types/excludeStateTypes';
import setKey from '../utils/setKey';
import copySymbolProperties from './copySymbolProperties';
import excludeStep from './exclude/excludeStep';
import stepScope from './exclude/stepScope';
import internalTransform from './internalTransform';
import learnLayout from './learnLayout';
import transformObjectKey from './transformObjectKey';

/**
 * With `exclude`, transforms the properties of an object where a path still matches into
 * `result`: each key keeps its name where a path ends at it, and its value is transformed
 * in the scope of the paths that continue below it. One of the collection loops of
 * `internalTransform`, which it calls back directly for each value.
 *
 * @param source - The object
 * @param result - Its (still empty) result
 * @param state - The `exclude` state of the object
 * @param depth - The level of the values: one below the object
 * @param nesting - The objects, arrays, Maps and Sets above the object, for
 * `UNTRACKED_NESTING_LIMIT`
 * @internal This function is for internal use by the library
 */
export default function transformExcludedProperties(
  source: Record<PropertyKey, unknown>,
  result: Record<PropertyKey, unknown>,
  state: ExcludeState,
  depth: number,
  nesting: number,
): void {
  let width = 0;
  let resultKey = '';
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const step = excludeStep(state, key);
      const scope = stepScope(state, step);
      resultKey = step.keepKey
        ? key
        : transformObjectKey(key, state.options.targetCase);
      width++;
      setKey(
        result,
        resultKey,
        internalTransform(
          source[key],
          scope.options,
          scope.visitedRefs,
          depth,
          nesting + 1,
        ),
      );
    }
  }

  width += copySymbolProperties(source, result);
  if (width >= DICTIONARY_MODE_KEYS) {
    learnLayout(state.options, result, width, resultKey);
  }
}
