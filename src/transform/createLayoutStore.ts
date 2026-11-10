import { LayoutMemory, LayoutStore } from '../types/layoutTypes';
import createLayoutMemory from './createLayoutMemory';

/**
 * Creates the layout memories of a function made by `transformTo`, which it keeps across
 * its calls
 *
 * @returns The memories, with none yet for `exclude` paths
 * @internal This function is for internal use by the library
 */
export default function createLayoutStore(): LayoutStore {
  const toForget: LayoutMemory[] = [];
  return { plain: createLayoutMemory(toForget), byPaths: new Map(), toForget };
}
