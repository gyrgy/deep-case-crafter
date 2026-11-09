import { ExcludeState, ExcludeStep } from '../../types/excludeStateTypes';

/**
 * The step for a key of an object or a Map. Only `*` matches a Map key that is not a
 * string.
 *
 * @internal This function is for internal use by the library
 */
export default function excludeStep(
  state: ExcludeState,
  key: unknown,
): ExcludeStep {
  const step = typeof key === 'string' ? state.named.get(key) : undefined;
  return step ?? state.other;
}
