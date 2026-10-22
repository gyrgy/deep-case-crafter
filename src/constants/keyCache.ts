/**
 * Maximum number of converted object keys in one generation of a target case's cache.
 * A cache holds two generations (see `transformKey`), so dynamic keys (ids, hashes)
 * cannot grow it without bound.
 */
export const KEY_CACHE_LIMIT = 1000;

/**
 * Keys longer than this are converted every time instead of being remembered, so a full
 * cache holds at most about 0.6 MiB per target case (typical keys: about 0.3 MiB).
 */
export const KEY_CACHE_MAX_KEY_LENGTH = 100;
