import { OLDER, REFERENCE_TABLE_LIMIT } from '../constants/referenceTables';
import { ReferenceTable } from '../types/referenceTableTypes';

/**
 * Becomes `true` once any table has filled up; only then do lookups (`findReference`)
 * follow the chain
 */
export let chained = false;

/**
 * Records the result of `data` in the reference table of `level`, starting a new table
 * when it is full
 *
 * @param tables - The reference tables, by level; the table of `level` exists
 * @param level - The level being transformed
 * @param data - The object, array, Map or Set being transformed
 * @param result - Its (still empty) result
 * @internal This function is for internal use by the library
 */
export default function recordReference(
  tables: ReferenceTable[],
  level: number,
  data: object,
  result: unknown,
): void {
  let table = tables[level];
  if (table.size >= REFERENCE_TABLE_LIMIT) {
    chained = true;
    table = tables[level] = new Map([[OLDER, table]]);
  }
  table.set(data, result);
}
