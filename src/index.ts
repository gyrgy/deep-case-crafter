// Export the main transform function as a named export.
export { default as transform } from './transform/transform';

// Export minimal necessary types
export type { StringCase } from './types/stringCaseTypes';
export type { TransformOptions } from './types/transformOptionTypes';
export type { TransformResult } from './types/transformTypes';

// Not meant to be used directly: exported so that declaration files of generic code
// around `transform` can refer to them instead of expanding them without end
export type {
  TransformResultFor,
  TransformValue,
} from './types/transformTypes';
