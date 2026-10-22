import path from 'node:path';
import ts from 'typescript';
import { StringCase } from '../types/stringCaseTypes';
import formatKeyType from './formatKeyType';

/**
 * Asks the TypeScript compiler which key `TransformResult<{ [key]: 0 }, targetCase>`
 * has for each case, so the type/runtime parity test can compare it with the runtime.
 *
 * @param cases - The keys and target cases to evaluate
 * @returns The key type of each case, in order, formatted by `formatKeyType`
 */
export default function evaluateKeyTypes(
  cases: readonly { key: string; targetCase: StringCase }[],
): string[] {
  // A virtual source file next to this one, so the relative import resolves
  const fileName = path.join(__dirname, '__parity__.ts');
  const source = [
    "import type { TransformResult } from '../types/transformTypes';",
    ...cases.map(
      ({ key, targetCase }, i) =>
        `export type K${i} = keyof TransformResult<{ ${JSON.stringify(key)}: 0 }, '${targetCase}'>;`,
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
    .filter(ts.isTypeAliasDeclaration)
    .map((alias) =>
      formatKeyType(checker, checker.getTypeAtLocation(alias.name)),
    );
}
