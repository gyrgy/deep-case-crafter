import path from 'node:path';
import ts from 'typescript';
import { MAP_VALUES } from './listKeyPaths';

/**
 * Asks the TypeScript compiler for the type of each expression, written with
 * `transform` in scope (`transform(data, { exclude: [...] })`), and lists the keys of each
 * type the way `listKeyPaths` lists the keys of a value: so the exclude parity test can
 * compare the result type of a call with the value the runtime returns.
 *
 * @param expressions - The expressions to evaluate
 * @returns The key paths of each expression's type, in order
 */
export default function evaluateResultKeyPaths(
  expressions: readonly string[],
): string[][] {
  // A virtual source file next to this one, so the relative import resolves
  const fileName = path.join(__dirname, '__exclude_parity__.ts');
  const source = [
    "import transform from '../transform/transform';",
    ...expressions.map(
      (expression, i) => `export const r${i} = ${expression};`,
    ),
  ].join('\n');

  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2020,
    lib: ['lib.es2020.d.ts'],
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const { getSourceFile } = host;
  host.getSourceFile = (name, languageVersion, ...rest) =>
    name === fileName
      ? ts.createSourceFile(name, source, languageVersion)
      : getSourceFile.call(host, name, languageVersion, ...rest);

  const program = ts.createProgram([fileName], options, host);
  const sourceFile = program.getSourceFile(fileName);
  const errors = ts.getPreEmitDiagnostics(program, sourceFile);
  if (!sourceFile || errors.length > 0) {
    throw new Error(ts.formatDiagnostics(errors, host));
  }

  const checker = program.getTypeChecker();
  return sourceFile.statements
    .filter(ts.isVariableStatement)
    .map((statement) => {
      const paths = new Set<string>();
      const [declaration] = statement.declarationList.declarations;
      collect(
        checker,
        checker.getTypeAtLocation(declaration.name),
        [],
        paths,
        0,
      );
      return [...paths].sort();
    });
}

function collect(
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
      collect(checker, member, segments, paths, next);
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
      collect(checker, item, segments, paths, next);
    }
    return;
  }

  const name = type.getSymbol()?.getName();
  if (name === 'Map' || name === 'Set') {
    const [first, second] = checker.getTypeArguments(type as ts.TypeReference);
    if (name === 'Set') {
      collect(checker, first, segments, paths, next);
      return;
    }
    for (const key of first.isUnion() ? first.types : [first]) {
      if (key.isStringLiteral()) {
        paths.add(JSON.stringify([...segments, key.value]));
      } else if (key.flags & ts.TypeFlags.String) {
        paths.add(JSON.stringify([...segments, '<string>']));
      }
    }
    collect(checker, second, [...segments, MAP_VALUES], paths, next);
    return;
  }

  for (const property of checker.getPropertiesOfType(type)) {
    const key = property.getName();
    paths.add(JSON.stringify([...segments, key]));
    collect(
      checker,
      checker.getTypeOfSymbol(property),
      [...segments, key],
      paths,
      next,
    );
  }
}
