import { TransformOptionsInternal } from '../../types/transformOptionTypes';
import createExcludeState from './createExcludeState';
import excludeStep from './excludeStep';
import sortedPaths from './sortedPaths';

describe('excludeStep', () => {
  const options: TransformOptionsInternal = {
    targetCase: 'snake',
    depth: 3,
    keepReferences: true,
    exclude: null,
    layouts: null,
  };

  /** The state for `paths`, which are expected to be valid and not empty */
  const stateOf = (paths: string[]) =>
    createExcludeState(sortedPaths(paths), options, null);

  it('should keep the keys at which a path ends', () => {
    const state = stateOf(['user_id', 'metadata.*']);
    expect(excludeStep(state, 'user_id').keepKey).toBe(true);
    expect(excludeStep(state, 'metadata').keepKey).toBe(false);
    expect(excludeStep(state, 'first_name').keepKey).toBe(false);
  });

  it('should match every key with *, Map keys that are not strings included', () => {
    const state = stateOf(['*', 'metadata.order_ref']);
    for (const key of ['metadata', 'first_name', 'a.b', '*', 1, null]) {
      expect(excludeStep(state, key).keepKey).toBe(true);
    }
    expect(excludeStep(state, 1)).toBe(excludeStep(state, 'first_name'));
  });

  it('should match a key that contains a dot only with *', () => {
    const state = stateOf(['a.b']);
    expect(excludeStep(state, 'a.b').keepKey).toBe(false);
    expect(excludeStep(state, 'a').pathsBelow).toEqual(['b']);
  });

  it('should collect the rest of the paths below a key, sorted and without repeats', () => {
    const state = stateOf([
      'metadata.order_ref',
      '*.line_items',
      'metadata.*',
      'metadata.order_ref',
      'metadata',
    ]);
    expect(excludeStep(state, 'metadata')).toMatchObject({
      keepKey: true,
      pathsBelow: ['*', 'line_items', 'order_ref'],
    });
    expect(excludeStep(state, 'user_info')).toMatchObject({
      keepKey: false,
      pathsBelow: ['line_items'],
    });
  });
});
