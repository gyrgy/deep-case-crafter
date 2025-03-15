/**
 * Determines whether the given string qualifies as a single word.
 *
 * A string is considered a "single word" if:
 * - It does not contain any delimiters such as underscores (`_`), hyphens (`-`), or spaces.
 * - It contains only alphanumeric characters (letters and digits). Any other character (e.g., punctuation) will cause it to be considered as not a single word.
 * - For strings longer than one character:
 *    - If the entire string is lowercase, it's considered a single word.
 *    - If the string starts with an uppercase letter and the rest are lowercase, it's considered a single word.
 * - Single-character strings and empty strings are treated as a single word.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} Returns `true` if the input string qualifies as a single word, otherwise returns `false`.
 *
 * @example
 * // Returns true because "hello" is a single word (all lowercase).
 * detectSingleWord("hello");
 *
 * @example
 * // Returns true because "Hello" is considered a single word (capitalized first letter only).
 * detectSingleWord("Hello");
 *
 * @example
 * // Returns false because "hello_world" contains an underscore.
 * detectSingleWord("hello_world");
 *
 * @example
 * // Returns false because "hello world" contains a space.
 * detectSingleWord("hello world");
 *
 * @example
 * // Returns false because "hello@world" contains a special character.
 * detectSingleWord("hello@world");
 *
 * @internal This function is for internal use by the library
 */
export default function detectSingleWord(str: string): boolean {
  // Reject strings containing common delimiters or non-alphanumeric characters.
  if (str.includes('_') || str.includes('-') || str.includes(' ')) return false;
  if (str.length > 0 && !/^[A-Za-z0-9]+$/.test(str)) return false;

  // For empty strings or one-character strings, consider them as a single word.
  if (str.length <= 1) return true;

  const first = str[0];
  const rest = str.slice(1);

  // If the entire string is lowercase, it's a single word.
  if (str === str.toLowerCase()) return true;
  // If the first character is uppercase and the rest are lowercase, it's a single word.
  if (first === first.toUpperCase() && rest === rest.toLowerCase()) return true;

  // Otherwise, the string is likely formatted as camelCase or PascalCase (i.e., multi-word).
  return false;
}
