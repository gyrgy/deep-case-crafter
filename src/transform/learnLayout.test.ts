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
