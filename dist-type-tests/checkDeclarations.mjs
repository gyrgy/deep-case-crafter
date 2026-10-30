/**
 * Checks the declarations that declarations.mts compiles to before consumer.mts reads
 * them:
 * - The key types of the wrappers around transformKey must refer to TransformKeyToEach by
 *   name. A declaration that writes the type out instead is wrong, and so slow to check
 *   that consumer.mts would not finish.
 * - No declaration may write out the list of target cases, which would leave out the
 *   cases that later versions add. The wrappers with a generic target case refer to
 *   PlainCase instead, directly or through CaseOrDefault.
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import { readFileSync } from 'node:fs';

const file = new URL(
  '../node_modules/.cache/dist-type-tests/declarations.d.mts',
  import.meta.url,
);
const lines = readFileSync(file, 'utf8').split('\n');

const problems = ['createdByIdIn', 'sortParam'].flatMap((name) => {
  const declaration = lines.find((line) => line.includes(`function ${name}<`));
  if (!declaration) return [`${name} is not declared`];
  if (!declaration.includes('TransformKeyToEach<')) {
    return [`${name} does not refer to TransformKeyToEach`];
  }
  if (declaration.includes('elided')) return [`${name} has an elided type`];
  return [];
});

for (const line of lines) {
  if (/extends "(camel|pascal|snake|kebab|constant)" \?/.test(line)) {
    problems.push(
      `a declaration writes out the target cases: ${line.trim().slice(0, 120)}`,
    );
  }
}

if (problems.length > 0) {
  console.error(`${file.pathname}:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
