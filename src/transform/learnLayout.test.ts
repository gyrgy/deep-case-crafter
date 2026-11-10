import createLayoutStore from './createLayoutStore';
import forgetResults from './forgetResults';
import learnLayout from './learnLayout';
import {
  LAYOUT_CANDIDATES,
  LAYOUT_MAX_KEYS,
  MAX_LAYOUTS,
} from '../constants/fastObjects';
import { TransformOptionsInternal } from '../types/transformOptionTypes';

describe('learnLayout', () => {
  const fresh = (): TransformOptionsInternal => ({
    targetCase: 'camel',
    depth: Infinity,
    keepReferences: true,
    exclude: null,
    layouts: null,
  });
  const result = { someKey: 1, lastKey: 2 };

  it('should copy the second result of a layout, and only that one', () => {
    const options = fresh();
    learnLayout(options, result, 25, 'lastKey');
    expect(options.layouts?.fastObjects).toEqual([]);

    const second = { ...result };
    learnLayout(options, second, 25, 'lastKey');
    expect(options.layouts?.fastObjects).toEqual([result]);
    expect(options.layouts?.fastObjects[0]).not.toBe(result);
    expect(options.layouts?.fastObjects[0]).not.toBe(second);

    learnLayout(options, result, 25, 'lastKey');
    expect(options.layouts?.fastObjects).toHaveLength(1);
  });

  it('should tell layouts apart by their number of keys and their last key', () => {
    const options = fresh();
    learnLayout(options, result, 25, 'lastKey');
    learnLayout(options, result, 26, 'lastKey');
    learnLayout(options, result, 25, 'otherKey');
    expect(options.layouts?.fastWidths).toEqual([]);
    expect(options.layouts?.seenWidths).toEqual([25, 26, 25]);
  });

  it('should stop learning once two results share the number of keys and the last key, but not the keys', () => {
    const options = fresh();
    learnLayout(options, { aKey: 1, lastKey: 2 }, 25, 'lastKey');
    learnLayout(options, { bKey: 1, lastKey: 2 }, 25, 'lastKey');
    expect(options.layouts?.done).toBe(true);

    learnLayout(options, result, 30, 'lastKey');
    learnLayout(options, result, 30, 'lastKey');
    expect(options.layouts?.fastWidths).toEqual([]);
  });

  it('should remember the last LAYOUT_CANDIDATES layouts seen once, and only those', () => {
    const options = fresh();
    for (let i = 0; i <= LAYOUT_CANDIDATES; i++) {
      learnLayout(options, result, 25, `key${i}`);
    }
    // The last one took the place of key0, so key1 is the oldest one left. A match adds
    // nothing to the ring, which is why key1 comes first
    learnLayout(options, result, 25, 'key1');
    expect(options.layouts?.fastKeys).toEqual(['key1']);

    learnLayout(options, result, 25, 'key0');
    expect(options.layouts?.fastKeys).toEqual(['key1']);
  });

  it('should learn at most MAX_LAYOUTS layouts in a call', () => {
    const options = fresh();
    for (let i = 0; i <= MAX_LAYOUTS; i++) {
      learnLayout(options, result, 25, `key${i}`);
      learnLayout(options, result, 25, `key${i}`);
    }
    expect(options.layouts?.fastWidths).toHaveLength(MAX_LAYOUTS);
    expect(options.layouts?.done).toBe(true);
    expect(options.layouts?.fastKeys).not.toContain(`key${MAX_LAYOUTS}`);
  });

  it('should list a memory kept across calls, once, before it stores anything in it', () => {
    const store = createLayoutStore();
    const options = { ...fresh(), layouts: store.plain };
    const push = jest
      .spyOn(store.toForget, 'push')
      .mockImplementationOnce(() => {
        throw new RangeError('Maximum call stack size exceeded');
      });
    expect(() => learnLayout(options, result, 25, 'lastKey')).toThrow(
      RangeError,
    );
    push.mockRestore();
    expect(store.plain.seenResults).toEqual([]);
    expect(store.plain.listed).toBe(false);

    learnLayout(options, result, 25, 'lastKey');
    expect(store.toForget).toEqual([store.plain]);
    learnLayout(options, { ...result }, 25, 'lastKey');
    expect(store.toForget).toEqual([store.plain]);
    expect(store.plain.fastObjects).toHaveLength(1);

    // A memory of one call is never listed
    const call = fresh();
    learnLayout(call, result, 25, 'lastKey');
    expect(call.layouts?.toForget).toBeNull();
    expect(call.layouts?.listed).toBe(false);
  });

  it('should learn a layout from its third result across calls, comparing it with the keys of the second', () => {
    const store = createLayoutStore();
    const options = { ...fresh(), layouts: store.plain };
    // First call: the result's keys are not kept
    learnLayout(options, result, 25, 'lastKey');
    forgetResults(store.toForget);
    expect(store.plain.seenResults).toEqual([null]);
    // Second call: the layout came up before, so the keys of this result are kept
    learnLayout(options, { ...result }, 25, 'lastKey');
    expect(store.plain.seenAgain).toEqual([true]);
    expect(store.plain.fastKeys).toEqual([]);
    forgetResults(store.toForget);
    expect(store.plain.seenResults).toEqual([['someKey', 'lastKey']]);
    expect(store.plain.seenAgain).toEqual([false]);
    // Third call: compared with those keys, and learned
    learnLayout(options, { ...result }, 25, 'lastKey');
    expect(store.plain.fastKeys).toEqual(['lastKey']);
  });

  it('should tell many shapes from a result with other keys than one of an earlier call, and go on learning with a memory of the call', () => {
    const store = createLayoutStore();
    const options = { ...fresh(), layouts: store.plain };
    for (let i = 0; i < 2; i++) {
      learnLayout(options, { aKey: 1, lastKey: 2 }, 25, 'lastKey');
      forgetResults(store.toForget);
    }
    const other = { bKey: 1, lastKey: 2 };
    learnLayout(options, other, 25, 'lastKey');
    expect(store.plain.replaced).toBe(true);
    expect(store.plain.done).toBe(false);
    expect(store.plain.seenResults).toEqual([['aKey', 'lastKey']]);
    expect(store.toForget).toEqual([store.plain]);

    // The rest of the call learns with a memory of its own, which starts with this result
    const call = options.layouts;
    expect(call).not.toBe(store.plain);
    expect(call.toForget).toBeNull();
    expect(call.seenResults).toEqual([other]);
    learnLayout(options, { ...other }, 25, 'lastKey');
    expect(options.layouts).toBe(call);
    expect(call.fastKeys).toEqual(['lastKey']);
    expect(store.plain.fastKeys).toEqual([]);
    expect(forgetResults(store.toForget)).toBe(true);
  });

  it('should start the memory of the rest of the call with the results of the call seen once', () => {
    const store = createLayoutStore();
    const options = { ...fresh(), layouts: store.plain };
    for (let i = 0; i < 2; i++) {
      learnLayout(options, { aKey: 1, lastKey: 2 }, 25, 'lastKey');
      forgetResults(store.toForget);
    }
    // A record of another layout comes before the swap, the second one after it
    const page = { pageKey: 1, pageLast: 2 };
    learnLayout(options, page, 30, 'pageLast');
    learnLayout(options, { bKey: 1, lastKey: 2 }, 25, 'lastKey');
    expect(options.layouts).not.toBe(store.plain);
    expect(options.layouts.seenResults).toEqual([
      page,
      { bKey: 1, lastKey: 2 },
    ]);
    learnLayout(options, { ...page }, 30, 'pageLast');
    expect(options.layouts.fastKeys).toEqual(['pageLast']);
  });

  it('should give the options a memory of the call when theirs, kept across calls, has been replaced', () => {
    const store = createLayoutStore();
    store.plain.replaced = true;
    const options = { ...fresh(), layouts: store.plain };
    learnLayout(options, result, 25, 'lastKey');
    expect(options.layouts).not.toBe(store.plain);
    expect(options.layouts.seenResults).toEqual([result]);
    expect(store.plain.seenResults).toEqual([]);
    expect(store.toForget).toEqual([]);
  });

  it('should stop learning in a call when two results of the call share the width and last key, but not the keys', () => {
    const store = createLayoutStore();
    const options = { ...fresh(), layouts: store.plain };
    learnLayout(options, { aKey: 1, lastKey: 2 }, 25, 'lastKey');
    learnLayout(options, { bKey: 1, lastKey: 2 }, 25, 'lastKey');
    expect(store.plain.done).toBe(true);
    expect(store.plain.replaced).toBe(false);
    expect(forgetResults(store.toForget)).toBe(true);
  });

  it('should go on learning in the call in which a memory kept across calls learns its MAX_LAYOUTS-th layout', () => {
    const store = createLayoutStore();
    const options = { ...fresh(), layouts: store.plain };
    for (let i = 0; i < MAX_LAYOUTS - 1; i++) {
      learnLayout(options, result, 25, `key${i}`);
      learnLayout(options, result, 25, `key${i}`);
      forgetResults(store.toForget);
    }
    // The call that learns the last one learns the call's other layouts too
    learnLayout(options, result, 25, 'lastKey');
    learnLayout(options, result, 25, 'lastKey');
    expect(store.plain.fastWidths).toHaveLength(MAX_LAYOUTS);
    expect(store.plain.replaced).toBe(true);
    expect(store.plain.done).toBe(false);
    learnLayout(options, result, 30, 'lastKey');
    learnLayout(options, result, 30, 'lastKey');
    expect(options.layouts).not.toBe(store.plain);
    expect(options.layouts.fastWidths).toEqual([30]);
    expect(store.plain.fastWidths).toHaveLength(MAX_LAYOUTS);
    expect(forgetResults(store.toForget)).toBe(true);
  });

  it('should start a new layout in the ring as not seen again', () => {
    const store = createLayoutStore();
    const options = { ...fresh(), layouts: store.plain };
    learnLayout(options, result, 25, 'lastKey');
    forgetResults(store.toForget);
    learnLayout(options, result, 25, 'lastKey');
    for (let i = 1; i <= LAYOUT_CANDIDATES; i++) {
      learnLayout(options, result, 25, `key${i}`);
    }
    // The ring went round: the slot of the layout seen again holds a new one
    expect(store.plain.seenAgain[0]).toBe(false);
    forgetResults(store.toForget);
    expect(store.plain.seenResults.every((seen) => seen === null)).toBe(true);
  });

  it('should leave layouts of more than LAYOUT_MAX_KEYS keys alone', () => {
    const options = fresh();
    learnLayout(options, result, LAYOUT_MAX_KEYS + 1, 'lastKey');
    learnLayout(options, result, LAYOUT_MAX_KEYS + 1, 'lastKey');
    expect(options.layouts).toBeNull();

    learnLayout(options, result, LAYOUT_MAX_KEYS, 'lastKey');
    learnLayout(options, result, LAYOUT_MAX_KEYS, 'lastKey');
    expect(options.layouts?.fastWidths).toEqual([LAYOUT_MAX_KEYS]);
  });
});
