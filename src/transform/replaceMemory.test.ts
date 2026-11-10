import { LAYOUT_CANDIDATES } from '../constants/fastObjects';
import createLayoutStore from './createLayoutStore';
import replaceMemory from './replaceMemory';

describe('replaceMemory', () => {
  it('should start a memory of the call with the results of the call the kept memory has seen once', () => {
    const kept = createLayoutStore().plain;
    const first = { firstKey: 1 };
    const second = { secondKey: 1 };
    kept.seenWidths.push(25, 26, 27, 28);
    kept.seenKeys.push('firstKey', 'earlierKey', 'secondKey', 'otherKey');
    kept.seenResults.push(first, ['earlierKey'], second, null);
    kept.seenAgain.push(false, false, true, false);
    kept.nextSeen = 4;
    const memory = replaceMemory(kept);
    expect(memory.toForget).toBeNull();
    expect(memory.seenWidths).toEqual([25, 27]);
    expect(memory.seenKeys).toEqual(['firstKey', 'secondKey']);
    expect(memory.seenResults).toEqual([first, second]);
    expect(memory.seenResults[0]).toBe(first);
    expect(memory.seenAgain).toEqual([false, false]);
    expect(memory.nextSeen).toBe(2);
    expect(memory.fastWidths).toEqual([]);
  });

  it('should keep the oldest results first when the ring has gone round', () => {
    const kept = createLayoutStore().plain;
    for (let i = 0; i < LAYOUT_CANDIDATES; i++) {
      kept.seenWidths.push(25);
      kept.seenKeys.push(`key${i}`);
      kept.seenResults.push({ [`key${i}`]: i });
      kept.seenAgain.push(false);
    }
    // Slot 3 holds the newest one, and slot 4 the oldest
    kept.nextSeen = 4;
    const memory = replaceMemory(kept);
    expect(memory.seenKeys[0]).toBe('key4');
    expect(memory.seenKeys[LAYOUT_CANDIDATES - 1]).toBe('key3');
    expect(memory.nextSeen).toBe(0);
  });
});
