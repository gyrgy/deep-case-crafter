/**
 * Maximum number of objects in one reference table, below V8's limit of
 * 2^24 = 16,777,216 entries per Map. A full table is chained behind a new one (see
 * `transform/referenceTables`).
 */
export const REFERENCE_TABLE_LIMIT = 16_000_000;

/**
 * With `keepReferences: false`, the nesting at which a transform stops and starts over
 * with reference tables: circular references would otherwise nest without end. It counts
 * every object, array, Map and Set on the way down.
 */
export const UNTRACKED_NESTING_LIMIT = 256;
