import { ExcludeRoot, ExcludeState } from '../../types/excludeStateTypes';
import createState from './createState';

/**
 * The state for the values reached with `paths` (sorted, without repeats, not empty)
 *
 * @internal This function is for internal use by the library
 */
export default function stateFor(
  paths: readonly string[],
  root: ExcludeRoot,
): ExcludeState {
  const id = JSON.stringify(paths);
  let state = root.states.get(id);
  if (!state) {
    state = createState(paths, root);
    root.states.set(id, state);
  }
  return state;
}
