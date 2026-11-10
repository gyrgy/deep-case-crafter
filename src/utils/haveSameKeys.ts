/**
 * Whether `a` and `b` have the same own enumerable string keys, in the same order. `a` can
 * also be keys themselves: kept across calls, they come from `Reflect.ownKeys`, and when
 * they end with a symbol, `b` must have the same symbols too, after the same string keys.
 * Results have no other own keys than enumerable ones.
 *
 * @internal This function is for internal use by the library
 */
export default function haveSameKeys(
  a: object | readonly (string | symbol)[],
  b: object,
): boolean {
  let aKeys: readonly (string | symbol)[];
  let bKeys: readonly (string | symbol)[];
  if (Array.isArray(a)) {
    aKeys = a as readonly (string | symbol)[];
    bKeys =
      typeof aKeys[aKeys.length - 1] === 'symbol'
        ? Reflect.ownKeys(b)
        : Object.keys(b);
  } else {
    aKeys = Object.keys(a);
    bKeys = Object.keys(b);
  }
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) return false;
  }
  return true;
}
