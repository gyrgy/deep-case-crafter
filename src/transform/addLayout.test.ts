import { MAX_LAYOUTS, NO_VALUE } from '../constants/fastObjects';
import addLayout from './addLayout';
import createLayoutMemory from './createLayoutMemory';
import createLayoutStore from './createLayoutStore';

describe('addLayout', () => {
  const result = { someKey: 1, lastKey: 'a' };

  it('should keep a copy of the result in a memory of one call', () => {
    const memory = createLayoutMemory(null);
    addLayout(memory, result, 25, 'lastKey');
    expect(memory.fastWidths).toEqual([25]);
    expect(memory.fastKeys).toEqual(['lastKey']);
    expect(memory.fastObjects).toEqual([result]);
    expect(memory.fastObjects[0]).not.toBe(result);
    expect(memory.fastKeyLists).toEqual([]);
  });

  it('should keep a copy without data, the keys, and a check count in a memory kept across calls', () => {
    const memory = createLayoutStore().plain;
    addLayout(memory, result, 25, 'lastKey');
    expect(memory.fastObjects).toEqual([
      { someKey: NO_VALUE, lastKey: NO_VALUE },
    ]);
    expect(memory.fastKeyLists).toEqual([['someKey', 'lastKey']]);
    expect(memory.checked).toEqual([true]);
    expect(memory.checks).toEqual([0]);

    const sym = Symbol('kind');
    addLayout(memory, { ...result, [sym]: 1 }, 26, 'lastKey');
    expect(memory.fastKeyLists[1]).toEqual(['someKey', 'lastKey', sym]);
  });

  it('should leave a layout unlearned when storing it throws partway, and store the next one in its place', () => {
    const memory = createLayoutStore().plain;
    // Reflect.ownKeys runs in copyLayout, then once the copy is stored: the second call
    // throws. Called directly: `expect` uses it too
    const ownKeys = Reflect.ownKeys;
    let calls = 0;
    const keys = jest
      .spyOn(Reflect, 'ownKeys')
      .mockImplementation((target: object) => {
        calls++;
        if (calls === 2) {
          throw new RangeError('Maximum call stack size exceeded');
        }
        return ownKeys(target);
      });
    let thrown: unknown;
    try {
      addLayout(memory, { firstKey: 1, extraKey: 2 }, 25, 'extraKey');
    } catch (error) {
      thrown = error;
    }
    keys.mockRestore();
    expect(calls).toBe(2);
    expect(thrown).toBeInstanceOf(RangeError);
    expect(memory.fastWidths).toEqual([]);
    expect(memory.fastObjects).toHaveLength(1);

    addLayout(memory, result, 25, 'lastKey');
    expect(memory.fastWidths).toEqual([25]);
    expect(memory.fastKeys).toEqual(['lastKey']);
    expect(memory.fastObjects).toEqual([
      { someKey: NO_VALUE, lastKey: NO_VALUE },
    ]);
    expect(memory.fastKeyLists).toEqual([['someKey', 'lastKey']]);
  });

  it('should stop a memory of one call at MAX_LAYOUTS, and have a memory kept across calls replaced', () => {
    const call = createLayoutMemory(null);
    const kept = createLayoutStore().plain;
    for (let i = 0; i < MAX_LAYOUTS; i++) {
      expect(call.done).toBe(false);
      expect(kept.replaced).toBe(false);
      addLayout(call, result, 25, `key${i}`);
      addLayout(kept, result, 25, `key${i}`);
    }
    expect(call.done).toBe(true);
    expect(call.replaced).toBe(false);
    expect(kept.replaced).toBe(true);
    expect(kept.done).toBe(false);
  });
});
