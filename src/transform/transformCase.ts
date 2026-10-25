import formatterMap from '../constants/formatterMap';
import transformSingleWord from '../dataTransformers/transformSingleWord';
import { StringCase } from '../types/stringCaseTypes';
import { prepareStringTransformation } from '../utils/prepareStringTransformation';

/**
 * Transforms a string from one case format to another.
 * The source case is always detected from the string itself.
 *
 * @param str - The string to transform
 * @param targetCase - The target case format to transform to
 *
 * @returns The transformed string, or the original string if transformation is not possible
 *
 * @example
 * transformCase('hello_world', 'camel')
 * // => 'helloWorld'
 *
 * transformCase('HelloWorld', 'snake')
 * // => 'hello_world'
 *
 * @internal This function is for internal use by the library
 */
export default function transformCase(
  str: string,
  targetCase: StringCase,
): string {
  if (!str) return str;

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

  // Apply the formatter for the detected source case to the string
  return formatterMap[sourceCase][targetCase](string);
}
