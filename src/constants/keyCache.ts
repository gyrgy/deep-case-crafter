/**
 * Maximum number of converted object keys in one generation of a target case's cache.
 * A cache holds two generations (see `transformObjectKey`), so dynamic keys (ids,
 * hashes) cannot grow it without bound.
 */
export const KEY_CACHE_LIMIT = 1000;

/**
 * Keys longer than this are converted every time instead of being remembered, so a full
 * cache holds at most about 0.6 MiB per target case (typical keys: about 0.3 MiB).
 */
export const KEY_CACHE_MAX_KEY_LENGTH = 100;

/**
 * After this many object keys in a row that the cache did not know, only one unknown key
 * in `KEY_CACHE_SAMPLE_INTERVAL` is remembered until a known key comes: a run of one-off
 * keys, such as the IDs of a large record, would otherwise fill the cache with keys that
 * are never seen again.
 */
export const KEY_CACHE_MISS_STREAK = 256;

/** During a run of unknown keys, one in this many is remembered */
export const KEY_CACHE_SAMPLE_INTERVAL = 8;
