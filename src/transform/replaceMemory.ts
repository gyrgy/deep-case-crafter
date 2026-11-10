import { LAYOUT_CANDIDATES } from '../constants/fastObjects';
import { LayoutMemory } from '../types/layoutTypes';
import createLayoutMemory from './createLayoutMemory';

/**
 * Creates the memory that takes over for the rest of a call from a memory kept across
 * calls that the function has stopped using (see `replaced`). It starts with the results
 * of the call that the kept memory has seen once, oldest first, so that their layouts are
 * learned from their second result in the call, as a call to `transform` learns them.
 * The kept memory's other entries, `null` or keys, come from earlier calls.
 *
 * @param kept - The memory kept across calls
 * @returns A memory of the call
 * @internal This function is for internal use by the library
 */
export default function replaceMemory(kept: LayoutMemory): LayoutMemory {
  const memory = createLayoutMemory(null);
  const { seenWidths, seenKeys, seenResults } = kept;
  const count = seenResults.length;
  for (let n = 0; n < count; n++) {
    // The oldest entry is at `nextSeen` once the ring is full, and at 0 before
    const i = (kept.nextSeen + n) % count;
    const seen = seenResults[i];
    if (seen === null || Array.isArray(seen)) continue;
    memory.seenWidths.push(seenWidths[i]);
    memory.seenKeys.push(seenKeys[i]);
    memory.seenResults.push(seen);
    memory.seenAgain.push(false);
  }
  memory.nextSeen = memory.seenWidths.length % LAYOUT_CANDIDATES;
  return memory;
}
