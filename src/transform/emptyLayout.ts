import { NO_VALUE } from '../constants/fastObjects';

/**
 * Stores `NO_VALUE` in every field of `copy`, a copy of a result made with spread syntax:
 * it then holds none of the result's data, and V8 gives its fields that held numbers the
 * representation that takes any value (see `copyLayout`).
 *
 * @param copy - The copy
 * @param width - How many keys it has, symbols included
 * @internal This function is for internal use by the library
 */
export default function emptyLayout(
  copy: Record<PropertyKey, unknown>,
  width: number,
): void {
  // A copy made with spread syntax has enumerable keys only. Indexed loops over them took
  // 0.32 µs for 30 keys, spread included, and a `for...of` loop over `Reflect.ownKeys`
  // 0.83 µs (Node 24): mostly one store per key.
  const keys = Object.keys(copy);
  for (let i = 0; i < keys.length; i++) copy[keys[i]] = NO_VALUE;
  if (keys.length < width) {
    const symbols = Object.getOwnPropertySymbols(copy);
    for (let i = 0; i < symbols.length; i++) copy[symbols[i]] = NO_VALUE;
  }
}
