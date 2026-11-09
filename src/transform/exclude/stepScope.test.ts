import { TransformScope } from '../../types/excludeStateTypes';
import { TransformOptionsInternal } from '../../types/transformOptionTypes';
import createExcludeState from './createExcludeState';
import excludeStep from './excludeStep';
import sortedPaths from './sortedPaths';
import stepScope from './stepScope';

describe('stepScope', () => {
  const options: TransformOptionsInternal = {
    targetCase: 'snake',
    depth: 3,
    keepReferences: true,
    exclude: null,
    layouts: null,
  };

  /** The state for `paths`, which are expected to be valid and not empty */
  const stateOf = (paths: string[]) =>
    createExcludeState(sortedPaths(paths), options);

  /** The state a scope transforms its values with, which is expected to exist */
  const stateIn = (scope: TransformScope) => {
    if (!scope.options.exclude) throw new Error('Expected a state');
    return scope.options.exclude;
  };

  it('should continue with a state of the paths below a key', () => {
    const state = stateOf(['users_by_id.*.first_name']);
    const users = stateIn(stepScope(state, excludeStep(state, 'users_by_id')));
    expect(users).not.toBe(state);
    expect(users.options).toMatchObject({ targetCase: 'snake', depth: 3 });

    const user = stateIn(stepScope(users, excludeStep(users, 'u1')));
    expect(excludeStep(user, 'first_name').keepKey).toBe(true);
  });

  it('should leave the paths behind where none continues', () => {
    const state = stateOf(['metadata.*']);
    const plain = stepScope(state, excludeStep(state, 'user_info'));
    expect(plain.options).toBe(options);
    expect(plain.visitedRefs).toEqual([]);
    // ...and keep using the same plain scope
    expect(stepScope(state, excludeStep(state, 'first_name'))).toBe(plain);
  });

  it('should create a state when it is first needed, and only once', () => {
    const state = stateOf(['metadata.*']);
    const step = excludeStep(state, 'metadata');
    expect(step.scope).toBeUndefined();
    const scope = stepScope(state, step);
    expect(step.scope).toBe(scope);
    expect(stepScope(state, step)).toBe(scope);
  });

  it('should share one state between keys with the same paths below them', () => {
    const state = stateOf(['metadata.*', 'user_info.*', 'tags.*.name']);
    const metadata = stepScope(state, excludeStep(state, 'metadata'));
    expect(stepScope(state, excludeStep(state, 'user_info'))).toBe(metadata);
    expect(stepScope(state, excludeStep(state, 'tags'))).not.toBe(metadata);
  });
});
