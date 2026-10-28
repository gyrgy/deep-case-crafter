import { EXCLUDE_PATH_REGEX } from '../constants/regex';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import describeValue from '../utils/describeValue';
import type { ReferenceTable } from './referenceTables';

/**
 * The options a value is transformed with, and the results of the objects already
 * transformed with them (`visitedRefs` in `internalTransform`).
 */
export interface TransformScope {
  readonly options: TransformOptionsInternal;
  readonly visitedRefs: ReferenceTable[];
}

/** What the `exclude` paths do with one key, and with the value under it */
export interface ExcludeStep {
  /** A path ends at the key, so the key keeps its name */
  readonly keepKey: boolean;
  /** The rest of each path that continues below the key, sorted and without repeats */
  readonly pathsBelow: readonly string[];
  /** The scope of the value under the key, created when it is first needed */
  scope: TransformScope | undefined;
}

/**
 * The `exclude` paths that match the keys leading to a value, each cut down to the part
 * below that value. Its `options` carry the state itself as `exclude`.
 *
 * Values reached with the same paths share one state, and so one result per object, as
 * values do without `exclude`. The same object reached with other paths may need another
 * result, which the state of those paths records.
 */
export interface ExcludeState extends TransformScope {
  /** The steps for the keys a path names at this level */
  readonly named: ReadonlyMap<string, ExcludeStep>;
  /** The step for any other key, which only `*` matches */
  readonly other: ExcludeStep;
  /** Shared by every state of one `transform` call */
  readonly root: ExcludeRoot;
}

interface ExcludeRoot {
  /** The scope of the values no path continues into: the options without `exclude` */
  readonly plain: TransformScope;
  /** The states created so far, by their paths */
  readonly states: Map<string, ExcludeState>;
}

/** Splits off the first key of a path: `'a.b.c'` -> `['a', 'b.c']`, `'a'` -> `['a']` */
function splitPath(path: string): readonly [string, string?] {
  const dot = path.indexOf('.');
  return dot === -1 ? [path] : [path.slice(0, dot), path.slice(dot + 1)];
}

/** The paths below a key that no path continues below */
const NO_PATHS: readonly string[] = [];

/**
 * The step for a key, from the rest of each path that matches it: `undefined` where the
 * path ends at the key
 */
function createStep(rests: readonly (string | undefined)[]): ExcludeStep {
  let keepKey = false;
  let below: string[] | undefined;
  for (const rest of rests) {
    if (rest === undefined) keepKey = true;
    else (below ??= []).push(rest);
  }
  return {
    keepKey,
    pathsBelow: below ? sortedPaths(below) : NO_PATHS,
    scope: undefined,
  };
}

/** `paths` sorted and without repeats, so that equal sets of paths are written alike */
function sortedPaths(paths: readonly string[]): readonly string[] {
  return paths.length === 1 ? paths : [...new Set(paths)].sort();
}

function createState(
  paths: readonly string[],
  root: ExcludeRoot,
): ExcludeState {
  // The rest of the paths by their first key, in one pass: `*` also matches the keys
  // that other paths name
  const anyKey: (string | undefined)[] = [];
  let restsByKey: Map<string, (string | undefined)[]> | undefined;
  for (const path of paths) {
    const [key, rest] = splitPath(path);
    if (key === '*') {
      anyKey.push(rest);
    } else {
      restsByKey ??= new Map();
      const rests = restsByKey.get(key);
      if (rests) rests.push(rest);
      else restsByKey.set(key, [rest]);
    }
  }

  const named = new Map<string, ExcludeStep>();
  for (const [key, rests] of restsByKey ?? []) {
    named.set(key, createStep(anyKey.length ? [...rests, ...anyKey] : rests));
  }

  const { targetCase, depth, keepReferences } = root.plain.options;
  const options: TransformOptionsInternal = {
    targetCase,
    depth,
    keepReferences,
    exclude: null,
  };
  const state: ExcludeState = {
    options,
    visitedRefs: [],
    named,
    other: createStep(anyKey),
    root,
  };
  options.exclude = state;
  return state;
}

/** The state for the values reached with `paths` (sorted, without repeats, not empty) */
function stateFor(paths: readonly string[], root: ExcludeRoot): ExcludeState {
  const id = JSON.stringify(paths);
  let state = root.states.get(id);
  if (!state) {
    state = createState(paths, root);
    root.states.set(id, state);
  }
  return state;
}

/**
 * Validates the `exclude` option of `transform` and creates the state for the top of the
 * data.
 *
 * @param exclude - The `exclude` option, as passed to `transform`
 * @param options - The resolved options, with `exclude` set to `null`
 * @returns The state, or `null` when there is no path (`exclude` omitted, `null` or empty)
 * @throws TypeError for anything but an array of non-empty keys joined with dots
 *
 * @example
 * ```typescript
 * createExcludeState(['users_by_id.*'], options)?.named.get('users_by_id')?.pathsBelow
 * // => ['*']
 * ```
 * @internal This function is for internal use by the library
 */
export function createExcludeState(
  exclude: unknown,
  options: TransformOptionsInternal,
): ExcludeState | null {
  if (exclude === undefined || exclude === null) return null;

  if (!Array.isArray(exclude)) {
    throw new TypeError(
      `Unsupported exclude ${describeValue(exclude)}. Use an array of paths, such as ["metadata.*"].`,
    );
  }
  for (const path of exclude) {
    if (typeof path !== 'string' || !EXCLUDE_PATH_REGEX.test(path)) {
      throw new TypeError(
        `Unsupported exclude path ${describeValue(path)}. Use non-empty keys joined with dots, such as "metadata.*".`,
      );
    }
  }

  if (exclude.length === 0) return null;

  const root: ExcludeRoot = {
    plain: { options, visitedRefs: [] },
    states: new Map(),
  };
  // Not recorded in `states`: the paths below any key are shorter than the longest path
  // here, so no other state can have the same paths
  return createState(sortedPaths(exclude), root);
}

/**
 * The step for a key of an object or a Map. Only `*` matches a Map key that is not a
 * string.
 *
 * @internal This function is for internal use by the library
 */
export function excludeStep(state: ExcludeState, key: unknown): ExcludeStep {
  const step = typeof key === 'string' ? state.named.get(key) : undefined;
  return step ?? state.other;
}

/**
 * The scope to transform the value under a step's key in: the state of the paths below
 * the key, or the plain options when no path continues there.
 *
 * @internal This function is for internal use by the library
 */
export function stepScope(
  state: ExcludeState,
  step: ExcludeStep,
): TransformScope {
  return (step.scope ??=
    step.pathsBelow.length === 0
      ? state.root.plain
      : stateFor(step.pathsBelow, state.root));
}
