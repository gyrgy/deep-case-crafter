/**
 * Checks that the built package returns fast objects, and that the loop that reads objects
 * stays compiled. V8 stores an object built with
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
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
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
/**
 * A full garbage collection: V8 then drops the hidden classes that no live object uses.
 * The checks that run it build their earlier results in functions of their own, so that
 * none of them outlives the function that made it.
 */
const collectGarbage = new Function('%CollectGarbage(0)');

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
/**
 * `count` records of 25 keys named after `tag`, whose second key holds whole numbers, or
 * a fraction in the record at `fractionAt`, as `JSON.parse` returns them
 */
const amountRecords = (tag, fractionAt = -1, count = 8) =>
  Array.from({ length: count }, (_, i) => {
    const object = { [`${tag}_key_0`]: 1, [`${tag}_amount`]: i };
    if (i === fractionAt) object[`${tag}_amount`] = 12.5;
    for (let k = 2; k < 25; k++) object[`${tag}_key_${k}`] = k;
    return JSON.parse(JSON.stringify(object));
  });
/** `count` objects of the same layout */
const records = (tag, width, count = 4) =>
  Array.from({ length: count }, () => wide(tag, width));
/** Whether every result from the third one on is fast: the first two never are */
const fastFromThird = (results) => results.slice(2).every(isFast);
/**
 * Whether every result from the fourth one on is fast, as for records converted one per
 * call: the keys of a layout are kept from its second call, and compared in its third
 */
const fastFromFourth = (results) => results.slice(3).every(isFast);

const failed = [];
const check = (build, name, condition) => {
  if (!condition) failed.push(`${build}: ${name}`);
};

