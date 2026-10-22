/**
 * Compile-time assertion helpers for the published-types tests in this folder.
 * `tsc` fails when an `Expect<...>` receives `false`.
 */
export type Expect<T extends true> = T;

export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
