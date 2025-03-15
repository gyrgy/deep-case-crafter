import { StringCase } from '../types/stringCaseTypes';

/**
 * Transforms a single word to the target case format
 * @param str - The single word to transform
 * @param targetCase - The target case format
 * @returns The transformed string
 */
export default function transformSingleWord(
  str: string,
  targetCase: StringCase,
): string {
  switch (targetCase) {
    case 'pascal':
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    case 'camel':
      return str.charAt(0).toLowerCase() + str.slice(1);
    case 'snake':
    case 'kebab':
      return str.toLowerCase();
    default:
      return str;
  }
}
