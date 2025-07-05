import internalTransform from './internalTransform';
import { StringCase } from '../types/stringCaseTypes';
import {
  TransformOptions,
  TransformOptionsInternal,
} from '../types/transformOptionTypes';
import { TransformRecursive } from '../types/transformTypes';

// Overloads with defined source and target cases
function transform<T, From extends StringCase, To extends StringCase>(
  data: T,
  options: TransformOptions & {
    depth?: number;
    sourceCase: From;
    targetCase: To;
  },
): TransformRecursive<T, From, To>;

/**
 * Transform data to a specified output type.
 *
 * Note: When using this overload, type safety is not enforced between the input, options, and output type.
 * The 'sourceCase' option is intentionally omitted, as it is not used for type inference here.
 */
function transform<T, K>(
  data: T,
  options?: Omit<TransformOptions, 'sourceCase'> & { depth?: number },
): K;

// Default case (no options or just targetCase specified)
function transform<T>(
  data: T,
  options?: TransformOptions & { depth?: number },
): unknown;

// Implementation
function transform<T>(
  data: T,
  options?: TransformOptions & { depth?: number },
): unknown {
  const internalOptions = {
    ...options,
    targetCase: options?.targetCase || 'camel',
    depth: options?.depth ?? 3,
  } as TransformOptionsInternal & { depth?: number };

  return internalTransform(data, internalOptions);
}

export default transform;
