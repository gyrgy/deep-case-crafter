import {
  KEY_CACHE_LIMIT,
  KEY_CACHE_MAX_KEY_LENGTH,
  KEY_CACHE_MISS_STREAK,
  KEY_CACHE_SAMPLE_INTERVAL,
} from '../constants/keyCache';
import { StringCase } from '../types/stringCaseTypes';
import transformCase from './transformCase';

/** The keys remembered for one target case, in two generations */
interface KeyCache {
  current: Map<string, string>;
  previous: Map<string, string>;
}

// A key's result depends only on the key and the target case, so it is safe to reuse.
const caches = new Map<StringCase, KeyCache>();

// The cache of the last target case, which is almost always the next one as well
let lastCase: StringCase | undefined;
let lastCache: KeyCache = { current: new Map(), previous: new Map() };

/** Unknown keys in a row */
let missStreak = 0;

/**
 * Transforms an object key to the target case, remembering the result.
 *
 * Detecting a key's case is the expensive part of a transform, and the same keys repeat
 * across the items of an array, so keys are converted once per target case and
 * remembered in two generations of at most `KEY_CACHE_LIMIT` keys. When the current
 * generation is full it becomes the previous one, and the old previous one is dropped. A
 * key found in the previous generation moves into the current one, so keys that keep
 * being used stay remembered, while the keys of a one-off object with many distinct keys
 * (ids, hashes) age out. Keys longer than `KEY_CACHE_MAX_KEY_LENGTH` are not remembered,
 * which together bounds the cache's memory.
 *
 * A run of keys the cache does not know would cost an insert per key for nothing, and
 * push the keys in use out of the cache. So after `KEY_CACHE_MISS_STREAK` of them in a
 * row, only one unknown key in `KEY_CACHE_SAMPLE_INTERVAL` is remembered, until a known
 * key ends the run. Every key is still looked up, and a key that does repeat is soon
 * remembered.
 *
 * Only object keys are cached: `for...in` yields them as V8's internalized strings. A Map
 * key can be a slice of a much larger string (from `split()`, say), which a cache entry
 * would keep alive, so Map keys are converted with `transformCase` directly.
 *
 * @param key - The key to transform
 * @param targetCase - The target case format
 * @returns The transformed key
 *
 * @example
 * ```typescript
 * transformObjectKey('user_id', 'camel') // => 'userId'
 * ```
 * @internal This function is for internal use by the library
 */
export default function transformObjectKey(
  key: string,
  targetCase: StringCase,
): string {
  if (key.length > KEY_CACHE_MAX_KEY_LENGTH) {
    return transformCase(key, targetCase);
  }
  if (targetCase !== lastCase) {
    let cache = caches.get(targetCase);
    if (!cache) {
      cache = { current: new Map(), previous: new Map() };
      caches.set(targetCase, cache);
    }
    lastCase = targetCase;
    lastCache = cache;
  }
  const cache = lastCache;

  let transformed = cache.current.get(key);
  if (transformed !== undefined) {
    missStreak = 0;
    return transformed;
  }

  transformed = cache.previous.get(key);
  if (transformed === undefined) {
    transformed = transformCase(key, targetCase);
    if (
      ++missStreak > KEY_CACHE_MISS_STREAK &&
      missStreak % KEY_CACHE_SAMPLE_INTERVAL !== 0
    ) {
      return transformed;
    }
  } else {
    missStreak = 0;
  }
  if (cache.current.size >= KEY_CACHE_LIMIT) {
    cache.previous = cache.current;
    cache.current = new Map();
  }
  cache.current.set(key, transformed);
  return transformed;
}
