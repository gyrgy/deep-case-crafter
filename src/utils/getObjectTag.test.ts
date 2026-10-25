import { runInNewContext } from 'node:vm';
import getObjectTag from './getObjectTag';

describe('getObjectTag', () => {
  it('should return [object Object] for ordinary key/value objects', () => {
    class User {
      user_id = 1;
    }
    expect(getObjectTag({ user_id: 1 })).toBe('[object Object]');
    expect(getObjectTag(Object.create(null))).toBe('[object Object]');
    expect(getObjectTag(new User())).toBe('[object Object]');
    expect(getObjectTag(runInNewContext('({ user_id: 1 })'))).toBe(
      '[object Object]',
    );
  });

  it('should return the own tag of built-ins that keep their state in internal slots', () => {
    expect(getObjectTag(new Date())).toBe('[object Date]');
    expect(getObjectTag(/ab+c/i)).toBe('[object RegExp]');
    expect(getObjectTag(new Error('boom'))).toBe('[object Error]');
    expect(getObjectTag(new URL('https://example.com'))).toBe('[object URL]');
    expect(getObjectTag(new Uint8Array([1, 2]))).toBe('[object Uint8Array]');
    expect(getObjectTag(Promise.resolve())).toBe('[object Promise]');
    expect(getObjectTag(new Number(1))).toBe('[object Number]');
    expect(getObjectTag(new Map())).toBe('[object Map]');
  });

  it('should return the tag an object declares with Symbol.toStringTag', () => {
    expect(getObjectTag({ [Symbol.toStringTag]: 'Money' })).toBe(
      '[object Money]',
    );
  });

  it('should return [object Object] when reading the tag throws', () => {
    const strict = new Proxy(
      { user_id: 1 },
      {
        get(target, key) {
          if (!(key in target)) throw new Error(`Unknown key ${String(key)}`);
          return target[key as keyof typeof target];
        },
      },
    );
    expect(getObjectTag(strict)).toBe('[object Object]');
  });
});
