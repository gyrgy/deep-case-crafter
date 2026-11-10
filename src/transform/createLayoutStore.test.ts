import createLayoutStore from './createLayoutStore';

describe('createLayoutStore', () => {
  it('should create an empty memory for the values no path reaches, which lists itself in the store', () => {
    const store = createLayoutStore();
    expect(store.plain).toMatchObject({
      done: false,
      replaced: false,
      seenResults: [],
      fastObjects: [],
      checks: [],
      listed: false,
    });
    expect(store.plain.toForget).toBe(store.toForget);
    expect(store.toForget).toEqual([]);
    expect(store.byPaths.size).toBe(0);
    expect(createLayoutStore().plain).not.toBe(store.plain);
  });
});
