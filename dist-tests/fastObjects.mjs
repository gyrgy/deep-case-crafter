/**
 * Checks that the built package returns fast objects. V8 stores an object built with
 * computed keys, as `transform` builds its results, in dictionary mode from its 20th key,
 * unless a fast object with the same keys in the same order already exists. `transform`
 * makes one from the second result of each layout that repeats in a call, so the results
 * after it are fast.
 *
 * V8 shares hidden classes across the whole process, so every check uses key names of its
 * own: a layout made fast by one check would otherwise make the next one pass without any
 * work from `transform`.
 *
 * Run with `npm run test:dist-objects` after `npm run build` (it needs
 * `node --allow-natives-syntax`).
 */
import { createRequire } from 'node:module';
import * as esm from '../dist/index.mjs';

const cjs = createRequire(import.meta.url)('../dist/index.js');
const hasFastProperties = new Function(
  'object',
  'return %HasFastProperties(object)',
);
// %HasFastProperties returns true for a non-object on Node 22 and earlier, and aborts the
// process on Node 24: a missing result must fail the check instead
const isFast = (value) =>
  typeof value === 'object' && value !== null && hasFastProperties(value);

/** The most keys of a layout `transform` makes fast (LAYOUT_MAX_KEYS) */
const MAX_KEYS = 200;
/** The most layouts `transform` makes fast in one call (MAX_LAYOUTS) */
const MAX_LAYOUTS = 16;

/** An object of `width` snake_case keys named after `tag`, as `JSON.parse` returns it */
const wide = (tag, width) => {
  const object = {};
  for (let i = 0; i < width; i++) object[`${tag}_key_${i}`] = i;
  return JSON.parse(JSON.stringify(object));
};
/** `count` objects of the same layout */
const records = (tag, width, count = 4) =>
  Array.from({ length: count }, () => wide(tag, width));
/** Whether every result from the third one on is fast: the first two never are */
const fastFromThird = (results) => results.slice(2).every(isFast);

const failed = [];
const check = (build, name, condition) => {
  if (!condition) failed.push(`${build}: ${name}`);
};

for (const [name, { transform }] of [
  ['es', esm],
  ['cjs', cjs],
]) {
  const build = `${name === 'es' ? 'ES module' : 'CommonJS'} build`;
  /** Key names that no other check uses */
  const tag = (check) => `${name}_${check}`;

  // Without this, the checks below could pass for other reasons
  check(
    build,
    'an object of 30 new keys is in dictionary mode',
    !isFast(transform(wide(tag('control'), 30))),
  );
  check(
    build,
    'results of 19 keys are fast',
    transform(records(tag('narrow'), 19)).every(isFast),
  );

  for (const keepReferences of [true, false]) {
    for (const width of [20, 30, 100, MAX_KEYS]) {
      check(
        build,
        `results of ${width} keys are fast from the third one (keepReferences: ${keepReferences})`,
        fastFromThird(
          transform(records(tag(`r${width}${keepReferences}`), width), {
            keepReferences,
          }),
        ),
      );
    }
  }

  const nested = transform(
    Array.from({ length: 4 }, () => ({
      ...wide(tag('parent'), 22),
      child_record: wide(tag('child'), 25),
    })),
  );
  check(build, 'nested results are fast', fastFromThird(nested));
  check(
    build,
    'nested children are fast',
    fastFromThird(nested.map((item) => item.childRecord)),
  );

  const excluded = transform(
    Array.from({ length: 4 }, () => ({
      ...wide(tag('excluded'), 25),
      raw_data: { as_is: 1 },
    })),
    { exclude: ['raw_data'] },
  );
  check(
    build,
    'results under exclude paths are fast',
    fastFromThird(excluded) && excluded[3].raw_data.asIs === 1,
  );

  const sym = Symbol('meta');
  check(
    build,
    'results of 19 keys and a symbol are fast',
    fastFromThird(
      transform(
        records(tag('symbol'), 19).map((item) => ({ ...item, [sym]: 1 })),
      ),
    ),
  );

  // Layouts that are not made fast
  transform(records(tag('once'), 30, 1));
  check(
    build,
    'a layout seen once in a call is left alone',
    !transform(records(tag('once'), 30, 1)).some(isFast),
  );
  check(
    build,
    `results of more than ${MAX_KEYS} keys are left alone`,
    !transform(records(tag('huge'), MAX_KEYS + 1)).some(isFast),
  );
  const optional = transform(
    Array.from({ length: 6 }, (_, i) => ({
      ...wide(tag(`optional${i % 2}`), 23),
      [`${tag('optional')}_last`]: 1,
    })),
  );
  check(
    build,
    'results with the same number of keys and last key, but other keys, are left alone',
    !optional.some(isFast),
  );
  const shapes = transform(
    Array.from({ length: MAX_LAYOUTS + 1 }, (_, i) =>
      records(tag(`shape${i}`), 25),
    ),
  );
  check(
    build,
    `the first ${MAX_LAYOUTS} layouts of a call are made fast, and no more`,
    shapes.slice(0, MAX_LAYOUTS).every(fastFromThird) &&
      !shapes[MAX_LAYOUTS].some(isFast),
  );

  const shared = wide(tag('shared'), 25);
  const circular = wide(tag('circular'), 25);
  circular.self_ref = circular;
  const references = transform([shared, shared, circular]);
  check(
    build,
    'references stay intact',
    references[0] === references[1] && references[2].selfRef === references[2],
  );

  // The same after their layout is learned, from the second result of a layout on
  const learnedShared = wide(tag('learnedShared'), 25);
  const loop = () => {
    const object = wide(tag('learnedLoop'), 24);
    object.self_ref = object;
    return object;
  };
  const learned = transform([
    ...records(tag('learnedShared'), 25, 2),
    learnedShared,
    { ref: learnedShared },
    loop(),
    loop(),
    loop(),
  ]);
  check(
    build,
    'references to results of a learned layout stay intact',
    learned[3].ref === learned[2] &&
      learned.slice(4).every((item) => item.selfRef === item),
  );
}

if (failed.length > 0) {
  console.error(`Checks that failed:\n- ${failed.join('\n- ')}`);
  process.exit(1);
}
console.log('fast objects: every check passed');
