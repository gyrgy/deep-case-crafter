import { NESTING_LIMIT_REACHED } from '../constants/referenceTables';
import { StringCase } from '../types/stringCaseTypes';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import createExcludeState from './exclude/createExcludeState';
import internalTransform from './internalTransform';

/**
 * Transforms `data` with options that `transform` or `transformTo` has resolved. With
 * `keepReferences` false, data nested too deep to transform without reference tables, as
 * circular references are, is transformed again from the start with them.
 *
 * @param data - The data to transform
 * @param targetCase - The target case
 * @param depth - How many nesting levels to transform (`Infinity` for all of them)
 * @param keepReferences - Whether shared and circular references are kept
 * @param exclude - The `exclude` paths, checked, sorted and without repeats (see
 * `resolveExclude`), or `null` for none
 * @returns The transformed data
 * @internal This function is for internal use by the library
 */
export default function runTransform(
  data: unknown,
  targetCase: StringCase,
  depth: number,
  keepReferences: boolean,
  exclude: readonly string[] | null,
): unknown {
  let tracked = keepReferences;
  for (;;) {
    const options: TransformOptionsInternal = {
      targetCase,
      depth,
      keepReferences: tracked,
      exclude: null,
      layouts: null,
    };
    const excludeState =
      exclude === null ? null : createExcludeState(exclude, options);
    try {
      return excludeState === null
        ? internalTransform(data, options)
        : internalTransform(
            data,
            excludeState.options,
            excludeState.visitedRefs,
          );
    } catch (error) {
      // Nested too deep to go on without reference tables, as circular references are:
      // start over with them
      if (tracked || error !== NESTING_LIMIT_REACHED) throw error;
      tracked = true;
    }
  }
}
