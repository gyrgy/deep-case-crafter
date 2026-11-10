import { NO_VALUE } from '../constants/fastObjects';

/**
 * Makes the copy that a memory kept across calls keeps of a layout: a fast object with the
 * keys of `result`, in the same order, and `NO_VALUE` in every field. It holds none of the
 * result's data, from the moment it is made. And since every field holds an object, V8
 * gives the fields that held numbers the representation that takes any value, and the
 * others keep the one for objects, which V8 widens in place for a number. So no value that
 * a later result of the layout stores, such as a fraction in a field of whole numbers,
 * makes V8 retire the layout's hidden classes, which would leave the later results in
 * dictionary mode.
 *
 * @param result - A result of the layout, complete
 * @returns The copy
 * @internal This function is for internal use by the library
 */
export default function copyLayout(
  result: Record<PropertyKey, unknown>,
): object {
  const copy: Record<PropertyKey, unknown> = { ...result };
  for (const key of Reflect.ownKeys(copy)) copy[key] = NO_VALUE;
  return copy;
}
