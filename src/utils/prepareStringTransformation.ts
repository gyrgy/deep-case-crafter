import detectStringCase from './detectStringCase';
import { StringCase } from '../types/stringCaseTypes';

/**
 * Internal type used by string preparation utility
 * Not exported as it's an implementation detail
 */
interface StringPreparationResult {
  string: string;
  shouldTransform: boolean;
  sourceCase: StringCase | null;
  singleWord: boolean;
}

/**
 * Prepares a string for case transformation by validating input
 * @param str - The input string to prepare
 * @returns StringPreparationResult object containing the processed parts
 * @throws {Error} If the input is not a string
 * @internal This function is for internal use by the library
 */
export function prepareStringTransformation(
  str: string,
): StringPreparationResult {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }

  // Early return for empty strings
  if (str.length === 0) {
    return {
      string: str,
      shouldTransform: false,
      sourceCase: null,
      singleWord: false,
    };
  }

  // Check if the string contains any characters that would make it
  // incompatible with our supported case formats
  if (
    /[^A-Za-z0-9_-]/.test(str) || // Disallow unsupported characters (excluding letters, numbers, underscores, hyphens)
    /^[^A-Za-z]/.test(str) || // Disallow strings starting with anything other than a letter
    /[^A-Za-z0-9]$/.test(str) // Disallow strings ending with non-alphanumeric characters
  ) {
    return {
      string: str,
      shouldTransform: false,
      sourceCase: null,
      singleWord: false,
    };
  }

  const sourceCase = detectStringCase(str);
  if (!sourceCase) {
    return {
      string: str,
      shouldTransform: false,
      sourceCase: null,
      singleWord: false,
    };
  }

  if (sourceCase === 'single') {
    return {
      string: str,
      shouldTransform: true,
      sourceCase: null,
      singleWord: true,
    };
  }

  return {
    string: str,
    shouldTransform: true,
    sourceCase,
    singleWord: false,
  };
}
