/**
 * Checks the declarations that declarations.mts compiles to before consumer.mts reads
 * them: the key types of the wrappers around transformKey must refer to
 * TransformKeyToEach by name. A declaration that writes the type out instead is wrong,
 * and so slow to check that consumer.mts would not finish.
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

if (problems.length > 0) {
  console.error(`${file.pathname}:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
