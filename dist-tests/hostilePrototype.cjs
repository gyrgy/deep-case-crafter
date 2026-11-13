/**
 * Run by fastObjects.mjs as `node hostilePrototype.cjs <dist file> <frozen|indexes>`:
 * converts data, then again once `Object.prototype` is frozen, or has keys that are
 * indexes, and compares the results. Neither can be undone, so each runs in a process of
 * its own, and the unit tests can only come close. Up to 3.7.0, the second conversion
 * threw: frozen, at the first key that converts to a name `Object.prototype` has
 * (`to_string`), and with index keys, in every call that keeps references.
 */
const { transform, transformTo } = require(process.argv[2]);

const shared = { inner_key: 1 };
const toSnake = transformTo('snake');
const run = () =>
  JSON.stringify([
    Object.entries(
      transform({
        to_string: 1,
        value_of: { nested_key: 2 },
        constructor: 'x',
        has_own_property: 3,
        user_id: 4,
      }),
    ),
    Object.entries(
      transform({ to_string: 1, user_id: 2 }, { exclude: ['user_id'] }),
    ),
    transform(
      { first_item: shared, second_item: shared, item_list: [{ list_key: 1 }] },
      { depth: 3 },
    ),
    transform(
      { meta_data: { raw_key: 1 }, user_info: { first_name: 'a' } },
      { exclude: ['meta_data.*'], depth: 4 },
    ),
    [{ userName: 1 }, { valueOf: 2 }].map(toSnake),
  ]);

const expected = run();
if (process.argv[3] === 'frozen') {
  Object.freeze(Object.prototype);
} else {
  for (let index = 0; index < 8; index++) {
    Object.defineProperty(Object.prototype, index, {
      value: 'inherited',
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
}
const actual = run();
if (actual !== expected) {
  console.error(`expected ${expected}\nbut got  ${actual}`);
  process.exit(1);
}
console.log('ok');
