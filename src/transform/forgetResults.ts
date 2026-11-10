import { LayoutMemory } from '../types/layoutTypes';

/**
 * Ends a call of a function made by `transformTo`, for the memories it kept across calls
 * that the call used: they must not keep its data alive. The copies they keep of their
 * layouts hold none (see `copyLayout`); the results they hold are dropped here.
 *
 * A result seen once is replaced by its keys, symbols included, which is all a later
 * result is compared with, when its layout came up in an earlier call too, and by `null`
 * otherwise: the layouts of objects keyed by IDs come up once, and their keys are not
 * worth copying.
 *
 * @param toForget - The memories, emptied here
 * @returns Whether the function has stopped using one of them: one of them has learned
 * `MAX_LAYOUTS` layouts, or its data comes in many shapes. The function then gives its
 * later calls memories of their own, as `transform` does, and keeps the copies it has,
 * which keep their layouts fast.
 * @internal This function is for internal use by the library
 */
export default function forgetResults(toForget: LayoutMemory[]): boolean {
  let stopped = false;
  for (const memory of toForget) {
    const { seenResults, seenAgain } = memory;
    for (let i = 0; i < seenResults.length; i++) {
      const seen = seenResults[i];
      if (seen === null || Array.isArray(seen)) continue;
      seenResults[i] = seenAgain[i] ? Reflect.ownKeys(seen) : null;
      seenAgain[i] = false;
    }
    memory.checked.fill(false);
    memory.listed = false;
    if (memory.done || memory.replaced) stopped = true;
  }
  toForget.length = 0;
  return stopped;
}
