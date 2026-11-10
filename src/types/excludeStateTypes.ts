import type { LayoutStore } from './layoutTypes';
import type { ReferenceTable } from './referenceTableTypes';
import type { TransformOptionsInternal } from './transformOptionTypes';

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

/** What every `exclude` state of one `transform` call shares */
export interface ExcludeRoot {
  /** The scope of the values no path continues into: the options without `exclude` */
  readonly plain: TransformScope;
  /** The states created so far, by their paths */
  readonly states: Map<string, ExcludeState>;
  /**
   * The layout memories that a function made by `transformTo` keeps across its calls, one
   * per set of paths; `null` for `transform`, and for a function that no longer keeps them
   * (its states then start their memories empty, as `transform`'s do)
   */
  readonly store: LayoutStore | null;
}
