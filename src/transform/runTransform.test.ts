import createLayoutStore from './createLayoutStore';
import forgetResults from './forgetResults';
import * as internalTransformModule from './internalTransform';
import runTransform from './runTransform';

describe('runTransform', () => {
  /** Records of 25 keys, nested more than 256 levels deep, which makes it start over */
  const deepRecords = () => {
    let deep: unknown = { leaf_value: 1 };
    for (let i = 0; i < 300; i++) deep = { next_level: deep };
    return Array.from({ length: 3 }, () => {
      const record: Record<string, unknown> = { deep_data: deep };
      for (let i = 0; i < 24; i++) record[`field_${i}_name`] = i;
      return record;
    });
  };

  /** The same records, without the nesting */
  const shallowRecords = () =>
    deepRecords().map((record) => ({ ...record, deep_data: 1 }));

  it('should start over with memories of its own, as transform does', () => {
    const store = createLayoutStore();
    const oneOff: Record<string, unknown> = {};
    for (let i = 0; i < 25; i++) oneOff[`id_${i}_key`] = i;
    const result = runTransform(
      [oneOff, ...deepRecords()],
      'camel',
      Infinity,
      false,
      null,
      store,
    ) as unknown[];
    expect(result).toHaveLength(4);
    // Each attempt saw the object once: the second does not take the first one's result
    // for another of its layout
    expect(store.plain.fastKeys).toEqual([]);
    expect(store.plain.seenResults).toHaveLength(1);
    expect(forgetResults(store.toForget)).toBe(false);
    expect(store.plain.seenResults).toEqual([null]);
  });

  it('should have a memory kept across calls replaced when the first attempt meets many shapes', () => {
    const store = createLayoutStore();
    runTransform(shallowRecords(), 'camel', Infinity, false, null, store);
    forgetResults(store.toForget);
    expect(store.plain.fastKeys).toEqual(['field23Name']);
    // The same number of keys and last key, but other keys
    const records = deepRecords().map(({ deep_data, ...rest }) => ({
      other_data: deep_data,
      ...rest,
    }));
    const shallow = { ...records[0], other_data: 1 };
    const result = runTransform(
      [shallow, ...records],
      'camel',
      Infinity,
      false,
      null,
      store,
    ) as Record<string, unknown>[];
    expect(result).toHaveLength(4);
    expect(Object.keys(result[3])[0]).toBe('otherData');
    expect(store.plain.replaced).toBe(true);
    expect(store.plain.fastKeys).toEqual(['field23Name']);
    expect(store.plain.fastObjects).toHaveLength(1);
    expect(forgetResults(store.toForget)).toBe(true);
  });

  it('should give the first attempt the memories kept across calls, and the second one none', () => {
    // The layouts each attempt starts with, from its first internalTransform call. The
    // options of an attempt get a memory of the call once it has a wide result
    const original = internalTransformModule.default;
    const starts = new Map<object, unknown>();
    const internal = jest
      .spyOn(internalTransformModule, 'default')
      .mockImplementation((data, options, ...rest) => {
        if (!starts.has(options)) starts.set(options, options.layouts);
        return original(data, options, ...rest);
      });
    const store = createLayoutStore();
    runTransform(deepRecords(), 'camel', Infinity, false, null, store);
    expect([...starts.values()]).toEqual([store.plain, null]);
    starts.clear();
    runTransform(deepRecords(), 'camel', Infinity, false, null, null);
    expect([...starts.values()]).toEqual([null, null]);
    internal.mockRestore();
  });
});
