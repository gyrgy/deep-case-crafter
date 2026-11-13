/**
 * Run by fastObjects.mjs as `node --allow-natives-syntax --trace-deopt deoptLoop.cjs
 * <dist file>`: converts records, then one object keyed by numbers, then the records again,
 * without and with `exclude`, whose objects another loop reads. In Node 24 and later, V8's
 * Maglev compiler compiled 3.7.0's loops again and again after such an object: about a
 * thousand deoptimizations in these 40 conversions. Only there can the count go above the
 * limit. The trace lines between the markers are the deoptimizations after the object; the
 * canary before them is one that every trace must show.
 */
const { transform } = require(process.argv[2]);

// A deoptimization forced on purpose: a trace without it means V8 changed its format
const canary = (value) => value + 1;
new Function('f', '%PrepareFunctionForOptimization(f)')(canary);
canary(1);
canary(2);
new Function('f', '%OptimizeFunctionOnNextCall(f)')(canary);
canary(3);
canary('a string');
console.log('--- canary');

const keys = ['user_id', 'user_name', 'created_at', 'unit_count', 'item_price'];
const rows = JSON.parse(
  `[${Array.from(
    { length: 40000 },
    (_, r) =>
      `{${keys.map((key, i) => `"${key}":${i % 3 === 2 ? `"t${r}"` : r + i}`).join(',')}}`,
  ).join(',')}]`,
);
for (const [name, options] of [
  ['plain', undefined],
  ['exclude', { exclude: ['no_such_key'] }],
]) {
  for (let i = 0; i < 20; i++) transform(rows, options);
  transform(JSON.parse('{"1":{"a_b":1},"2":{"a_b":2}}'), options);
  console.log(`--- after ${name}`);
  for (let i = 0; i < 40; i++) transform(rows, options);
  console.log(`--- end ${name}`);
}
