import {
  Digit,
  HexDigit,
  KeyChar,
  LowerLetter,
  Separator,
  UpperLetter,
} from './charTypes';
import type { ACRONYM_PLURAL_SUFFIX } from '../constants/acronymPlural';
import { IsStringLiteral } from './helperTypes';
import { PlainCase, StringCase } from './stringCaseTypes';

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

/** The canonical UUID form, where `x` stands for a hexadecimal digit (`isUuid`) */
type UuidPattern = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

/**
 * `true` when `S` is a UUID in canonical form. `S` is compared with `UuidPattern` one
 * character at a time, stopping at the first character that does not fit, so long keys
 * stay cheap.
 */
type IsUuid<
  S extends string,
  Pattern extends string = UuidPattern,
> = Pattern extends `${infer P}${infer PatternRest}`
  ? S extends `${infer C}${infer Rest}`
    ? C extends (P extends 'x' ? HexDigit : P)
      ? IsUuid<Rest, PatternRest>
      : false
    : false
  : S extends ''
    ? true
    : false;

/**
 * Keys the runtime leaves unchanged (`transformCase`): keys containing a
 * character outside `A-Z a-z 0-9 _ -`, keys not starting with a letter, keys ending with
 * a separator, and UUIDs. A UUID that starts with a digit is already preserved, so only
 * keys that the other rules do not preserve are compared with the UUID form.
 */
type IsPreservedKey<K extends string> =
  HasOnlyKeyChars<K> extends false
    ? true
    : K extends `${LowerLetter | UpperLetter}${string}`
      ? K extends `${string}${Separator}`
        ? true
        : IsUuid<K>
      : true;

/**
 * The case the runtime detects for a key that is not preserved (`transformCase`), or
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
          ? 'none' // written only in capitals (`ID`, `USD`): not PascalCase (`transformCase`)
          : 'pascal'
    : 'none';

/** The first character of `S`, or `''` */
type FirstChar<S extends string> = S extends `${infer C}${string}` ? C : '';

/**
 * Whether a new word starts at `C`, followed by `Rest` (`isWordBoundary`): `C` is
 * uppercase and follows a lowercase letter or digit, or it follows an uppercase letter
 * and comes before a lowercase letter, so the capitals before it are an acronym or a
 * one-letter word — unless that lowercase letter is a plural `s` not followed by another
 * lowercase letter.
 */
type IsWordBoundary<
  C extends string,
  Prev extends string,
  Rest extends string,
> = C extends UpperLetter
  ? Prev extends LowerLetter | Digit
    ? true
    : Prev extends UpperLetter
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
  : false;

/** camelCase/PascalCase to snake_case or kebab-case, acronym-aware (`toSeparatedCase`) */
type ToSeparatedCase<
  S extends string,
  Sep extends Separator,
  Prev extends string = '',
  Acc extends string = '',
> = S extends `${infer C}${infer Rest}`
  ? ToSeparatedCase<
      Rest,
      Sep,
      C,
      `${Acc}${IsWordBoundary<C, Prev, Rest> extends true
        ? Sep
        : ''}${Lowercase<C>}`
    >
  : Acc;

/**
 * PascalCase to camelCase (`pascalToCamelCase`): lowercases the first word, up to the
 * first word boundary, so a leading acronym is lowercased as a whole
 * (`HTTPRequest` -> `httpRequest`) and a leading one-letter word on its own
 * (`XAxis` -> `xAxis`)
 */
type PascalToCamelCase<
  S extends string,
  Prev extends string = '',
  Acc extends string = '',
> = S extends `${infer C}${infer Rest}`
  ? IsWordBoundary<C, Prev, Rest> extends true
    ? `${Acc}${S}`
    : PascalToCamelCase<Rest, C, `${Acc}${Lowercase<C>}`>
  : Acc;

/** snake_case/kebab-case to camelCase (`separatedToCamelCase`) */
type SeparatedToCamelCase<
  S extends string,
  Sep extends Separator,
  Acc extends string = '',
> = S extends `${infer Word}${Sep}${infer Next}${infer Rest}`
  ? SeparatedToCamelCase<Rest, Sep, `${Acc}${Word}${Uppercase<Next>}`>
  : `${Acc}${S}`;

/** Replaces every `From` separator with `To` (`replaceSeparator`) */
type ReplaceSeparator<
  S extends string,
  From extends Separator,
  To extends Separator,
  Acc extends string = '',
> = S extends `${infer Head}${From}${infer Rest}`
  ? ReplaceSeparator<Rest, From, To, `${Acc}${Head}${To}`>
  : `${Acc}${S}`;

/** A single word in the target case (`singleWordToCase`) */
type SingleWordToCase<
  K extends string,
  To extends StringCase,
> = To extends 'pascal'
  ? Capitalize<K>
  : To extends 'camel'
    ? Uncapitalize<K>
    : Lowercase<K>;

/** A key of the detected case `From` in the target case (the formatters `transformCase` picks) */
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
 * One key `K` (not a union) transformed to one plain target case `To`. A `string` or
 * template-literal key cannot be known exactly, so it becomes `string`.
 */
type TransformOneKey<K extends string, To extends StringCase> =
  IsStringLiteral<K> extends false
    ? string
    : K extends ''
      ? K
      : IsPreservedKey<K> extends true
        ? K
        : TransformDetectedKey<K, DetectedCase<K>, To>;

/**
 * One key `K` transformed to each member of a union of plain target cases `To`.
 *
 * Use `TransformKey` instead. This type is exported only so that declaration files can
 * refer to it: for a fixed key and a generic target case, as in
 * `<C extends StringCase>(targetCase: C) => transformKey('created_by_id', { targetCase })`,
 * the key type is written in terms of it. Without a name to refer to, the compiler
 * writes out its recursive steps, and gets them wrong.
 */
export type TransformKeyToEach<
  K extends string,
  To extends StringCase,
> = To extends StringCase ? TransformOneKey<K, To> : never;

/**
 * The key a string key `K` becomes when transformed to `To` (default `'camel'`), as
 * `transformKey` returns it. A `string` or template-literal key cannot be known exactly,
 * so it becomes `string`. A union of keys or of target cases gives the union of their
 * results, and a string enum member or branded literal stands for its case.
 *
 * @example
 * ```typescript
 * type Column = TransformKey<'createdAt' | 'userID', 'snake'>;
 * // => 'created_at' | 'user_id'
 * ```
 */
export type TransformKey<
  K extends string,
  To extends StringCase = 'camel',
> = K extends string ? TransformKeyToEach<K, PlainCase<To>> : never;
