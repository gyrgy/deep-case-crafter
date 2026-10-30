import { StringCase } from '../../types/stringCaseTypes';
import isUpperCaseCode from '../charDetectors/isUpperCaseCode';

/**
 * Converts a single word, in lowercase or with only its first letter in capitals, to the
 * target case: capitalized for PascalCase, in capitals for CONSTANT_CASE, lowercase
 * otherwise. Mirrored by `SingleWordToCase` in `types/keyTypes.ts`.
 *
 * @param word - The word, such as `user`, `User` or `item2`
 * @param targetCase - The target case
 * @returns The word in the target case
 *
 * @example
 * ```typescript
 * singleWordToCase('user', 'pascal') // => 'User'
 * singleWordToCase('User', 'snake') // => 'user'
 * singleWordToCase('user', 'constant') // => 'USER'
 * ```
 * @internal This function is for internal use by the library
 */
export default function singleWordToCase(
  word: string,
  targetCase: StringCase,
): string {
  const capitalized = isUpperCaseCode(word.charCodeAt(0));
  switch (targetCase) {
    case 'pascal':
      return capitalized ? word : word[0].toUpperCase() + word.slice(1);
    case 'camel':
      return capitalized ? word[0].toLowerCase() + word.slice(1) : word;
    case 'constant':
      return word.toUpperCase();
    default:
      return capitalized ? word.toLowerCase() : word;
  }
}
