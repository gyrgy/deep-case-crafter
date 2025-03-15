import transform from './transform/transform';
import { StringCase } from './types/stringCaseTypes';
import { TransformOptions } from './types/transformOptionTypes';

// Export the main transform function
export default transform;

// Export minimal necessary types
export type { StringCase, TransformOptions };
