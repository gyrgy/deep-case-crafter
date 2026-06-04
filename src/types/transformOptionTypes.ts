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
   * The source casing format.
   *
   * This is a **type-level assertion only**, used (together with `targetCase`) to
   * produce precise output types. It does **not** change runtime behavior: at runtime
   * every key's case is auto-detected individually whether or not `sourceCase` is set.
   *
   * Because of that, the precise types are accurate only for keys that are genuinely
   * well-formed in the declared source case. For ambiguous keys — mixed case
   * (`mixed_Case`), SCREAMING_SNAKE (`FOO_BAR`), mixed separators (`a_b-c`), or
   * non-ASCII (`café_table`) — the runtime preserves the key unchanged, while the type
   * may show it transformed. Set `sourceCase` only when your keys really are that case.
   *
   * When omitted, the result type is `unknown` (the runtime still auto-detects each key).
   *
   * @example
   * // Precise types when both are set and keys are well-formed snake_case:
   * const result = transform(data, { targetCase: 'camel', sourceCase: 'snake' });
   *
   * @default undefined
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
