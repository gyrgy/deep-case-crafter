import { TransformOptionsInternal } from '../types/transformOptionTypes';
import createExcludeState from './exclude/createExcludeState';
import internalTransform from './internalTransform';

/**
 * Transforms `data` with the resolved options and the `exclude` option as passed
 *
 * @param data - The data passed to `transform`
 * @param internalOptions - The resolved options, with `exclude` set to `null`
 * @param exclude - The `exclude` option, as passed to `transform`
 * @returns The transformed data
 * @internal This function is for internal use by the library
 */
export default function runTransform(
  data: unknown,
  internalOptions: TransformOptionsInternal,
  exclude: unknown,
): unknown {
  const excludeState =
    exclude === undefined ? null : createExcludeState(exclude, internalOptions);

  return excludeState === null
    ? internalTransform(data, internalOptions)
    : internalTransform(data, excludeState.options, excludeState.visitedRefs);
}
