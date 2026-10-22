import { runInNewContext } from 'node:vm';
import getObjectTag from './getObjectTag';
import isMap from './isMap';

const check = (value: object) => isMap(value, getObjectTag(value));

describe('isMap', () => {
  it('should return true for Maps and Map subclasses', () => {
    class NamedMap extends Map {
      get [Symbol.toStringTag]() {
        return 'NamedMap';
      }
    }
    expect(check(new Map())).toBe(true);
    expect(check(new NamedMap())).toBe(true);
  });

  it('should return true for a Map from another realm', () => {
    expect(check(runInNewContext('new Map()'))).toBe(true);
  });

  it('should return false for objects that only pretend to be a Map', () => {
    expect(check({ [Symbol.toStringTag]: 'Map' })).toBe(false);
  });

  it('should return false for objects that only inherit from Map.prototype', () => {
    expect(check(new Proxy(new Map(), {}))).toBe(false);
    expect(check(Object.create(Map.prototype))).toBe(false);
  });

  it('should return false for other objects', () => {
    expect(check({})).toBe(false);
    expect(check(new Set())).toBe(false);
    expect(check(new WeakMap())).toBe(false);
    expect(check([])).toBe(false);
  });
});
