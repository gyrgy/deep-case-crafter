import { LayoutMemory, LayoutStore } from '../types/layoutTypes';
import createLayoutMemory from './createLayoutMemory';

/**
 * The layout memory of `store` for the values that the `exclude` paths `paths` reach,
 * created when they are first reached
 *
 * @param store - The memories of a function made by `transformTo`
 * @param paths - The paths, sorted and without repeats, as the exclude state has them
 * @returns The memory
 * @internal This function is for internal use by the library
 */
export default function memoryFor(
  store: LayoutStore,
  paths: readonly string[],
): LayoutMemory {
  const id = JSON.stringify(paths);
  let memory = store.byPaths.get(id);
  if (!memory) {
    memory = createLayoutMemory(store.toForget);
    store.byPaths.set(id, memory);
  }
  return memory;
}
