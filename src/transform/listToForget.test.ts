import createLayoutMemory from './createLayoutMemory';
import createLayoutStore from './createLayoutStore';
import listToForget from './listToForget';

describe('listToForget', () => {
  it('should list a memory kept across calls once', () => {
    const store = createLayoutStore();
    listToForget(store.plain);
    listToForget(store.plain);
    expect(store.toForget).toEqual([store.plain]);
    expect(store.plain.listed).toBe(true);
  });

  it('should leave a memory of one call alone', () => {
    const memory = createLayoutMemory(null);
    listToForget(memory);
    expect(memory.listed).toBe(false);
  });

  it('should leave the memory unlisted when the push throws, so that it is listed the next time', () => {
    const store = createLayoutStore();
    const push = jest
      .spyOn(store.toForget, 'push')
      .mockImplementationOnce(() => {
        throw new RangeError('Maximum call stack size exceeded');
      });
    expect(() => listToForget(store.plain)).toThrow(RangeError);
    push.mockRestore();
    expect(store.plain.listed).toBe(false);
    listToForget(store.plain);
    expect(store.toForget).toEqual([store.plain]);
    expect(store.plain.listed).toBe(true);
  });
});
