import {
  Digit,
  KeyChar,
  LowerLetter,
  Separator,
  UpperLetter,
} from './charTypes';
import type { ACRONYM_PLURAL_SUFFIX } from '../constants/acronymPlural';
import { IsStringLiteral } from './helperTypes';
import { StringCase } from './stringCaseTypes';

/**
 * Type-level mirror of the runtime key transformation (`transformCase`).
 *
 * Every step below follows a runtime function, so the type of a transformed key is
 * exactly the key the runtime produces. The parity test (`typeRuntimeParity.test.ts`)
 * checks this for thousands of keys.
 */

/**
 * `true` when every character of `S` may appear in a transformable key
 * (tail-recursive, so long keys compile).
 */
type HasOnlyKeyChars<S extends string> = S extends `${infer C}${infer Rest}`
  ? C extends KeyChar
    ? HasOnlyKeyChars<Rest>
    : false
  : true;

/**
 * Keys the runtime leaves unchanged (`prepareStringTransformation`): keys containing a
 * character outside `A-Z a-z 0-9 _ -`, keys not starting with a letter and keys ending
 * with a separator.
 */
type IsPreservedKey<K extends string> =
  HasOnlyKeyChars<K> extends false
    ? true
    : K extends `${LowerLetter | UpperLetter}${string}`
      ? K extends `${string}${Separator}`
        ? true
        : false
      : true;

/**
 * The case the runtime detects for a key that is not preserved (`detectStringCase`), or
 * `'none'` when it cannot be detected (the key is then left unchanged). A string is used
 * rather than `null`, which every type accepts without `strictNullChecks`.
 */
type DetectedCase<K extends string> = K extends `${string}${Separator}${string}`
  ? // snake_case and kebab-case keys are lowercase, with one kind of separator, never doubled
    K extends Lowercase<K>
    ? K extends `${string}-${string}`
      ? K extends `${string}_${string}` | `${string}--${string}`
        ? 'none'
        : 'kebab'
      : K extends `${string}__${string}`
        ? 'none'
        : 'snake'
    : 'none'
  : K extends `${infer First}${infer Rest}`
    ? Rest extends Lowercase<Rest>
      ? 'single'
      : First extends LowerLetter
        ? 'camel'
        : K extends Uppercase<K>
          ? 'none' // written only in capitals (`ID`, `USD`): not PascalCase (`isPascalCase`)
          : 'pascal'
    : 'none';

/** The first character of `S`, or `''` */
type FirstChar<S extends string> = S extends `${infer C}${string}` ? C : '';

/**
 * Whether a new word starts at `C`, followed by `Rest` (`isWordBoundary`): `C` is
 * uppercase and follows a lowercase letter or digit, or it ends an acronym that starts a
 * new word (two uppercase letters before it, a lowercase letter after it) — unless that
 * letter is a plural `s` not followed by another lowercase letter.
 */
type IsWordBoundary<
  C extends string,
  Prev extends string,
  PrevPrev extends string,
  Rest extends string,
> = C extends UpperLetter
  ? Prev extends LowerLetter | Digit
    ? true
    : Prev extends UpperLetter
      ? PrevPrev extends UpperLetter
        ? Rest extends `${infer Next}${infer AfterNext}`
          ? Next extends LowerLetter
            ? Next extends typeof ACRONYM_PLURAL_SUFFIX
              ? FirstChar<AfterNext> extends LowerLetter
                ? true
                : false
              : true
            : false
          : false
        : false
      : false
  : false;

/** camelCase/PascalCase to snake_case or kebab-case, acronym-aware (`toSeparatedCase`) */
type ToSeparatedCase<
  S extends string,
  Sep extends Separator,
  Prev extends string = '',
  PrevPrev extends string = '',
  Acc extends string = '',
> = S extends `${infer C}${infer Rest}`
  ? ToSeparatedCase<
      Rest,
      Sep,
      C,
      Prev,
      `${Acc}${IsWordBoundary<C, Prev, PrevPrev, Rest> extends true
        ? Sep
        : ''}${Lowercase<C>}`
    >
  : Acc;

