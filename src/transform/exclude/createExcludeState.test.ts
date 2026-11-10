import { TransformOptionsInternal } from '../../types/transformOptionTypes';
import createLayoutStore from '../createLayoutStore';
import memoryFor from '../memoryFor';
import createExcludeState from './createExcludeState';

describe('createExcludeState', () => {
  const options: TransformOptionsInternal = {
    targetCase: 'snake',
    depth: 3,
    keepReferences: true,
    exclude: null,
    layouts: null,
  };

  it('should give the state options of its own, which carry the state', () => {
    const state = createExcludeState(['metadata.*'], options, null);
    expect(state.options).toMatchObject({ targetCase: 'snake', depth: 3 });
    expect(state.options.exclude).toBe(state);
    expect(options.exclude).toBeNull();
    expect(state.visitedRefs).toEqual([]);
  });

  it('should transform the values no path reaches with the options it was given', () => {
    const state = createExcludeState(['metadata.*'], options, null);
    expect(state.root.plain.options).toBe(options);
    expect(state.root.plain.visitedRefs).toEqual([]);
  });

  it('should give its states the memories that a function made by transformTo keeps for their paths', () => {
    const store = createLayoutStore();
    const state = createExcludeState(['metadata.*'], options, store);
    expect(state.root.store).toBe(store);
    expect(state.options.layouts).toBe(memoryFor(store, ['metadata.*']));
    const again = createExcludeState(['metadata.*'], options, store);
    expect(again.options.layouts).toBe(state.options.layouts);
    expect(
      createExcludeState(['metadata.*'], options, null).options.layouts,
    ).toBeNull();
  });

  it('should create new states for every call', () => {
    const paths = ['metadata.*'];
    const first = createExcludeState(paths, options, null);
    const second = createExcludeState(paths, options, null);
    expect(second).not.toBe(first);
    expect(second.root).not.toBe(first.root);
    expect(second.visitedRefs).not.toBe(first.visitedRefs);
  });
});
