import path from 'node:path';
import ts from 'typescript';
import collectTypeKeyPaths from './collectTypeKeyPaths';

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
      collectTypeKeyPaths(
        checker,
        checker.getTypeAtLocation(declaration.name),
        [],
        paths,
        0,
      );
      return [...paths].sort();
    });
}
