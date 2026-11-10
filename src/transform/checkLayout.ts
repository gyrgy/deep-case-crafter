import { RECOPY_CHECKS } from '../constants/fastObjects';
import { LayoutMemory } from '../types/layoutTypes';
import haveSameKeys from '../utils/haveSameKeys';
import copyLayout from './copyLayout';

/**
 * Checks a layout that a memory kept across calls has learned, with its first result in
 * a call: its keys must be the layout's. Other keys with the same number of keys and last
 * key, as two kinds of records of the same width and last key have, mean that the data
 * comes in many shapes: the function then stops using the memory, so the rest of the call
 * learns with a memory of its own, as do the function's later calls, as calls to
 * `transform` do (see `replaced`). Without the check, the layout learned first would keep
 * the other one from being learned in any later call.
 *
 * Every `RECOPY_CHECKS` checks of a layout, its copy is replaced with one made from
 * `result`: V8 may have left the old copy's hidden classes out of its tree of transitions,
 * where later results do not reach them, as it does once a map has 1,536 transitions.
 *
 * @param memory - The memory kept across calls
 * @param index - The layout's place in `fastWidths`
 * @param result - The first result of the layout in the call, complete
 * @returns Whether `result` has the layout's keys
 * @internal This function is for internal use by the library
 */
export default function checkLayout(
  memory: LayoutMemory,
  index: number,
  result: Record<PropertyKey, unknown>,
): boolean {
  memory.checked[index] = true;
  if (!haveSameKeys(memory.fastKeyLists[index], result)) {
    memory.replaced = true;
    return false;
  }
  if (++memory.checks[index] % RECOPY_CHECKS === 0) {
    memory.fastObjects[index] = copyLayout(result);
  }
  return true;
}
