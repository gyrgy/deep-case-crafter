/**
 * Character classes used by the type-level key transformation. They spell out the
 * ASCII characters explicitly, because TypeScript's `Uppercase`/`Lowercase` are
 * Unicode-aware and would treat a letter like `é` as an ordinary letter.
 */

/** Lowercase ASCII letters */
export type LowerLetter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

/** Uppercase ASCII letters */
export type UpperLetter = Uppercase<LowerLetter>;

/** ASCII digits */
export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** The letters of hexadecimal digits */
type HexLetter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

/** Hexadecimal digits, in either case */
export type HexDigit = Digit | HexLetter | Uppercase<HexLetter>;

/** The word separators of snake_case and kebab-case */
export type Separator = '_' | '-';

/** Every character a transformable key may contain (the runtime's `A-Z a-z 0-9 _ -`) */
export type KeyChar = LowerLetter | UpperLetter | Digit | Separator;
