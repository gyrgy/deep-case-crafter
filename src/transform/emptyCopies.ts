import { LayoutMemory } from '../types/layoutTypes';
import emptyLayout from './emptyLayout';

/**
 * Empties the copies that a memory of one call still holds data in, those of layouts it
 * has met twice, when the call stops learning: `learnLayout` no longer looks their layouts
 * up, so their third result would not empty them. A number of another kind in a later
 * result of such a layout would then leave that result and every later one in dictionary
 * mode (see `addLayout`). At most `MAX_LAYOUTS` copies, once per call.
 *
 * @param memory - The memory of one call, which has just stopped learning
 * @internal This function is for internal use by the library
 */
export default function emptyCopies(memory: LayoutMemory): void {
  for (let i = 0; i < memory.fastWidths.length; i++) {
    if (!memory.checked[i]) {
      emptyLayout(
        memory.fastObjects[i] as Record<PropertyKey, unknown>,
        memory.fastWidths[i],
      );
      memory.checked[i] = true;
    }
  }
}
