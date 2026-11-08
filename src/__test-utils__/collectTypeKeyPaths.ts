import ts from 'typescript';
import { MAP_VALUES } from './mapValues';

/**
 * Adds the key paths of `type` to `paths`, below `segments`, the way `collectKeyPaths`
 * adds those of a value: the work of `evaluateResultKeyPaths`, one nesting level at a time
 *
 * @param checker - The type checker of the program
 * @param type - The type
 * @param segments - The keys that lead to it
 * @param paths - The paths found so far, written as JSON arrays, and `<unknown>`,
 *   `<never>` or `<any>` where a type is one of those
 * @param depth - How deep `type` is nested, to stop past 50 levels
 */
export default function collectTypeKeyPaths(
  checker: ts.TypeChecker,
  type: ts.Type,
  segments: readonly string[],
  paths: Set<string>,
  depth: number,
): void {
  if (depth > 50) {
    throw new Error(`Type too deep at ${JSON.stringify(segments)}`);
  }
  const next = depth + 1;

  if (type.isUnion()) {
    for (const member of type.types)
      collectTypeKeyPaths(checker, member, segments, paths, next);
    return;
  }
  if (!(type.flags & ts.TypeFlags.Object)) {
    // Primitives and literals have no keys; `unknown` and `never` are results to report
    if (
      type.flags &
      (ts.TypeFlags.Unknown | ts.TypeFlags.Never | ts.TypeFlags.Any)
    ) {
      paths.add(`<${checker.typeToString(type)}>`);
    }
    return;
  }

  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    for (const item of checker.getTypeArguments(type as ts.TypeReference)) {
      collectTypeKeyPaths(checker, item, segments, paths, next);
    }
    return;
  }

  const name = type.getSymbol()?.getName();
  if (name === 'Map' || name === 'Set') {
    const [first, second] = checker.getTypeArguments(type as ts.TypeReference);
    if (name === 'Set') {
      collectTypeKeyPaths(checker, first, segments, paths, next);
      return;
    }
    for (const key of first.isUnion() ? first.types : [first]) {
      if (key.isStringLiteral()) {
        paths.add(JSON.stringify([...segments, key.value]));
      } else if (key.flags & ts.TypeFlags.String) {
        paths.add(JSON.stringify([...segments, '<string>']));
      }
    }
    collectTypeKeyPaths(
      checker,
      second,
      [...segments, MAP_VALUES],
      paths,
      next,
    );
    return;
  }

  for (const property of checker.getPropertiesOfType(type)) {
    const key = property.getName();
    paths.add(JSON.stringify([...segments, key]));
    collectTypeKeyPaths(
      checker,
      checker.getTypeOfSymbol(property),
      [...segments, key],
      paths,
      next,
    );
  }
}
