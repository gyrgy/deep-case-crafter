/**
 * The number of keys from which V8 stores an object built with computed keys
 * (`result[key] = value`), as `transform` builds its results, in dictionary mode: each
 * object then holds its own table of keys, which makes it several times larger, and slower
 * to read by property name, with `for...in` and with `Object.values`. V8 does this only
 * while no fast object with the same keys in the same order exists. Once one does, later
 * objects built with those keys follow its hidden classes and stay fast: `learnLayout`
 * makes one for the layouts that repeat in a call.
 */
export const DICTIONARY_MODE_KEYS = 20;

/**
 * The most keys of a layout that `learnLayout` makes fast. Wider objects are built faster
 * in dictionary mode than through their hidden classes: at 300 keys, conversion took 16%
 * longer that way, and 24–30% longer at 500 keys (Node 24, Apple M4 Pro).
 */
export const LAYOUT_MAX_KEYS = 200;

/**
 * How many layouts seen once `learnLayout` remembers, the oldest dropped first. A larger ring
 * learns layouts that come back after more others, but every result of a layout seen once,
 * such as an object keyed by IDs, scans all of it: with 64, such data converted 1–2% slower.
 */
export const LAYOUT_CANDIDATES = 16;

/**
 * The most layouts `learnLayout` makes fast in one call or, with `exclude`, for one set of
 * matching paths. A function made by `transformTo` counts the layouts it learns in all its
 * calls: once it has learned this many, the rest of the call learns on its own, and so do
 * its later calls.
 */
export const MAX_LAYOUTS = 16;

/**
 * What the copies that a function made by `transformTo` keeps of the layouts it learned
 * hold in every field (see `copyLayout`). Being an object, it leaves each field with a
 * representation that later values widen in place, if at all.
 */
export const NO_VALUE = {};

/**
 * How many checks of a layout (see `checkLayout`) a memory of a function made by
 * `transformTo` makes before it replaces the layout's copy with a new one. A copy that V8
 * has left out of its tree of transitions leaves the later results of the layout in
 * dictionary mode until it is replaced, for at most this many calls that convert them, if
 * V8 has room for the new one by then. The new copies made records of 200 keys converted
 * one per call take 0.4% longer (Node 24, Apple M4 Pro).
 */
export const RECOPY_CHECKS = 100;
