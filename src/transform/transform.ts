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
