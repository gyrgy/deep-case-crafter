/**
 * Compile-time type tests for `transformKey` and the `TransformKey` type: what result
 * type each way of passing a key and options produces. These calls are type-checked,
 * never executed. See preservedKey.type-test.ts.
 */
import transformKey from '../transform/transformKey';
import type { TransformKey } from '../types/keyTypes';
import type { StringCase } from '../types/stringCaseTypes';
import type { TransformKeyOptions } from '../types/transformOptionTypes';
import type { Equal, Expect } from './typeAssertions';

type AnyCase = 'userId' | 'user_id' | 'user-id' | 'UserId' | 'USER_ID';

// The transformed key, camelCase by default
const _defaultResult = transformKey('user_id');
export type _default = Expect<Equal<typeof _defaultResult, 'userId'>>;

const _snakeResult = transformKey('userID', { targetCase: 'snake' });
export type _snake = Expect<Equal<typeof _snakeResult, 'user_id'>>;

const _constantResult = transformKey('userID', { targetCase: 'constant' });
export type _constant = Expect<Equal<typeof _constantResult, 'USER_ID'>>;

// `undefined` and `{}` behave like omitted options, as they do at runtime
const _undefinedOptionsResult = transformKey('user_id', undefined);
export type _undefinedOptions = Expect<
  Equal<typeof _undefinedOptionsResult, 'userId'>
>;

const _emptyOptionsResult = transformKey('user_id', {});
export type _emptyOptions = Expect<Equal<typeof _emptyOptionsResult, 'userId'>>;

const _undefinedTargetResult = transformKey('user_id', {
  targetCase: undefined,
});
export type _undefinedTarget = Expect<
  Equal<typeof _undefinedTargetResult, 'userId'>
>;

// Keys the runtime leaves unchanged keep their type
const _preservedResult = transformKey('Hello World', { targetCase: 'snake' });
export type _preserved = Expect<Equal<typeof _preservedResult, 'Hello World'>>;

// A union of keys or of target cases gives the union of the results, also when a target
// case is the key's own case
declare const field: 'createdAt' | 'userID';
const _keyUnionResult = transformKey(field, { targetCase: 'snake' });
export type _keyUnion = Expect<
  Equal<typeof _keyUnionResult, 'created_at' | 'user_id'>
>;

declare const camelOrSnake: 'camel' | 'snake';
const _caseUnionResult = transformKey('userId', { targetCase: camelOrSnake });
export type _caseUnion = Expect<
  Equal<typeof _caseUnionResult, 'userId' | 'user_id'>
>;

declare const someCase: StringCase;
const _someCaseResult = transformKey('userId', { targetCase: someCase });
export type _someCase = Expect<Equal<typeof _someCaseResult, AnyCase>>;

// A target case that may be `undefined` may also fall back to the default
declare const maybeSnake: 'snake' | undefined;
const _maybeTargetResult = transformKey('userId', { targetCase: maybeSnake });
export type _maybeTarget = Expect<
  Equal<typeof _maybeTargetResult, 'user_id' | 'userId'>
>;

declare const maybeKebab: { targetCase?: 'kebab' };
const _optionalTargetResult = transformKey('userId', maybeKebab);
export type _optionalTarget = Expect<
  Equal<typeof _optionalTargetResult, 'user-id' | 'userId'>
>;

// Each member of a union of options objects gives its own key
declare const unionOptions: { targetCase: 'snake' } | Record<never, never>;
const _unionOptionsResult = transformKey('userId', unionOptions);
export type _unionOptions = Expect<
  Equal<typeof _unionOptionsResult, 'user_id' | 'userId'>
>;

// Options only known as `TransformKeyOptions` give the key in any of the target cases
declare const options: TransformKeyOptions;
const _knownOptionsResult = transformKey('userId', options);
export type _knownOptions = Expect<Equal<typeof _knownOptionsResult, AnyCase>>;

// An options object that may be `undefined`, or one with other properties, gives
// `string`
declare const maybeOptions: { targetCase: 'snake' } | undefined;
const _maybeOptionsResult = transformKey('userId', maybeOptions);
export type _maybeOptions = Expect<Equal<typeof _maybeOptionsResult, string>>;

const config = { targetCase: 'snake' as const, retries: 3 };
const _configResult = transformKey('userId', config);
export type _config = Expect<Equal<typeof _configResult, string>>;

// A key only known as a `string` or a template-literal pattern gives `string`, also as
// a member of a union
declare const someKey: string;
const _stringResult = transformKey(someKey, { targetCase: 'snake' });
export type _string = Expect<Equal<typeof _stringResult, string>>;

declare const mixedKey: 'user_id' | `x_${string}`;
const _mixedResult = transformKey(mixedKey);
export type _mixed = Expect<Equal<typeof _mixedResult, string>>;

// A key typed `any` gives `string`; a target case or options typed `any`, the key in any
// of the target cases
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const anyValue: any;
const _anyKeyResult = transformKey(anyValue);
export type _anyKey = Expect<Equal<typeof _anyKeyResult, string>>;

const _anyTargetResult = transformKey('userId', { targetCase: anyValue });
export type _anyTarget = Expect<Equal<typeof _anyTargetResult, AnyCase>>;

const _anyOptionsResult = transformKey('userId', anyValue);
export type _anyOptions = Expect<Equal<typeof _anyOptionsResult, AnyCase>>;
/* eslint-enable @typescript-eslint/no-explicit-any */

// Wrapped in a callback, every key keeps its type
const _mappedResult = (['user_id', 'first_name'] as const).map((key) =>
  transformKey(key, { targetCase: 'kebab' }),
);
export type _mapped = Expect<
  Equal<typeof _mappedResult, ('user-id' | 'first-name')[]>
>;

// `TransformKey` names the result type, camelCase by default
export type _named = Expect<
  Equal<TransformKey<'createdAt' | 'userID', 'snake'>, 'created_at' | 'user_id'>
>;
export type _namedDefault = Expect<Equal<TransformKey<'user_id'>, 'userId'>>;
export type _namedCaseUnion = Expect<
  Equal<TransformKey<'hello', 'camel' | 'pascal'>, 'hello' | 'Hello'>
>;
export type _namedNever = Expect<Equal<TransformKey<never>, never>>;

// Invalid keys and options are rejected
// @ts-expect-error 'title' is not a supported case
transformKey('user_id', { targetCase: 'title' });
// @ts-expect-error 'depth' is an option of transform, not of transformKey
transformKey('user_id', { targetCase: 'snake', depth: 1 });
// @ts-expect-error keepReferences is an option of transform, not of transformKey
transformKey('user_id', { keepReferences: false });
// @ts-expect-error 'targetcase' is not an option
transformKey('user_id', { targetcase: 'snake' });
// @ts-expect-error the target case goes in the options object
transformKey('user_id', 'snake');
// @ts-expect-error the key must be a string
transformKey(42);

// Values that share no property with the options are rejected, stored ones included
const misspelled = { targetcase: 'snake' as const };
// @ts-expect-error 'targetcase' is not an option
transformKey('user_id', misspelled);
// @ts-expect-error an array is not an options object
transformKey('user_id', []);
// @ts-expect-error a function is not an options object
transformKey('user_id', () => 'snake');
// @ts-expect-error a Date is not an options object
transformKey('user_id', new Date());
