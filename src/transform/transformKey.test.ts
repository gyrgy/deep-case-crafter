import { PARITY_KEYS } from '../__test-utils__/keyCorpus';
import { STRING_CASES } from '../constants/stringCases';
import transform from './transform';
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
  it('should transform a key to camelCase by default', () => {
    expect(transformKey('user_id')).toBe('userId');
    expect(transformKey('user_id', undefined)).toBe('userId');
    expect(transformKey('user_id', {})).toBe('userId');
    expect(transformKey('user_id', { targetCase: undefined })).toBe('userId');
  });

  it('should transform a key to the target case', () => {
    expect(transformKey('userID', { targetCase: 'snake' })).toBe('user_id');
    expect(transformKey('HTTPServer', { targetCase: 'kebab' })).toBe(
      'http-server',
    );
    expect(transformKey('api-key', { targetCase: 'pascal' })).toBe('ApiKey');
    expect(transformKey('UserId', { targetCase: 'camel' })).toBe('userId');
    expect(transformKey('hello', { targetCase: 'pascal' })).toBe('Hello');
    expect(transformKey('userID', { targetCase: 'constant' })).toBe('USER_ID');
  });

  it('should return a string that is not a camelCase, PascalCase, snake_case or kebab-case key unchanged', () => {
    const unchanged = [
      '',
      'Hello World',
      'USER_ID',
      '_id',
      'user-id_x',
      'größe',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ];
    for (const str of unchanged) {
      expect(transformKey(str, { targetCase: 'snake' })).toBe(str);
      expect(transformKey(str, { targetCase: 'camel' })).toBe(str);
      expect(transformKey(str, { targetCase: 'constant' })).toBe(str);
    }
  });

  it('should transform every key exactly as transform transforms it', () => {
    const mismatches = STRING_CASES.flatMap((targetCase) =>
      PARITY_KEYS.map((key) => ({
        key,
        targetCase,
        transformKey: transformKey(key, { targetCase }),
        transform: Object.keys(transform({ [key]: 0 }, { targetCase }))[0],
      })),
    ).filter((result) => result.transformKey !== result.transform);

    expect(PARITY_KEYS.length * STRING_CASES.length).toBeGreaterThan(8000);
    expect(mismatches).toEqual([]);
  });

  it('should convert the key on every call, without the object key cache', () => {
    // Any string can be passed, such as a slice of a much larger string, which a cache
    // entry would keep alive
    transformCaseMock.mockClear();
    expect(transformKey('repeated_key', { targetCase: 'pascal' })).toBe(
      'RepeatedKey',
    );
    expect(transformKey('repeated_key', { targetCase: 'pascal' })).toBe(
      'RepeatedKey',
    );
    expect(transformCaseMock).toHaveBeenCalledTimes(2);
  });

  it('should transform keys passed through a callback', () => {
    expect(
      ['user_id', 'createdAt'].map((key) =>
        transformKey(key, { targetCase: 'kebab' }),
      ),
    ).toEqual(['user-id', 'created-at']);
  });

  it('should reject a key that is not a string', () => {
    expect(() => transformKey(42 as unknown as string)).toThrow(
      new TypeError('Unsupported key 42. Use a string.'),
    );
    expect(() => transformKey(undefined as unknown as string)).toThrow(
      new TypeError('Unsupported key undefined. Use a string.'),
    );
    expect(() => transformKey({} as unknown as string)).toThrow(TypeError);
  });

  it('should reject the target case passed in place of the options', () => {
    expect(() => transformKey('user_id', 'snake' as never)).toThrow(
      new TypeError(
        'Unsupported options "snake". Use an options object: { targetCase: "snake" }.',
      ),
    );
  });

  it('should ignore other values passed in place of the options, as transform does', () => {
    // `keys.map(transformKey)` passes each key's index as the options
    expect(['user_id', 'first_name'].map(transformKey)).toEqual([
      'userId',
      'firstName',
    ]);
    expect(transformKey('user_id', null as never)).toBe('userId');
  });

  it('should reject an unsupported target case', () => {
    expect(() =>
      transformKey('user_id', { targetCase: 'SNAKE' as 'snake' }),
    ).toThrow(
      new TypeError(
        'Unsupported targetCase "SNAKE". Use one of: camel, snake, pascal, kebab, constant.',
      ),
    );
  });
});
