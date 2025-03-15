/**
 * Transform primitives (returns them unchanged)
 * @param value - The primitive value
 * @returns The same value
 * @internal This function is for internal use by the library
 */
export default function transformPrimitive<T>(value: T): T {
  return value;
}
