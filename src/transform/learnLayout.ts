import {
  LAYOUT_CANDIDATES,
  LAYOUT_MAX_KEYS,
  MAX_LAYOUTS,
} from '../constants/fastObjects';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import haveSameKeys from '../utils/haveSameKeys';

/**
 * The layouts of the wide results of one call or, with `exclude`, of one set of matching
 * paths, whose options hold a memory of their own ("the call" below). Each layout is looked
 * up by its number of keys and its last key, which are cheap to track, and compared key by
 * key before it is learned.
 */
export interface LayoutMemory {
  /**
   * Whether the call has stopped learning: it has learned `MAX_LAYOUTS` layouts, or a
   * result had the number of keys and the last key of a layout seen once, but other keys,
   * as records that come in many shapes, with optional keys present or left out, have.
   * Such data reads faster when all of it stays in dictionary mode. A result with the
   * number of keys and the last key of a layout already learned is not compared: it stops
   * nothing, and stays in dictionary mode if its keys differ.
   */
  done: boolean;

  /** Layouts seen once, in a ring of `LAYOUT_CANDIDATES`: number of keys, last key, result */
  readonly seenWidths: number[];
  readonly seenKeys: string[];
  readonly seenResults: object[];
  nextSeen: number;

  /** Layouts learned in this call */
  readonly fastWidths: number[];
  readonly fastKeys: string[];

  /**
   * One fast object of each of those layouts, kept until the call returns: V8 drops the
   * hidden classes of a layout that no object uses any more.
   */
  readonly fastObjects: object[];
}

/**
 * Teaches V8 the layout of `result`, an object of at least `DICTIONARY_MODE_KEYS` keys,
 * when it is the second result of that layout in the call: a copy made with spread syntax
 * is a fast object, and the results built after it with the same keys in the same order
 * follow its hidden classes and stay fast. The first two stay in dictionary mode.
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
  const memory = (options.layouts ??= {
    done: false,
    seenWidths: [],
    seenKeys: [],
    seenResults: [],
    nextSeen: 0,
    fastWidths: [],
    fastKeys: [],
    fastObjects: [],
  });
  if (memory.done) return;

  const { fastWidths, fastKeys } = memory;
  for (let i = 0; i < fastWidths.length; i++) {
    if (fastWidths[i] === width && fastKeys[i] === lastKey) return;
  }

  const { seenWidths, seenKeys, seenResults } = memory;
  for (let i = 0; i < seenWidths.length; i++) {
    if (seenWidths[i] !== width || seenKeys[i] !== lastKey) continue;
    if (haveSameKeys(seenResults[i], result)) {
      fastWidths.push(width);
      fastKeys.push(lastKey);
      memory.fastObjects.push({ ...result });
      memory.done = fastWidths.length === MAX_LAYOUTS;
    } else {
      memory.done = true;
    }
    return;
  }
  seenWidths[memory.nextSeen] = width;
  seenKeys[memory.nextSeen] = lastKey;
  seenResults[memory.nextSeen] = result;
  memory.nextSeen = (memory.nextSeen + 1) % LAYOUT_CANDIDATES;
}
