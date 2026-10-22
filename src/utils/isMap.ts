import { MAP_TAG } from '../constants/objectTag';

/**
 * Checks whether a value is a `Map`, including one created in another realm (a `vm`
 * context or an iframe), which fails `instanceof Map`.
 *
 * A candidate (an `instanceof Map` match, or a value tagged `[object Map]`) is confirmed
 * through its internal slot, so neither an object that only pretends to be a Map (via
 * `Symbol.toStringTag`) nor one that only inherits from `Map.prototype` (a Proxy around
 * a Map, `Object.create(Map.prototype)`) is accepted: their entries cannot be read.
 *
 * @param value - The object to check
 * @param tag - Its `Object.prototype.toString` tag (see `getObjectTag`)
 * @returns `true` if the value is a Map
 *
 * @example
 * ```typescript
 * isMap(new Map(), '[object Map]') // => true
 * isMap({ [Symbol.toStringTag]: 'Map' }, '[object Map]') // => false
 * ```
 * @internal This function is for internal use by the library
 */
export default function isMap(
  value: object,
  tag: string,
): value is ReadonlyMap<unknown, unknown> {
  if (!(value instanceof Map) && tag !== MAP_TAG) return false;

  try {
    // Throws unless the value has a Map's internal slot
    Map.prototype.has.call(value, undefined);
    return true;
  } catch {
    return false;
  }
}
