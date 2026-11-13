import { MAX_LAYOUTS } from '../constants/fastObjects';
import { LayoutMemory } from '../types/layoutTypes';
import copyLayout from './copyLayout';
import emptyCopies from './emptyCopies';

/**
 * Learns the layout of `result`: a copy made with spread syntax is a fast object, and the
 * results built after it with the same keys in the same order follow its hidden classes.
 * The copy holds no data, so that a number of another kind in a later result of the
 * layout, such as a fraction in a field of whole numbers, leaves the results after it
 * fast (see `copyLayout`). A memory of one call empties its copy only at the layout's third
 * result in the call (see `learnLayout`): a call with two results of a layout, such as one
 * that converts two records, then spends no time on that.
 *
 * The layout is stored from its copy to its number of keys, which `learnLayout` looks it up
 * by: if an exception, such as the RangeError of a full stack, stops this partway, the
 * layout is not learned, and the next layout learned takes its place in every list.
 *
 * Once a memory of one call has learned `MAX_LAYOUTS` layouts, the call stops learning,
 * and the copies it has not emptied yet are emptied (see `emptyCopies`). A memory kept
 * across calls is replaced instead: the rest of the call learns with a memory of its own,
 * as a call to `transform` does, and so do the function's later calls.
 *
 * @param memory - The memory
 * @param result - The result, complete
 * @param width - How many keys it has
 * @param lastKey - Its last string key
 * @internal This function is for internal use by the library
 */
export default function addLayout(
  memory: LayoutMemory,
  result: Record<PropertyKey, unknown>,
  width: number,
  lastKey: string,
): void {
  const index = memory.fastWidths.length;
  if (memory.toForget === null) {
    memory.fastObjects[index] = { ...result };
    memory.checked[index] = false;
  } else {
    const copy = copyLayout(result, width);
    memory.fastObjects[index] = copy;
    memory.fastKeyLists[index] = Reflect.ownKeys(copy);
    memory.checked[index] = true;
    memory.checks[index] = 0;
  }
  memory.fastKeys[index] = lastKey;
  memory.fastWidths[index] = width;
  if (index + 1 === MAX_LAYOUTS) {
    if (memory.toForget === null) {
      memory.done = true;
      emptyCopies(memory);
    } else memory.replaced = true;
  }
}
