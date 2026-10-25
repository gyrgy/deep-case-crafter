/**
 * Represents the supported string case formats for transformation
 */
export type StringCase = 'camel' | 'pascal' | 'snake' | 'kebab';

/**
 * The plain literal of a target case: a string enum member or a branded literal such as
 * `'snake' & { __brand: 'Case' }` becomes `'snake'`, so it compares equal to the case
 * detected from a key. Only literals are produced, never `To` itself: TypeScript 4.7
 * narrows `To` to `To & StringCase` in a true branch, which is `never` for an enum member.
 */
export type PlainCase<To> = To extends 'camel'
  ? 'camel'
  : To extends 'snake'
    ? 'snake'
    : To extends 'kebab'
      ? 'kebab'
      : To extends 'pascal'
        ? 'pascal'
        : never;
