import { ExcludeStep } from '../../types/excludeStateTypes';
import sortedPaths from './sortedPaths';

/** The paths below a key that no path continues below */
const NO_PATHS: readonly string[] = [];

/**
 * The step for a key, from the rest of each path that matches it: `undefined` where the
 * path ends at the key
 *
 * @internal This function is for internal use by the library
 */
export default function createStep(
  rests: readonly (string | undefined)[],
): ExcludeStep {
  let keepKey = false;
  let below: string[] | undefined;
  for (const rest of rests) {
    if (rest === undefined) keepKey = true;
    else (below ??= []).push(rest);
  }
  return {
    keepKey,
    pathsBelow: below ? sortedPaths(below) : NO_PATHS,
    scope: undefined,
  };
}
