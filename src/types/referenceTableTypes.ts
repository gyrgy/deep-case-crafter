/**
 * The results of the objects transformed so far at one level, or in one `exclude` scope,
 * so that circular and shared references resolve to the same result.
 *
 * A Map rather than a WeakMap: a WeakMap makes a large transform about 1.7 times slower
 * (its entries are costly to add and to collect), and V8 aborts the process past about
 * 22 million WeakMap entries. The tables are dropped when the transform returns; until
 * then they keep the input alive, which matters only for values created during the call,
 * such as the results of getters. A Map holds at most 2^24 entries, so a full table is
 * kept, under `OLDER`, in the table that replaces it (see `recordReference`).
 */
export type ReferenceTable = Map<object, unknown>;
