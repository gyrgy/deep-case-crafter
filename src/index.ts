// Export the main transform function, and transformKey for a single key, as named exports.
export { default as transform } from './transform/transform';
export { default as transformKey } from './transform/transformKey';

// Export minimal necessary types
export type { TransformKey } from './types/keyTypes';
export type { StringCase } from './types/stringCaseTypes';
export type {
  TransformKeyOptions,
  TransformOptions,
} from './types/transformOptionTypes';
export type { TransformResult } from './types/transformTypes';

// Not meant to be used directly: exported so that declaration files of generic code
// around `transform` and `transformKey` can refer to them instead of expanding them
// without end, or writing out the list of target cases
export type { TransformKeyToEach } from './types/keyTypes';
export type { PlainCase } from './types/stringCaseTypes';
export type { CaseOrDefault } from './types/transformOptionTypes';
export type {
  TransformResultFor,
  TransformResultForExcluding,
  TransformValue,
  TransformValueExcluding,
} from './types/transformTypes';
