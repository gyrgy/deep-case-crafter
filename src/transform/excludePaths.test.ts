import { TransformOptionsInternal } from '../types/transformOptionTypes';
import {
  TransformScope,
  createExcludeState,
  excludeStep,
  stepScope,
} from './excludePaths';

describe('excludePaths', () => {
  const options: TransformOptionsInternal = {
    targetCase: 'snake',
    depth: 3,
    keepReferences: true,
    exclude: null,
  };

  /** The state for `paths`, which are expected to be valid and not empty */
  const stateOf = (paths: string[]) => {
    const state = createExcludeState(paths, options);
    if (!state) throw new Error('Expected a state');
    return state;
  };

  /** The state a scope transforms its values with, which is expected to exist */
  const stateIn = (scope: TransformScope) => {
    if (!scope.options.exclude) throw new Error('Expected a state');
    return scope.options.exclude;
  };

  describe('createExcludeState', () => {
    it('should return null when there is no path', () => {
      expect(createExcludeState(undefined, options)).toBeNull();
      expect(createExcludeState(null, options)).toBeNull();
      expect(createExcludeState([], options)).toBeNull();
    });

    it('should reject anything but an array', () => {
      const cases = [
        ['metadata.*', '"metadata.*"'],
        [new Set(['metadata.*']), '[object Set]'],
        [{ 0: 'metadata.*', length: 1 }, '[object Object]'],
        [1, '1'],
      ] as const;
      for (const [exclude, description] of cases) {
        expect(() => createExcludeState(exclude, options)).toThrow(
          new TypeError(
            `Unsupported exclude ${description}. Use an array of paths, such as ["metadata.*"].`,
          ),
        );
      }
    });

    it('should reject paths that are not strings or that have an empty key', () => {
      const cases = [
        [1, '1'],
        [undefined, 'undefined'],
        [['metadata'], '[object Array]'],
        ['', '""'],
        ['.metadata', '".metadata"'],
        ['metadata.', '"metadata."'],
        ['metadata..order_ref', '"metadata..order_ref"'],
      ] as const;
      for (const [path, description] of cases) {
        expect(() => createExcludeState(['metadata.*', path], options)).toThrow(
          new TypeError(
            `Unsupported exclude path ${description}. Use non-empty keys joined with dots, such as "metadata.*".`,
          ),
        );
      }
    });

    it('should give the state options of its own, which carry the state', () => {
      const state = stateOf(['metadata.*']);
      expect(state.options).toMatchObject({ targetCase: 'snake', depth: 3 });
      expect(state.options.exclude).toBe(state);
      expect(options.exclude).toBeNull();
      expect(state.visitedRefs).toEqual([]);
    });
  });

  describe('excludeStep', () => {
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

  describe('stepScope', () => {
    it('should continue with a state of the paths below a key', () => {
      const state = stateOf(['users_by_id.*.first_name']);
      const users = stateIn(
        stepScope(state, excludeStep(state, 'users_by_id')),
      );
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
});
