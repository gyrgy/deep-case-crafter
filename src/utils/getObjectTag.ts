import { OBJECT_TAG } from '../constants/objectTag';

/**
 * Reads the `Object.prototype.toString` tag of an object (`[object Object]`,
 * `[object Date]`, `[object Map]`, ...), once per object, for `internalTransform` to
 * dispatch on.
 *
 * Reading it runs a `Symbol.toStringTag` getter or a Proxy trap. If that throws, the
 * object is treated as an ordinary key/value object, which is how it was transformed
 * before tags were read.
 *
 * @param value - The object to read the tag of
 * @returns The tag, or `[object Object]` if it cannot be read
 *
 * @example
 * ```typescript
 * getObjectTag({ user_id: 1 }) // => '[object Object]'
 * getObjectTag(new Date()) // => '[object Date]'
 * ```
 * @internal This function is for internal use by the library
 */
export default function getObjectTag(value: object): string {
  try {
    return Object.prototype.toString.call(value);
  } catch {
    return OBJECT_TAG;
  }
}
