import { NO_VALUE, RECOPY_CHECKS } from '../constants/fastObjects';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import checkLayout from './checkLayout';
import createLayoutStore from './createLayoutStore';
import forgetResults from './forgetResults';
import learnLayout from './learnLayout';

describe('checkLayout', () => {
  const result = { someKey: 1, lastKey: 2 };
  const other = { otherKey: 1, lastKey: 2 };
  /** A memory kept across calls that has learned the layouts of `result` and `other` */
  const learned = () => {
    const store = createLayoutStore();
    const options: TransformOptionsInternal = {
      targetCase: 'camel',
      depth: Infinity,
      keepReferences: true,
      exclude: null,
      layouts: store.plain,
    };
    learnLayout(options, result, 25, 'lastKey');
    learnLayout(options, { ...result }, 25, 'lastKey');
    learnLayout(options, other, 26, 'lastKey');
    learnLayout(options, { ...other }, 26, 'lastKey');
    forgetResults(store.toForget);
    return { store, memory: store.plain, options };
  };

  it('should check a learned layout with its first result in a call, once', () => {
    const { store, memory, options } = learned();
    expect(memory.fastKeyLists).toEqual([
      ['someKey', 'lastKey'],
      ['otherKey', 'lastKey'],
    ]);
    expect(memory.checked).toEqual([false, false]);

    learnLayout(options, { ...result }, 25, 'lastKey');
    expect(memory.checked).toEqual([true, false]);
    expect(store.toForget).toEqual([memory]);
    expect(memory.checks).toEqual([1, 0]);
    learnLayout(options, { ...result }, 25, 'lastKey');
    expect(memory.checks).toEqual([1, 0]);

    forgetResults(store.toForget);
    expect(memory.checked).toEqual([false, false]);
    expect(memory.replaced).toBe(false);
  });

  it('should have the memory replaced for a result with the same width and last key, but other keys', () => {
    const { store, memory, options } = learned();
    const shape = { anotherKey: 1, lastKey: 2 };
    learnLayout(options, shape, 25, 'lastKey');
    expect(memory.replaced).toBe(true);
    expect(memory.done).toBe(false);
    // The result starts the memory of the rest of the call
    expect(options.layouts).not.toBe(memory);
    expect(options.layouts?.seenResults).toEqual([shape]);
    expect(forgetResults(store.toForget)).toBe(true);
  });

  it('should have the memory replaced for a result with another symbol than the layout', () => {
    const store = createLayoutStore();
    const options: TransformOptionsInternal = {
      targetCase: 'camel',
      depth: Infinity,
      keepReferences: true,
      exclude: null,
      layouts: store.plain,
    };
    const users = Symbol('users');
    const tagged = (sym: symbol) => ({ someKey: 1, lastKey: 2, [sym]: 3 });
    learnLayout(options, tagged(users), 3, 'lastKey');
    learnLayout(options, tagged(users), 3, 'lastKey');
    forgetResults(store.toForget);
    learnLayout(options, tagged(users), 3, 'lastKey');
    expect(store.plain.replaced).toBe(false);
    forgetResults(store.toForget);
    learnLayout(options, tagged(Symbol('orders')), 3, 'lastKey');
    expect(store.plain.replaced).toBe(true);
  });

  it('should replace the copy of each layout every RECOPY_CHECKS checks of that layout, with a copy without data', () => {
    const { memory } = learned();
    const [first, second] = memory.fastObjects;
    // Checked in turn, as calls with both layouts check them
    for (let i = 1; i < RECOPY_CHECKS; i++) {
      checkLayout(memory, 0, { ...result });
      checkLayout(memory, 1, { ...other });
    }
    expect(memory.fastObjects).toEqual([first, second]);
    expect(memory.fastObjects[0]).toBe(first);
    checkLayout(memory, 0, { ...result });
    expect(memory.fastObjects[0]).not.toBe(first);
    expect(memory.fastObjects[0]).toEqual({
      someKey: NO_VALUE,
      lastKey: NO_VALUE,
    });
    expect(memory.fastObjects[1]).toBe(second);
    checkLayout(memory, 1, { ...other });
    expect(memory.fastObjects[1]).not.toBe(second);
    expect(memory.checks).toEqual([RECOPY_CHECKS, RECOPY_CHECKS]);
  });
});