/**
 * Lowercases the first word, up to the first word boundary, so a leading acronym is
 * lowercased as a whole
 */
type LowercaseFirstWord<
  S extends string,
  Prev extends string = '',
  PrevPrev extends string = '',
  Acc extends string = '',
> = S extends `${infer C}${infer Rest}`
  ? IsWordBoundary<C, Prev, PrevPrev, Rest> extends true
    ? `${Acc}${S}`
    : LowercaseFirstWord<Rest, C, Prev, `${Acc}${Lowercase<C>}`>
  : Acc;

/**
 * PascalCase to camelCase (`pascalToCamelCase`): two capitals followed by a lowercase
 * letter start with a one-letter word (`XAxis` -> `xAxis`), unless that letter is a
 * plural `s` ending the acronym (`IDs` -> `ids`); otherwise the first word is lowercased
 * as a whole (`HTTPRequest` -> `httpRequest`)
 */
type PascalToCamelCase<S extends string> =
  S extends `${infer A}${infer B}${infer C}${infer Rest}`
    ? [A, B, C] extends [UpperLetter, UpperLetter, LowerLetter]
      ? C extends typeof ACRONYM_PLURAL_SUFFIX
        ? FirstChar<Rest> extends LowerLetter
          ? Uncapitalize<S>
          : LowercaseFirstWord<S>
        : Uncapitalize<S>
      : LowercaseFirstWord<S>
    : LowercaseFirstWord<S>;

/** snake_case/kebab-case to camelCase (`snakeToCamelCase`, `kebabToCamelCase`) */
type SeparatedToCamelCase<
  S extends string,
  Sep extends Separator,
  Acc extends string = '',
> = S extends `${infer Word}${Sep}${infer Next}${infer Rest}`
  ? SeparatedToCamelCase<Rest, Sep, `${Acc}${Word}${Uppercase<Next>}`>
  : `${Acc}${S}`;

/** Replaces every `From` separator with `To` (`snakeToKebabCase`, `kebabToSnakeCase`) */
type ReplaceSeparator<
  S extends string,
  From extends Separator,
  To extends Separator,
  Acc extends string = '',
> = S extends `${infer Head}${From}${infer Rest}`
  ? ReplaceSeparator<Rest, From, To, `${Acc}${Head}${To}`>
  : `${Acc}${S}`;

/** A single word in the target case (`transformSingleWord`) */
type SingleWordToCase<
  K extends string,
  To extends StringCase,
> = To extends 'pascal'
  ? Capitalize<K>
  : To extends 'camel'
    ? Uncapitalize<K>
    : Lowercase<K>;

/** A key of the detected case `From` in the target case (`formatterMap`) */
type FormatKey<
  K extends string,
  From extends StringCase,
  To extends StringCase,
> = From extends To
  ? K
  : From extends 'snake' | 'kebab'
    ? To extends 'camel'
      ? SeparatedToCamelCase<K, From extends 'snake' ? '_' : '-'>
      : To extends 'pascal'
        ? Capitalize<SeparatedToCamelCase<K, From extends 'snake' ? '_' : '-'>>
        : From extends 'snake'
          ? ReplaceSeparator<K, '_', '-'>
          : ReplaceSeparator<K, '-', '_'>
    : To extends 'pascal'
      ? Capitalize<K>
      : To extends 'camel'
        ? PascalToCamelCase<K>
        : ToSeparatedCase<K, To extends 'snake' ? '_' : '-'>;

/** Applies the detected case of `K` (`transformCase`) */
type TransformDetectedKey<
  K extends string,
  Detected,
  To extends StringCase,
> = Detected extends 'single'
  ? SingleWordToCase<K, To>
  : Detected extends StringCase
    ? FormatKey<K, Detected, To>
    : K;

/**
 * The key a string key `K` becomes when transformed to `To`. A `string` or
 * template-literal key cannot be known exactly, so it becomes `string`.
 */
export type TransformKey<K extends string, To extends StringCase> =
  IsStringLiteral<K> extends false
    ? string
    : K extends ''
      ? K
      : IsPreservedKey<K> extends true
        ? K
        : TransformDetectedKey<K, DetectedCase<K>, To>;
