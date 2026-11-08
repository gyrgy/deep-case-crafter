import {
  ExcludeState,
  ExcludeStep,
  TransformScope,
} from '../../types/excludeStateTypes';
import stateFor from './stateFor';

/**
 * The scope to transform the value under a step's key in: the state of the paths below
 * the key, or the plain options when no path continues there.
 *
 * @internal This function is for internal use by the library
 */
export default function stepScope(
  state: ExcludeState,
  step: ExcludeStep,
): TransformScope {
  return (step.scope ??=
    step.pathsBelow.length === 0
      ? state.root.plain
      : stateFor(step.pathsBelow, state.root));
}
