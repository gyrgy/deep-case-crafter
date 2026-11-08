import { OLDER } from '../constants/referenceTables';
import { ReferenceTable } from '../types/referenceTableTypes';
import { chained } from './recordReference';

/**
 * The result recorded for `data`, in `table` or the full tables behind it
 *
 * @param table - The reference table of the level being transformed
 * @param data - The object, array, Map or Set being transformed
 * @returns Its result (always an object), or `undefined` when it has none yet
 * @internal This function is for internal use by the library
 */
export default function findReference(
  table: ReferenceTable,
  data: object,
): unknown {
  const result = table.get(data);
  // `chained` is an imported binding: it follows the value `recordReference` sets
  if (result !== undefined || !chained) return result;

  let older = table.get(OLDER) as ReferenceTable | undefined;
  while (older !== undefined) {
    const found = older.get(data);
    if (found !== undefined) return found;
    older = older.get(OLDER) as ReferenceTable | undefined;
  }
  return undefined;
}
