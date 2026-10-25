import { SET_TAG } from '../constants/objectTag';

/**
 * Checks whether a value is a `Set`, including one created in another realm (a `vm`
 * context or an iframe), which fails `instanceof Set`.
 *
 * A candidate (an `instanceof Set` match, or a value tagged `[object Set]`) is confirmed
 * through its internal slot, so neither an object that only pretends to be a Set (via
 * `Symbol.toStringTag`) nor one that only inherits from `Set.prototype` (a Proxy around
 * a Set, `Object.create(Set.prototype)`) is accepted: their members cannot be read.
 *
 * @param value - The object to check
 * @param tag - Its `Object.prototype.toString` tag (see `getObjectTag`)
 * @returns `true` if the value is a Set
 *
 * @example
 * ```typescript
 * isSet(new Set(), '[object Set]') // => true
 * isSet({ [Symbol.toStringTag]: 'Set' }, '[object Set]') // => false
 * ```
 * @internal This function is for internal use by the library
 */
export default function isSet(
  value: object,
  tag: string,
): value is ReadonlySet<unknown> {
  if (!(value instanceof Set) && tag !== SET_TAG) return false;

  try {
    // Throws unless the value has a Set's internal slot
    Set.prototype.has.call(value, undefined);
    return true;
  } catch {
    return false;
  }
}
