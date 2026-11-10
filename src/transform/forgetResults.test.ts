import createLayoutStore from './createLayoutStore';
import forgetResults from './forgetResults';
import listToForget from './listToForget';
import memoryFor from './memoryFor';

describe('forgetResults', () => {
  it('should replace a result by its keys if its layout came up in an earlier call, and by null otherwise', () => {
    const store = createLayoutStore();
    const memory = store.plain;
    memory.seenResults.push(
      { userId: 1, userName: 'a' },
      { orderId: 1 },
      ['earlierKey'],
      null,
    );
    memory.seenAgain.push(true, false, false, false);
    listToForget(memory);
    forgetResults(store.toForget);
    expect(memory.seenResults).toEqual([
      ['userId', 'userName'],
      null,
      ['earlierKey'],
      null,
    ]);
    expect(memory.seenAgain).toEqual([false, false, false, false]);
  });

  it('should keep the symbols among the keys', () => {
    const store = createLayoutStore();
    const memory = store.plain;
    const sym = Symbol('kind');
    memory.seenResults.push({ userId: 1, [sym]: 2 });
    memory.seenAgain.push(true);
    listToForget(memory);
    forgetResults(store.toForget);
    expect(memory.seenResults).toEqual([['userId', sym]]);
  });

  it('should leave the layouts of the call unchecked for the next one', () => {
    const store = createLayoutStore();
    const memory = store.plain;
    memory.checked.push(true, false, true);
    listToForget(memory);
    forgetResults(store.toForget);
    expect(memory.checked).toEqual([false, false, false]);
  });

  it('should tell whether the function has stopped using one of the memories', () => {
    const store = createLayoutStore();
    listToForget(store.plain);
    expect(forgetResults(store.toForget)).toBe(false);

    const pathsMemory = memoryFor(store, ['metadata.*']);
    pathsMemory.done = true;
    listToForget(store.plain);
    listToForget(pathsMemory);
    expect(forgetResults(store.toForget)).toBe(true);
    expect(forgetResults(store.toForget)).toBe(false);

    const other = createLayoutStore();
    other.plain.replaced = true;
    listToForget(other.plain);
    expect(forgetResults(other.toForget)).toBe(true);
  });

  it('should empty the list, so that each memory is listed again when a call uses it', () => {
    const store = createLayoutStore();
    const pathsMemory = memoryFor(store, ['metadata.*']);
    listToForget(store.plain);
    listToForget(pathsMemory);
    listToForget(store.plain);
    expect(store.toForget).toEqual([store.plain, pathsMemory]);
    forgetResults(store.toForget);
    expect(store.toForget).toEqual([]);
    expect(store.plain.listed).toBe(false);
    listToForget(store.plain);
    expect(store.toForget).toEqual([store.plain]);
  });

  it('should go over a memory listed twice, as after a push that threw, without harm', () => {
    const store = createLayoutStore();
    const memory = store.plain;
    memory.seenResults.push({ userId: 1 });
    memory.seenAgain.push(true);
    store.toForget.push(memory, memory);
    forgetResults(store.toForget);
    expect(memory.seenResults).toEqual([['userId']]);
    expect(store.toForget).toEqual([]);
  });
});
