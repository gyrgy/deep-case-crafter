import * as keyCache from '../constants/keyCache';
import type transformCaseFunction from './transformCase';
import type transformObjectKeyFunction from './transformObjectKey';

const { KEY_CACHE_LIMIT, KEY_CACHE_MAX_KEY_LENGTH } = keyCache;

jest.mock('./transformCase', () => {
  const actual = jest.requireActual('./transformCase');
  return { __esModule: true, default: jest.fn(actual.default) };
});

interface Loaded {
  transformObjectKey: typeof transformObjectKeyFunction;
  transformCaseMock: jest.MockedFunction<typeof transformCaseFunction>;
}

/**
 * A fresh copy of transformObjectKey (empty caches, no run of unknown keys) with the given
 * cache constants, and the transformCase mock it calls
 */
function load(
  constants: Partial<Record<keyof typeof keyCache, number>> = {},
): Loaded {
  let loaded: Loaded | undefined;
  jest.isolateModules(() => {
    jest.doMock('../constants/keyCache', () => ({
      ...jest.requireActual('../constants/keyCache'),
      ...constants,
    }));
    loaded = {
      transformObjectKey: jest.requireActual<{
        default: typeof transformObjectKeyFunction;
      }>('./transformObjectKey').default,
      transformCaseMock: jest.requireMock<{
        default: jest.MockedFunction<typeof transformCaseFunction>;
      }>('./transformCase').default,
    };
  });
  return loaded as Loaded;
}

