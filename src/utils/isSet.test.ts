import { runInNewContext } from 'node:vm';
import getObjectTag from './getObjectTag';
import isSet from './isSet';

const check = (value: object) => isSet(value, getObjectTag(value));

describe('isSet', () => {
  it('should return true for Sets and Set subclasses', () => {
    class NamedSet extends Set {
      get [Symbol.toStringTag]() {
        return 'NamedSet';
      }
    }
    expect(check(new Set())).toBe(true);
    expect(check(new NamedSet())).toBe(true);
  });

  it('should return true for a Set from another realm', () => {
    expect(check(runInNewContext('new Set()'))).toBe(true);
  });

  it('should return false for objects that only pretend to be a Set', () => {
    expect(check({ [Symbol.toStringTag]: 'Set' })).toBe(false);
  });

  it('should return false for objects that only inherit from Set.prototype', () => {
    expect(check(new Proxy(new Set(), {}))).toBe(false);
    expect(check(Object.create(Set.prototype))).toBe(false);
  });

  it('should return false for other objects', () => {
    expect(check({})).toBe(false);
    expect(check(new Map())).toBe(false);
    expect(check(new WeakSet())).toBe(false);
    expect(check([])).toBe(false);
  });
});
