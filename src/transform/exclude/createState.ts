import {
  ExcludeRoot,
  ExcludeState,
  ExcludeStep,
} from '../../types/excludeStateTypes';
import { TransformOptionsInternal } from '../../types/transformOptionTypes';
import memoryFor from '../memoryFor';
import createStep from './createStep';
import splitPath from './splitPath';

/**
 * Creates the state for the values reached with `paths` (sorted, without repeats, not
 * empty); `stateFor` keeps one per set of paths.
 *
 * @internal This function is for internal use by the library
 */
export default function createState(
  paths: readonly string[],
  root: ExcludeRoot,
): ExcludeState {
  // The rest of the paths by their first key, in one pass: `*` also matches the keys
  // that other paths name
  const anyKey: (string | undefined)[] = [];
  let restsByKey: Map<string, (string | undefined)[]> | undefined;
  for (const path of paths) {
    const [key, rest] = splitPath(path);
    if (key === '*') {
      anyKey.push(rest);
    } else {
      restsByKey ??= new Map();
      const rests = restsByKey.get(key);
      if (rests) rests.push(rest);
      else restsByKey.set(key, [rest]);
    }
  }

  const named = new Map<string, ExcludeStep>();
  for (const [key, rests] of restsByKey ?? []) {
    named.set(key, createStep(anyKey.length ? [...rests, ...anyKey] : rests));
  }

  const { targetCase, depth, keepReferences } = root.plain.options;
  const options: TransformOptionsInternal = {
    targetCase,
    depth,
    keepReferences,
    exclude: null,
    layouts: root.store === null ? null : memoryFor(root.store, paths),
  };
  const state: ExcludeState = {
    options,
    visitedRefs: [],
    named,
    other: createStep(anyKey),
    root,
  };
  options.exclude = state;
  return state;
}
