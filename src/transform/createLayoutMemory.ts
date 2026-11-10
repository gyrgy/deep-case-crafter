import { LayoutMemory } from '../types/layoutTypes';

/**
 * Creates an empty layout memory (see `learnLayout`)
 *
 * @param toForget - For a memory kept across calls, the list of its `LayoutStore`'s
 * memories that a call has used; `null` for a memory of one call
 * @returns The memory
 * @internal This function is for internal use by the library
 */
export default function createLayoutMemory(
  toForget: LayoutMemory[] | null,
): LayoutMemory {
  return {
    done: false,
    replaced: false,
    seenWidths: [],
    seenKeys: [],
    seenResults: [],
    nextSeen: 0,
    seenAgain: [],
    fastWidths: [],
    fastKeys: [],
    fastObjects: [],
    fastKeyLists: [],
    checked: [],
    checks: [],
    toForget,
    listed: false,
  };
}
