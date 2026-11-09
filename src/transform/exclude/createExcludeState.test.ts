import { TransformOptionsInternal } from '../../types/transformOptionTypes';
import createExcludeState from './createExcludeState';

describe('createExcludeState', () => {
  const options: TransformOptionsInternal = {
    targetCase: 'snake',
    depth: 3,
    keepReferences: true,
    exclude: null,
    layouts: null,
  };

  /** The state for `paths`, which are expected to be valid and not empty */
  const stateOf = (paths: string[]) => {
    const state = createExcludeState(paths, options);
    if (!state) throw new Error('Expected a state');
    return state;
  };

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
