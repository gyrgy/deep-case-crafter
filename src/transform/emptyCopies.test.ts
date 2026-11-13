import { NO_VALUE } from '../constants/fastObjects';
import addLayout from './addLayout';
import createLayoutMemory from './createLayoutMemory';
import emptyCopies from './emptyCopies';

describe('emptyCopies', () => {
  it('should empty the copies not emptied yet, and leave the others alone', () => {
    const memory = createLayoutMemory(null);
    addLayout(memory, { aKey: 1, lastKey: 2 }, 25, 'lastKey');
    addLayout(memory, { bKey: 3, otherKey: 4 }, 26, 'otherKey');
    // As learnLayout marks a copy it has emptied
    memory.checked[1] = true;
    const second = memory.fastObjects[1];

    emptyCopies(memory);
    expect(memory.fastObjects).toEqual([
      { aKey: NO_VALUE, lastKey: NO_VALUE },
      { bKey: 3, otherKey: 4 },
    ]);
    expect(memory.fastObjects[1]).toBe(second);
    expect(memory.checked).toEqual([true, true]);
  });
});