for (const [name, { transform, transformTo }] of [
  ['es', esm],
  ['cjs', cjs],
]) {
  const build = `${name === 'es' ? 'ES module' : 'CommonJS'} build`;
  /**
   * Key names that no other check uses, in snake_case, which every target case used here
   * converts: a result never has the keys of its input, whose hidden classes it could
   * reuse. Node 20 makes them for an object copied with spread syntax.
   */
  const tag = (check) =>
    `${name}_${check.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`;

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

  // A function made by transformTo converts as transform does
  check(
    build,
    'results of a function made by transformTo are fast from the third one',
    fastFromThird(
      transformTo('kebab', { keepReferences: false })(
        records(tag('converter'), 25),
      ),
    ),
  );

  // A call that stops a function from remembering, with results of the same number of keys
  // and last key but other keys, leaves its later calls learning on their own
  const toKebab = transformTo('kebab');
  toKebab(
    Array.from({ length: 2 }, (_, i) => ({
      ...wide(tag(`stopFirst${i}`), 23),
      [`${tag('stopFirst')}_last`]: 1,
    })),
  );
  check(
    build,
    'a function made by transformTo that has stopped remembering still learns in each call',
    fastFromThird(toKebab(records(tag('secondCall'), 25))),
  );

  // A function made by transformTo remembers layouts across its calls: records
  // converted one per call are fast from the fourth call on, and from the first one in
  // its later calls, also below exclude paths. After a full garbage collection, only the
  // copy the function keeps holds the hidden classes of the layout.
  const toPascal = transformTo('pascal');
  check(
    build,
    'records converted one per call by transformTo are fast from the fourth call',
    (() => fastFromFourth(records(tag('perCall'), 25, 6).map(toPascal)))(),
  );
  collectGarbage();
  check(
    build,
    'later calls of that function are fast from their first record',
    (() => records(tag('perCall'), 25, 2).map(toPascal).every(isFast))(),
  );
  const toKebabExcluding = transformTo('kebab', { exclude: ['raw_data'] });
  const excludingRecord = () => ({
    ...wide(tag('perCallExcluded'), 25),
    raw_data: { as_is: 1 },
  });
  check(
    build,
    'records converted one per call under exclude paths are fast from the fourth call',
    fastFromFourth(
      Array.from({ length: 6 }, excludingRecord).map(toKebabExcluding),
    ),
  );
  // A fraction in a field of whole numbers would make V8 retire the hidden classes of the
  // layout, if the copy the function keeps of it held numbers there: it holds an object in
  // every field, so the layout stays as it is
  const toCamelAmounts = transformTo('camel');
  (() => toCamelAmounts(amountRecords(tag('amounts'))))();
  collectGarbage();
  check(
    build,
    'a call with a fraction where earlier calls had whole numbers is fast from its first result',
    (() => toCamelAmounts(amountRecords(tag('amounts'), 3)).every(isFast))(),
  );
  collectGarbage();
  check(
    build,
    'the calls after it are fast',
    (() => toCamelAmounts(amountRecords(tag('amounts'))).every(isFast))(),
  );
  // The same once V8 has optimized the library's code, after thousands of calls
  const toCamelHot = transformTo('camel');
  const hotBatch = (fraction) =>
    amountRecords(tag('hot'), fraction ? 2 : -1, 5);
  (() => {
    const others = Array.from({ length: 6 }, (_, i) => tag(`hotOther${i}`));
    for (let i = 0; i < 5400; i++) {
      toCamelHot(wide(others[i % 6], 21 + (i % 6)));
    }
    for (let i = 0; i < 5; i++) toCamelHot(hotBatch(false));
    toCamelHot(hotBatch(true));
  })();
  collectGarbage();
  check(
    build,
    'after thousands of calls, the calls after one with a fraction are fast',
    (() =>
      Array.from({ length: 20 }, () => toCamelHot(hotBatch(false))).every(
        (results) => results.every(isFast),
      ))(),
  );
  // And once the function has stopped remembering, with records built with keyed stores,
  // as some database drivers build rows, which keep their own kinds of numbers
  const toCamelStopped = transformTo('camel');
  const stoppedLast = `${tag('stopped')}_updated_at`;
  const row = (kind, balance) => {
    const object = { [`${kind}_key_0`]: 0, [`${kind}_balance`]: balance };
    for (let i = 2; i < 23; i++) object[`${kind}_key_${i}`] = i;
    object[stoppedLast] = 1;
    return object;
  };
  const users = tag('stoppedUsers');
  (() => {
    for (let i = 0; i < 5; i++) toCamelStopped(row(users, i));
    // Records of the same number of keys and last key, but other keys: it stops
    // remembering
    for (let i = 0; i < 3; i++) toCamelStopped(row(tag('stoppedOrders'), i));
    toCamelStopped(row(users, 12.5));
  })();
  collectGarbage();
  check(
    build,
    'a layout learned before the function stopped remembering stays fast after a fraction',
    (() =>
      Array.from({ length: 6 }, (_, i) => toCamelStopped(row(users, i))).every(
        isFast,
      ))(),
  );

  // Two kinds of records with the same number of keys and last key: the second one is
  // learned as well, as transform learns it
  const toCamelKinds = transformTo('camel');
  const kind = (name) =>
    Array.from({ length: 8 }, () => ({
      ...wide(tag(name), 23),
      [`${tag('kinds')}_updated_at`]: 1,
    }));
  toCamelKinds(kind('kindUsers'));
  check(
    build,
    'a second kind of records with the width and last key of a learned one is fast from the third',
    fastFromThird(toCamelKinds(kind('kindOrders'))) &&
      fastFromThird(toCamelKinds(kind('kindOrders'))),
  );

  const shapes = (name) =>
    Array.from({ length: 6 }, (_, i) => ({
      ...wide(tag(`${name}${i % 2}`), 23),
      [`${tag(name)}_last`]: 1,
    }));
  check(
    build,
    'records of many shapes converted one per call are left alone',
    !shapes('perCallShapes').map(transformTo('camel')).some(isFast),
  );

  // The call in which a function learns its 16th layout learns the call's other layouts
  // too, as transform does, those it met before as well
  const toCamelFull = transformTo('camel');
  for (let i = 0; i < MAX_LAYOUTS - 1; i++) {
    toCamelFull(records(tag(`full${i}`), 25, 2));
  }
  const full = toCamelFull({
    a_before: wide(tag('fullOther'), 30),
    b_rows: records(tag('fullLast'), 25, 6),
    c_after: records(tag('fullOther'), 30, 5),
  });
  check(
    build,
    `the call in which a function learns its ${MAX_LAYOUTS}th layout learns its other layouts too`,
    fastFromThird(full.bRows) && fastFromThird([full.aBefore, ...full.cAfter]),
  );

  // A call that starts over, with keepReferences: false and a circular reference, learns
  // the layouts of its data as transform does, though the first attempt saw some of them
  const circularRef = { self_ref: null };
  circularRef.self_ref = circularRef;
  const startedOver = transformTo('camel', { keepReferences: false })({
    a_unique: Array.from({ length: MAX_LAYOUTS }, (_, i) =>
      wide(tag(`unique${i}`), 24),
    ),
    b_circular: circularRef,
    c_rows: records(tag('startedOver'), 25, 8),
  });
  check(
    build,
    'a call that starts over learns the layouts of its data',
    fastFromThird(startedOver.cRows),
  );

  // A call made from a getter while another call of the same function runs learns on its
  // own: either call can stop learning without stopping the other
  const pair = (name) =>
    shapes(name)
      .slice(0, 2)
      .map((item) => JSON.parse(JSON.stringify(item)));
  const toCamelNested = transformTo('camel');
  const outerFirst = toCamelNested({
    get a_inner() {
      toCamelNested(pair('innerShapes'));
      return 1;
    },
    b_rows: records(tag('outerRows'), 25, 6),
  });
  let innerRows = [];
  toCamelNested({
    a_shapes: pair('outerShapes'),
    get b_inner() {
      innerRows = toCamelNested(records(tag('innerRows'), 25, 6));
      return 1;
    },
  });
  check(
    build,
    'a call made while another one runs leaves it learning, and learns on its own',
    fastFromThird(outerFirst.bRows) && fastFromThird(innerRows),
  );
  check(
    build,
    'records converted one per call by transform are left alone',
    !records(tag('perCallTransform'), 25, 4)
      .map((item) => transform(item))
      .some(isFast),
  );

  // A number of another kind in the middle of a call, a fraction or one of 2^31 or more in
  // a field of whole numbers, leaves the later results fast: from the third result of a
  // layout, the copy that transform keeps of it holds no values, so V8 does not retire its
  // hidden classes. Rows built with keyed stores, as some database drivers build them, keep
  // their own kinds of numbers.
  const keyedRow = (kind, amount) => {
    const object = {};
    object[`${kind}_key_0`] = 0;
    object[`${kind}_amount`] = amount;
    for (let i = 2; i < 25; i++) object[`${kind}_key_${i}`] = i;
    return object;
  };
  for (const [name, value] of [
    ['a fraction', 12.5],
    ['a number of 2^31', 2 ** 31],
  ]) {
    const kind = tag(`midCall ${name}`.replace(/[ ^]/g, '_'));
    check(
      build,
      `${name} in a field of whole numbers in the middle of a call leaves the later results fast`,
      fastFromThird(
        transform(
          Array.from({ length: 8 }, (_, i) =>
            keyedRow(kind, i === 4 ? value : i),
          ),
        ),
      ),
    );
  }
  // Once a call has stopped learning layouts, no third result empties the copies it keeps:
  // they are emptied then
  const stoppedKind = tag('midCallStopped');
  const stoppedCall = transform([
    keyedRow(stoppedKind, 0),
    keyedRow(stoppedKind, 1),
    // Two results with the same number of keys and last key, but other keys
    ...[0, 1].map((i) => ({
      ...wide(tag(`stop${i}`), 23),
      [`${tag('stop')}_last`]: 1,
    })),
    ...Array.from({ length: 6 }, (_, i) =>
      keyedRow(stoppedKind, i === 1 ? 12.5 : i),
    ),
  ]);
  check(
    build,
    'a fraction after the call has stopped learning layouts leaves the later results fast',
    fastFromThird([...stoppedCall.slice(0, 2), ...stoppedCall.slice(4)]),
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
  const learnedShapes = transform(
    Array.from({ length: MAX_LAYOUTS + 1 }, (_, i) =>
      records(tag(`shape${i}`), 25),
    ),
  );
  check(
    build,
    `the first ${MAX_LAYOUTS} layouts of a call are made fast, and no more`,
    learnedShapes.slice(0, MAX_LAYOUTS).every(fastFromThird) &&
      !learnedShapes[MAX_LAYOUTS].some(isFast),
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

// A function made by transformTo keeps no data of a call once it has returned. The
// results are made in a function of their own, so that nothing but the weak references
// outlives it, and checked after the current job, until which they stay alive.
for (const [name, { transformTo }] of [
  ['es', esm],
  ['cjs', cjs],
]) {
  const build = `${name === 'es' ? 'ES module' : 'CommonJS'} build`;
  const toCamel = transformTo('camel');
  const weakResults = () =>
    Array.from({ length: 4 }, (_, n) => ({
      ...wide(`${name}_kept`, 25),
      nested_record: { big_list: new Array(1000).fill(n) },
    }))
      .map(toCamel)
      .flatMap((result) => [
        new WeakRef(result),
        new WeakRef(result.nestedRecord),
        new WeakRef(result.nestedRecord.bigList),
      ]);
  const refs = weakResults();
  await new Promise((resolve) => setTimeout(resolve, 0));
  collectGarbage();
  collectGarbage();
  check(
    build,
    'a function made by transformTo keeps no results alive',
    refs.every((ref) => ref.deref() === undefined),
  );

  // User code that writes a fraction into a field of whole numbers of a returned result,
  // which is then collected, leaves the layout as it is too
  const toCamelWrites = transformTo('camel');
  const tagWrites = `${name}_writes`;
  (() => {
    const results = toCamelWrites(amountRecords(tagWrites));
    results[5][Object.keys(results[5])[1]] = 12.5;
  })();
  await new Promise((resolve) => setTimeout(resolve, 0));
  collectGarbage();
  collectGarbage();
  check(
    build,
    'after user code wrote a fraction into a result, the next call is fast from its first result',
    toCamelWrites(amountRecords(tagWrites)).every(isFast),
  );
}

// The loops that read objects stay compiled once they have met an object keyed by numbers:
// counted in a process of its own, from V8's trace of deoptimizations
{
  const { stdout, stderr, status, signal, error } = spawnSync(
    process.execPath,
    [
      '--allow-natives-syntax',
      '--trace-deopt',
      fileURLToPath(new URL('deoptLoop.cjs', import.meta.url)),
      fileURLToPath(new URL('../dist/index.js', import.meta.url)),
    ],
    { encoding: 'utf8', maxBuffer: 1 << 26 },
  );
  /** The trace lines of deoptimizations between two markers */
  const deopts = (from, to) =>
    stdout
      .slice(stdout.indexOf(from), stdout.indexOf(to))
      .split('\n')
      .filter((line) => /bailout|deoptimizing/.test(line)).length;
  if (error || signal || status !== 0 || !stdout.includes('--- end exclude')) {
    failed.push(
      `deoptimization check: the child process failed (${error ?? signal ?? `exit ${status}`}): ${stderr.slice(-500)}`,
    );
  } else if (deopts('', '--- canary') === 0) {
    failed.push(
      'deoptimization check: the trace shows no deoptimization of the canary (format changed?)',
    );
  } else {
    for (const name of ['plain', 'exclude']) {
      const count = deopts(`--- after ${name}`, `--- end ${name}`);
      if (count > 50) {
        failed.push(
          `CommonJS build: ${count} deoptimizations in the process after an object keyed by numbers (${name}; limit 50)`,
        );
      }
    }
  }
}

// The built file converts in a process whose Object.prototype is frozen (see
// hostilePrototype.cjs)
for (const mode of ['frozen']) {
  const { stderr, status, signal, error } = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL('hostilePrototype.cjs', import.meta.url)),
      fileURLToPath(new URL('../dist/index.js', import.meta.url)),
      mode,
    ],
    { encoding: 'utf8' },
  );
  if (error || signal || status !== 0) {
    failed.push(
      `CommonJS build: converting while Object.prototype is hostile (${mode}) failed (${error ?? signal ?? `exit ${status}`}): ${stderr.slice(-500)}`,
    );
  }
}

if (failed.length > 0) {
  console.error(`Checks that failed:\n- ${failed.join('\n- ')}`);
  process.exit(1);
}
console.log('fast objects: every check passed');
