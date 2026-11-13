/**
 * Stores `value` under `key` on `target`, a result being built, as a property of its
 * own.
 *
 * A plain `target[key] = value` does that for every key but those that
 * `Object.prototype` has in a way that stops it. For `__proto__` it calls the setter of
 * `Object.prototype`, which drops the key (and can change the object's prototype). And
 * for a key that `Object.prototype` has as a property that cannot be written, as every
 * one of its keys once it is frozen (`toString`, which `to_string` converts to,
 * `valueOf`, `constructor`), it throws. `Object.defineProperty` stores those as normal,
 * enumerable data, so no key is lost and the prototype is never touched.
 *
 * @internal This function is for internal use by the library
 */
export default function setKey(
  target: Record<string | number | symbol, unknown>,
  key: string | number | symbol,
  value: unknown,
): void {
  if (key !== '__proto__') {
    try {
      target[key] = value;
      return;
    } catch {
      // `Object.prototype` has the key and it cannot be written: defined below
    }
  }
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true,
  });
}
