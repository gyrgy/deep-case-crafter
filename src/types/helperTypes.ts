/**
 * `true` when `T` is `any`: a conditional type checked against `any` takes both branches,
 * so only `any` turns `true | false` into `boolean`.
 *
 * Two shorter checks are not used. `0 extends 1 & T` is `false` since TypeScript 5.4 for
 * a type parameter whose constraint excludes `1` (such as `To` in `transform`), even when
 * `any` is passed for it. `unknown extends T` is `true` without `strictNullChecks` for an
 * object type whose properties are all optional (such as `{ targetCase?: 'kebab' }`).
 */
export type IsAny<T> = boolean extends (T extends never ? true : false)
  ? true
  : false;

/**
 * `true` when `S` is a single string literal such as `'user_id'`, and `false` for
 * `string` and template-literal patterns such as `` `user_${string}` ``.
 */
export type IsStringLiteral<S extends string> =
  Record<never, never> extends Record<S, never> ? false : true;
