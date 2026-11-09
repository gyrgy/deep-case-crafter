/**
 * Maximum number of objects in one reference table, below V8's limit of
 * 2^24 = 16,777,216 entries per Map. A full table is chained behind a new one (see
 * `recordReference`).
 */
export const REFERENCE_TABLE_LIMIT = 16_000_000;

/** The key under which a full reference table is kept in the table that replaces it */
export const OLDER = {};

/**
 * With `keepReferences: false`, the nesting at which a transform stops and starts over
 * with reference tables: circular references would otherwise nest without end. It counts
 * every object, array, Map and Set on the way down.
 */
export const UNTRACKED_NESTING_LIMIT = 256;

/**
 * Thrown with `keepReferences: false` when the data nests `UNTRACKED_NESTING_LIMIT` levels
 * deep, which circular references always do unless `depth` stops them first: `transform`
 * then starts over with reference tables.
 *
 * @internal This value is for internal use by the library
 */
export const NESTING_LIMIT_REACHED = { reason: 'nesting limit reached' };
