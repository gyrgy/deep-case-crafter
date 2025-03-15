import { StringCase } from '../types/stringCaseTypes';
import isCamelCase from './caseDetectors/isCamelCase';
import { isKebabCase } from './caseDetectors/isKebabCase';
import isPascalCase from './caseDetectors/isPascalCase';
import isSnakeCase from './caseDetectors/isSnakeCase';
import detectSingleWord from './detectSingleWord';

/**
 * Detects the case format of a string
 * @param str - The string to analyze
 * @returns The detected case format, 'single' for single words, or null if format cannot be determined
 *
 * @example
 * ```typescript
 * detectStringCase('hello_world') // => 'snake'
 * detectStringCase('helloWorld') // => 'camel'
 * detectStringCase('HelloWorld') // => 'pascal'
 * detectStringCase('hello-world') // => 'kebab'
 * detectStringCase('hello') // => 'single'
 * ```
 * @internal This function is for internal use by the library
 */
export default function detectStringCase(
  str: string,
): StringCase | 'single' | null {
  if (typeof str !== 'string') return null;

  if (detectSingleWord(str)) {
    return 'single';
  }

  if (isSnakeCase(str)) return 'snake';
  if (isCamelCase(str)) return 'camel';
  if (isPascalCase(str)) return 'pascal';
  if (isKebabCase(str)) return 'kebab';

  return null;
}
