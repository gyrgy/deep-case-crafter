/**
 * Whether `a` and `b` have the same own enumerable string keys, in the same order
 *
 * @internal This function is for internal use by the library
 */
export default function haveSameKeys(a: object, b: object): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) return false;
  }
  return true;
}