describe('transformObjectKey', () => {
  it('should return the same result as transformCase', () => {
    const { transformObjectKey } = load();
    expect(transformObjectKey('user_id', 'camel')).toBe('userId');
    expect(transformObjectKey('UserId', 'camel')).toBe('userId');
    expect(transformObjectKey('_private', 'camel')).toBe('_private');
  });

  it('should convert a repeated key only once per target case', () => {
    const { transformObjectKey, transformCaseMock } = load();
    expect(transformObjectKey('repeated_key', 'pascal')).toBe('RepeatedKey');
    expect(transformObjectKey('repeated_key', 'pascal')).toBe('RepeatedKey');
    expect(transformCaseMock).toHaveBeenCalledTimes(1);

    expect(transformObjectKey('repeated_key', 'kebab')).toBe('repeated-key');
    expect(transformCaseMock).toHaveBeenCalledTimes(2);

    // Back to a target case used before: its cache is still there
    expect(transformObjectKey('repeated_key', 'pascal')).toBe('RepeatedKey');
    expect(transformCaseMock).toHaveBeenCalledTimes(2);
  });

  it('should not remember keys longer than KEY_CACHE_MAX_KEY_LENGTH', () => {
    const { transformObjectKey, transformCaseMock } = load();
    const longKey = `long_${'x'.repeat(KEY_CACHE_MAX_KEY_LENGTH)}`;
    expect(transformObjectKey(longKey, 'camel')).toBe(
      `long${'X'}${'x'.repeat(KEY_CACHE_MAX_KEY_LENGTH - 1)}`,
    );
    transformObjectKey(longKey, 'camel');
    expect(transformCaseMock).toHaveBeenCalledTimes(2);

    const longestRemembered = 'a'.repeat(KEY_CACHE_MAX_KEY_LENGTH);
    transformObjectKey(longestRemembered, 'camel');
    transformObjectKey(longestRemembered, 'camel');
    expect(transformCaseMock).toHaveBeenCalledTimes(3);
  });

  it('should keep the keys in use and drop the others as generations fill up', () => {
    // Without the bypass, which a generation's worth of new keys in a row would start
    const { transformObjectKey, transformCaseMock } = load({
      KEY_CACHE_MISS_STREAK: Infinity,
    });
    const fill = (prefix: string) => {
      for (let i = 0; i < KEY_CACHE_LIMIT; i++) {
        transformObjectKey(`${prefix}_key_${i}`, 'snake');
      }
    };

    fill('first');
    transformObjectKey('first_key_0', 'snake');
    expect(transformCaseMock).toHaveBeenCalledTimes(KEY_CACHE_LIMIT);

    // A full generation becomes the previous one; a key found there is kept
    expect(transformObjectKey('nextKey', 'snake')).toBe('next_key');
    expect(transformObjectKey('first_key_0', 'snake')).toBe('first_key_0');
    expect(transformCaseMock).toHaveBeenCalledTimes(KEY_CACHE_LIMIT + 1);

    // After another generation, the kept key is still remembered, the unused ones are not
    fill('second');
    expect(transformCaseMock).toHaveBeenCalledTimes(2 * KEY_CACHE_LIMIT + 1);
    expect(transformObjectKey('first_key_0', 'snake')).toBe('first_key_0');
    expect(transformCaseMock).toHaveBeenCalledTimes(2 * KEY_CACHE_LIMIT + 1);
    expect(transformObjectKey('first_key_1', 'snake')).toBe('first_key_1');
    expect(transformCaseMock).toHaveBeenCalledTimes(2 * KEY_CACHE_LIMIT + 2);
  });

  it('should remember only some keys during a long run of unknown keys', () => {
    const { transformObjectKey, transformCaseMock } = load({
      KEY_CACHE_MISS_STREAK: 3,
      KEY_CACHE_SAMPLE_INTERVAL: 2,
    });
    // The first 3 unknown keys are remembered; after them, only every second one
    for (const key of ['a_key', 'b_key', 'c_key', 'd_key', 'e_key', 'f_key']) {
      transformObjectKey(key, 'camel');
    }
    expect(transformCaseMock).toHaveBeenCalledTimes(6);

    // d_key and f_key (4th and 6th in the run) were remembered, e_key was not
    expect(transformObjectKey('e_key', 'camel')).toBe('eKey');
    expect(transformCaseMock).toHaveBeenCalledTimes(7);
    expect(transformObjectKey('d_key', 'camel')).toBe('dKey');
    expect(transformObjectKey('f_key', 'camel')).toBe('fKey');
    expect(transformCaseMock).toHaveBeenCalledTimes(7);
  });

  it('should keep finding known keys during a run of unknown keys', () => {
    const { transformObjectKey, transformCaseMock } = load({
      KEY_CACHE_MISS_STREAK: 2,
      KEY_CACHE_SAMPLE_INTERVAL: 1000,
    });
    transformObjectKey('known_key', 'camel');
    for (const key of ['u_1', 'u_2', 'u_3', 'u_4']) {
      transformObjectKey(key, 'camel');
    }
    expect(transformCaseMock).toHaveBeenCalledTimes(5);

    // The known key is found, and ends the run: the next unknown keys are remembered
    expect(transformObjectKey('known_key', 'camel')).toBe('knownKey');
    transformObjectKey('new_key', 'camel');
    transformObjectKey('new_key', 'camel');
    expect(transformCaseMock).toHaveBeenCalledTimes(6);
  });

  it('should start a new run of unknown keys after a known key', () => {
    const { transformObjectKey, transformCaseMock } = load({
      KEY_CACHE_LIMIT: 2,
      KEY_CACHE_MISS_STREAK: 4,
    });
    // a and b fill the first generation, c starts the next: a is in the previous one
    transformObjectKey('a_key', 'camel');
    transformObjectKey('b_key', 'camel');
    transformObjectKey('c_key', 'camel');
    // Known keys, from the previous and the current generation, end the run
    transformObjectKey('a_key', 'camel');
    transformObjectKey('d_key', 'camel');
    transformObjectKey('a_key', 'camel');
    transformObjectKey('e_key', 'camel');
    transformObjectKey('f_key', 'camel');
    transformObjectKey('g_key', 'camel');
    expect(transformCaseMock).toHaveBeenCalledTimes(7);

    // The known keys ended the run, so e, f and g are a run of only 3: g is remembered
    transformObjectKey('g_key', 'camel');
    expect(transformCaseMock).toHaveBeenCalledTimes(7);
  });
});
