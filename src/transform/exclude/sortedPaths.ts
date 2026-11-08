/**
 * `paths` sorted and without repeats, so that equal sets of paths are written alike
 *
 * @internal This function is for internal use by the library
 */
export default function sortedPaths(
  paths: readonly string[],
): readonly string[] {
  return paths.length === 1 ? paths : [...new Set(paths)].sort();
}
