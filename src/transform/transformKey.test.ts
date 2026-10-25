import {
  KEY_CACHE_LIMIT,
  KEY_CACHE_MAX_KEY_LENGTH,
} from '../constants/keyCache';
import transformCase from './transformCase';
import transformKey from './transformKey';

jest.mock('./transformCase', () => {
  const actual = jest.requireActual('./transformCase');
  return { __esModule: true, default: jest.fn(actual.default) };
});

const transformCaseMock = transformCase as jest.MockedFunction<
  typeof transformCase
>;

describe('transformKey', () => {
  beforeEach(() => {
    transformCaseMock.mockClear();
  });

  // Each test uses its own target cases, so the module-level caches cannot leak between tests.
  it('should return the same result as transformCase', () => {
    expect(transformKey('user_id', 'camel')).toBe('userId');
    expect(transformKey('UserId', 'camel')).toBe('userId');
    expect(transformKey('_private', 'camel')).toBe('_private');
  });

  it('should convert a repeated key only once per target case', () => {
    expect(transformKey('repeated_key', 'pascal')).toBe('RepeatedKey');
    expect(transformKey('repeated_key', 'pascal')).toBe('RepeatedKey');
    expect(transformCaseMock).toHaveBeenCalledTimes(1);

    expect(transformKey('repeated_key', 'kebab')).toBe('repeated-key');
    expect(transformCaseMock).toHaveBeenCalledTimes(2);
  });

  it('should not remember keys longer than KEY_CACHE_MAX_KEY_LENGTH', () => {
    const longKey = `long_${'x'.repeat(KEY_CACHE_MAX_KEY_LENGTH)}`;
    expect(transformKey(longKey, 'camel')).toBe(
      `long${'X'}${'x'.repeat(KEY_CACHE_MAX_KEY_LENGTH - 1)}`,
    );
    transformKey(longKey, 'camel');
    expect(transformCaseMock).toHaveBeenCalledTimes(2);

    const longestRemembered = 'a'.repeat(KEY_CACHE_MAX_KEY_LENGTH);
    transformKey(longestRemembered, 'camel');
    transformKey(longestRemembered, 'camel');
    expect(transformCaseMock).toHaveBeenCalledTimes(3);
  });

  it('should keep the keys in use and drop the others as generations fill up', () => {
    const fill = (prefix: string) => {
      for (let i = 0; i < KEY_CACHE_LIMIT; i++) {
        transformKey(`${prefix}_key_${i}`, 'snake');
      }
    };

    fill('first');
    transformKey('first_key_0', 'snake');
    expect(transformCaseMock).toHaveBeenCalledTimes(KEY_CACHE_LIMIT);

    // A full generation becomes the previous one; a key found there is kept
    expect(transformKey('nextKey', 'snake')).toBe('next_key');
    expect(transformKey('first_key_0', 'snake')).toBe('first_key_0');
    expect(transformCaseMock).toHaveBeenCalledTimes(KEY_CACHE_LIMIT + 1);

    // After another generation, the kept key is still remembered, the unused ones are not
    fill('second');
    expect(transformCaseMock).toHaveBeenCalledTimes(2 * KEY_CACHE_LIMIT + 1);
    expect(transformKey('first_key_0', 'snake')).toBe('first_key_0');
    expect(transformCaseMock).toHaveBeenCalledTimes(2 * KEY_CACHE_LIMIT + 1);
    expect(transformKey('first_key_1', 'snake')).toBe('first_key_1');
    expect(transformCaseMock).toHaveBeenCalledTimes(2 * KEY_CACHE_LIMIT + 2);
  });
});
