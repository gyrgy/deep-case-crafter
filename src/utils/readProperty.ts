/**
 * Reads `object[key]`, for the `for...in` loops of `internalTransform`, which read every
 * value through this function rather than in the loop itself. In Node 24 and later, V8
 * compiles a read written in such a loop as a read by the loop's key, which takes the
 * value through the object's hidden class without recording the objects it reads. What it
 * has recorded then comes only from objects whose keys V8 cannot list from their hidden
 * class. After one keyed by numbers, or one with at most one key that is made by
 * `Object.create(null)` or in dictionary mode (as deleting keys can leave an object), the
 * record names that object alone: the compiled read fails for every later object, and V8
 * throws the code away and compiles it again, about a thousand times in 40 conversions of
 * records, for the rest of the process, which made converting them more than twice as
 * slow. A read in this function records every object it meets, and V8's TurboFan
 * compiler, which inlines it, still reads the values through the loop's hidden classes.
 *
 * @param object - The object
 * @param key - One of its keys
 * @returns The value
 * @internal This function is for internal use by the library
 */
export default function readProperty(
  object: Record<PropertyKey, unknown>,
  key: string,
): unknown {
  return object[key];
}
