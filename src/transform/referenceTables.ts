import { REFERENCE_TABLE_LIMIT } from '../constants/referenceTables';

/**
 * The results of the objects transformed so far at one level, or in one `exclude` scope,
 * so that circular and shared references resolve to the same result.
 *
 * A Map rather than a WeakMap: a WeakMap makes a large transform about 1.7 times slower
 * (its entries are costly to add and to collect), and V8 aborts the process past about
 * 22 million WeakMap entries. The tables are dropped when the transform returns; until
 * then they keep the input alive, which matters only for values created during the call,
 * such as the results of getters. A Map holds at most 2^24 entries, so a full table is
 * kept, under `OLDER`, in the table that replaces it.
 */
export type ReferenceTable = Map<object, unknown>;

/** The key under which a full table is kept in the table that replaces it */
const OLDER = {};

/** Becomes `true` once any table has filled up; only then do lookups follow the chain */
let chained = false;

/**
 * The result recorded for `data`, in `table` or the full tables behind it
 *
 * @param table - The reference table of the level being transformed
 * @param data - The object, array, Map or Set being transformed
 * @returns Its result (always an object), or `undefined` when it has none yet
 * @internal This function is for internal use by the library
 */
export function findReference(table: ReferenceTable, data: object): unknown {
  const result = table.get(data);
  if (result !== undefined || !chained) return result;

  let older = table.get(OLDER) as ReferenceTable | undefined;
  while (older !== undefined) {
    const found = older.get(data);
    if (found !== undefined) return found;
    older = older.get(OLDER) as ReferenceTable | undefined;
  }
  return undefined;
}

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
export function recordReference(
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
