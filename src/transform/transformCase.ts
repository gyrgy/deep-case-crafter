import formatterMap from '../constants/formatterMap';
import transformSingleWord from '../dataTransformers/transformSingleWord';
import { TransformOptionsInternal } from '../types/transformOptionTypes';
import { prepareStringTransformation } from '../utils/prepareStringTransformation';

/**
 * Transforms a string from one case format to another.
 *
 * @param str - The string to transform
 * @param options - Transformation options
 * @param options.targetCase - The target case format to transform to
 * @param options.sourceCase - Optional source case format. If provided, skips detection
 *
 * @returns The transformed string, or the original string if transformation is not possible
 *
 * @example
 * // With automatic source detection
 * transformCase('hello_world', { targetCase: 'camel' })
 * // => 'helloWorld'
 *
 * // With explicit source case
 * transformCase('HelloWorld', { targetCase: 'snake', sourceCase: 'pascal' })
 * // => 'hello_world'
 *
 * @internal This function is for internal use by the library
 */
export default function transformCase(
  str: string,
  options: TransformOptionsInternal,
): string {
  if (!str) return str;

  const { targetCase } = options;

  // Prepare the string for transformation
  const { string, shouldTransform, sourceCase, singleWord } =
    prepareStringTransformation(str);

  if (!shouldTransform) return string;

  // Handle single words with the dedicated formatter
  if (singleWord) {
    return transformSingleWord(string, targetCase);
  }

  // If sourceCase is null or already in the target format, return as is
  if (!sourceCase || sourceCase === targetCase) {
    return string;
  }

  // Check if the mapping exists for the detected source case
  const sourceMap = formatterMap[sourceCase];
  if (!sourceMap) return string;

  const formatter = sourceMap[targetCase];
  if (!formatter) return string;

  // Apply the formatter to the string
  return formatter(string);
}
