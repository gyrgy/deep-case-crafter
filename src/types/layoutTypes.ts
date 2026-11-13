/**
 * The layouts of the wide results of one call or, with `exclude`, of one set of matching
 * paths, whose options hold a memory of their own ("the call" below). A function made by
 * `transformTo` keeps its memories across its calls instead (see `LayoutStore`). Each
 * layout is looked up by its number of keys and its last key, which are cheap to track,
 * and compared key by key before it is learned.
 */
export interface LayoutMemory {
  /**
   * Whether the call has stopped learning: a result had the number of keys and the last
   * key of a layout seen once in the call, but other keys, as records that come in many
   * shapes, with optional keys present or left out, have. Such data reads faster when all
   * of it stays in dictionary mode. A memory of one call also stops once it has learned
   * `MAX_LAYOUTS` layouts. In a memory of one call, a result with the number of keys and
   * the last key of a layout learned in the call is not compared: it stops nothing, and
   * stays in dictionary mode if its keys differ.
   */
  done: boolean;

  /**
   * For a memory kept across calls: whether the function has stopped using it, because it
   * has learned `MAX_LAYOUTS` layouts in the function's calls, or because a result had the
   * number of keys and the last key of a layout from an earlier call, but other keys. The
   * rest of the call learns with a memory of its own, and the function's later calls learn
   * on their own, as calls to `transform` do.
   */
  replaced: boolean;

  /**
   * Layouts seen once, in a ring of `LAYOUT_CANDIDATES`: number of keys, last key, and
   * the result. Once its call has returned, a memory kept across calls holds the result's
   * keys, symbols included, if the layout came up in an earlier call too, and `null`
   * otherwise: a layout seen in one call only, such as that of an object keyed by IDs,
   * costs no copy of its keys (see `forgetResults`).
   */
  readonly seenWidths: number[];
  readonly seenKeys: string[];
  readonly seenResults: (object | readonly (string | symbol)[] | null)[];
  nextSeen: number;

  /**
   * Whether the result in `seenResults` took the place of `null` there, a layout seen in
   * an earlier call: its keys are kept when the call returns
   */
  readonly seenAgain: boolean[];

  /** Layouts learned in the call or, for a memory kept across calls, in any of them */
  readonly fastWidths: number[];
  readonly fastKeys: string[];

  /**
   * One fast object of each of those layouts, kept as long as the memory: V8 drops the
   * hidden classes of a layout that no object uses any more. It holds no data (see
   * `copyLayout`), in a memory of one call from the layout's third result in the call, or
   * from when the call stops learning (see `emptyCopies`).
   */
  readonly fastObjects: object[];

  /**
   * For a memory kept across calls: the keys of each layout learned, symbols included,
   * which the first result of that layout in a call is compared with (see `checkLayout`)
   */
  readonly fastKeyLists: (readonly (string | symbol)[])[];

  /**
   * For a memory kept across calls: whether each layout learned has been checked in the
   * call. For a memory of one call: whether its copy has been emptied (see `learnLayout`).
   */
  readonly checked: boolean[];

  /** For a memory kept across calls: how many times `checkLayout` has checked each layout */
  readonly checks: number[];

  /**
   * For a memory kept across calls: the list of the memories of its `LayoutStore` that a
   * call that has not returned yet has used, emptied by `forgetResults` when it returns.
   * `null` for a memory of one call.
   */
  readonly toForget: LayoutMemory[] | null;

  /** Whether `toForget` lists this memory */
  listed: boolean;
}

/**
 * The layout memories of a function made by `transformTo`, kept across its calls: one for
 * the values that no `exclude` path reaches, and one for each set of matching paths, as a
 * call has. Once a call has returned, they hold none of its data (see `forgetResults`).
 */
export interface LayoutStore {
  /** The memory of the values that no `exclude` path reaches */
  readonly plain: LayoutMemory;

  /** The memories of the values that `exclude` paths reach, by `JSON.stringify(paths)` */
  readonly byPaths: Map<string, LayoutMemory>;

  /** The memories that a call that has not returned yet has used */
  readonly toForget: LayoutMemory[];
}
