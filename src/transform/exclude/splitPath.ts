/**
 * Splits off the first key of a path: `'a.b.c'` -> `['a', 'b.c']`, `'a'` -> `['a']`
 *
 * @internal This function is for internal use by the library
 */
export default function splitPath(path: string): readonly [string, string?] {
  const dot = path.indexOf('.');
  return dot === -1 ? [path] : [path.slice(0, dot), path.slice(dot + 1)];
}
