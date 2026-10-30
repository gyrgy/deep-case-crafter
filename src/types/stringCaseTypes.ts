/**
 * Represents the supported string case formats for transformation. `'constant'` is
 * CONSTANT_CASE (`USER_ID`), a target case only: keys such as `USER_ID` are left
 * unchanged by every target case.
 */
export type StringCase = 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant';

/**
 * The plain literal of a target case: a string enum member or a branded literal such as
 * `'snake' & { __brand: 'Case' }` becomes `'snake'`, so it compares equal to the case
 * detected from a key. Only literals are produced, never `To` itself: TypeScript 4.7
 * narrows `To` to `To & StringCase` in a true branch, which is `never` for an enum member.
 *
 * Not meant to be used directly. It is exported so that declaration files of code with a
 * generic target case refer to it instead of writing out the list of target cases, which
 * would leave out cases added later.
 */
export type PlainCase<To> = To extends 'camel'
  ? 'camel'
  : To extends 'snake'
    ? 'snake'
    : To extends 'kebab'
      ? 'kebab'
      : To extends 'pascal'
        ? 'pascal'
        : To extends 'constant'
          ? 'constant'
          : never;
