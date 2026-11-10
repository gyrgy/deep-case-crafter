import createLayoutStore from './createLayoutStore';
import memoryFor from './memoryFor';

describe('memoryFor', () => {
  it('should give each set of paths a memory of its own, kept in the store', () => {
    const store = createLayoutStore();
    const metadata = memoryFor(store, ['metadata.*']);
    expect(memoryFor(store, ['metadata.*'])).toBe(metadata);
    expect(memoryFor(store, ['metadata.*', 'users_by_id.*'])).not.toBe(
      metadata,
    );
    expect(metadata).not.toBe(store.plain);
    expect(metadata.toForget).toBe(store.toForget);
    expect(store.byPaths.size).toBe(2);
  });
});
