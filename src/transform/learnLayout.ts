import { LAYOUT_CANDIDATES, LAYOUT_MAX_KEYS } from '../constants/fastObjects';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import haveSameKeys from '../utils/haveSameKeys';
import addLayout from './addLayout';
import checkLayout from './checkLayout';
import createLayoutMemory from './createLayoutMemory';
import listToForget from './listToForget';
import replaceMemory from './replaceMemory';

/**
 * Teaches V8 the layout of `result`, an object of at least `DICTIONARY_MODE_KEYS` keys,
 * when it is the second result of that layout in the call: a copy made with spread syntax
 * is a fast object, and the results built after it with the same keys in the same order
 * follow its hidden classes and stay fast (see `addLayout`). The first two stay in
 * dictionary mode.
 *
 * A function made by `transformTo` keeps its memories across its calls, so the results
 * can come from different calls, as when it converts one record per call. Across calls,
 * a layout is learned from its third result: when a call returns, the memory keeps the
 * keys of a result only if its layout came up in an earlier call as well. The results
 * built after the copy are fast in its later calls too: the copy is kept, and each call
 * checks the layouts it meets (see `checkLayout`). Once the function has stopped using
 * one of its memories, because it learned `MAX_LAYOUTS` layouts, or met a result with
 * other keys than one of an earlier call with the same number of keys and last key, the
 * rest of the call learns with a memory of its own (see `replaceMemory`). Two results of
 * the call itself with other keys stop the call's learning, as in a call to `transform`.
 * Either way, the function's later calls learn on their own, as calls to `transform` do.
 *
 * `result` itself is never replaced, so references that already point to it stay valid.
 * Layouts seen only once, such as those of objects keyed by IDs, cost no copy.
 *
 * @param options - The options of the call, which hold its `LayoutMemory`
 * @param result - The result, complete
 * @param width - How many keys it has
 * @param lastKey - Its last string key
 * @internal This function is for internal use by the library
 */
export default function learnLayout(
  options: TransformOptionsInternal,
  result: Record<PropertyKey, unknown>,
  width: number,
  lastKey: string,
): void {
  if (width > LAYOUT_MAX_KEYS) return;
  let memory = (options.layouts ??= createLayoutMemory(null));
  if (memory.replaced) memory = options.layouts = replaceMemory(memory);
  if (memory.done) return;
  // Before the memory is given anything to forget: an exception, such as the RangeError
  // of a full stack, must not leave a result in a memory that is not listed
  listToForget(memory);

  const { fastWidths, fastKeys } = memory;
  for (let i = 0; i < fastWidths.length; i++) {
    if (fastWidths[i] !== width || fastKeys[i] !== lastKey) continue;
    // A memory kept across calls checks each layout once per call. Other keys: this
    // result starts the call's memory of its own
    if (
      memory.toForget !== null &&
      !memory.checked[i] &&
      !checkLayout(memory, i, result)
    ) {
      learnLayout(options, result, width, lastKey);
    }
    return;
  }

  const { seenWidths, seenKeys, seenResults } = memory;
  for (let i = 0; i < seenWidths.length; i++) {
    if (seenWidths[i] !== width || seenKeys[i] !== lastKey) continue;
    const seen = seenResults[i];
    if (seen === null) {
      // Seen in an earlier call, whose keys were not kept: compare the next one with this
      seenResults[i] = result;
      memory.seenAgain[i] = true;
    } else if (haveSameKeys(seen, result)) {
      addLayout(memory, result, width, lastKey);
    } else if (Array.isArray(seen)) {
      // The keys of a result of an earlier call: many shapes, and this result starts the
      // call's memory of its own
      memory.replaced = true;
      learnLayout(options, result, width, lastKey);
    } else {
      memory.done = true;
    }
    return;
  }
  seenWidths[memory.nextSeen] = width;
  seenKeys[memory.nextSeen] = lastKey;
  seenResults[memory.nextSeen] = result;
  memory.seenAgain[memory.nextSeen] = false;
  memory.nextSeen = (memory.nextSeen + 1) % LAYOUT_CANDIDATES;
}
