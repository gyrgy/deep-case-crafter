/**
 * Assigns `value` to `key` on `target`, creating a genuine own property even for
 * the special `__proto__` key.
 *
 * A plain `target[key] = value` invokes the `__proto__` setter on ordinary objects,
 * which silently drops a `__proto__` key (and can mutate the object's prototype). Using
 * `Object.defineProperty` for that one key keeps it as normal, enumerable data — so keys
 * are never lost and the prototype is never touched.
 *
 * @internal This function is for internal use by the library
 */
export default function setKey(
  target: Record<string | number | symbol, unknown>,
  key: string | number | symbol,
  value: unknown,
): void {
  if (key === '__proto__') {
    Object.defineProperty(target, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  } else {
    target[key] = value;
  }
}
