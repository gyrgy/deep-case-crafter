import { StringCase } from './stringCaseTypes';

/**
 * Options for the transform function
 */
export interface TransformOptions {
  /**
   * The target casing format to transform to
   * @default 'camel'
   */
  targetCase?: StringCase;

  /**
   * The source casing format to transform from
   *
   * When specified:
   * - Provides precise TypeScript type transformations
   * - Bypasses runtime case detection (more efficient)
   * - Ensures consistent results if input has mixed casing
   *
   * When omitted:
   * - Automatic case detection is used at runtime
   * - TypeScript types will be less precise (string keys)
   * - Works with mixed case inputs (each key detected separately)
   *
   * @example
   * // With source specified - precise types
   * const result = transform(data, { targetCase: 'camel', sourceCase: 'snake' });
   * // result has exact transformed types
   *
   * // Without source - flexible runtime behavior
   * const result = transform(data, { targetCase: 'camel' });
   * // TypeScript types are more general
   *
   * @default undefined (automatic detection)
   */
  sourceCase?: StringCase;
}

/**
 * Internal options for transformation (used within the package).
 * Ensures required fields are set after defaults are applied.
 */
export type TransformOptionsInternal = Required<
  Pick<TransformOptions, 'targetCase'>
> &
  Omit<TransformOptions, 'targetCase'>;
