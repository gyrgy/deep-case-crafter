/**
 * Compile-time type tests for the `transform` overloads: what result type each way of
 * passing options produces. These calls are type-checked, never executed.
 * See preservedKey.type-test.ts.
 */
import transform from '../transform/transform';
import type { TransformOptions } from '../types/transformOptionTypes';
import type { Equal, Expect } from './typeAssertions';

declare const data: { user_id: number; user_info: { first_name: string } };
type Camel = { userId: number; userInfo: { firstName: string } };
type Snake = { user_id: number; user_info: { first_name: string } };
type Pascal = { UserId: number; UserInfo: { FirstName: string } };

// Precise types without declaring the source case
const _noOptionsResult = transform(data);
export type _noOptions = Expect<Equal<typeof _noOptionsResult, Camel>>;

const _pascalResult = transform(data, { targetCase: 'pascal' });
export type _pascal = Expect<Equal<typeof _pascalResult, Pascal>>;

// The deprecated `sourceCase` is still accepted and changes nothing
const _withSourceResult = transform(data, {
  sourceCase: 'snake',
  targetCase: 'pascal',
});
export type _withSource = Expect<Equal<typeof _withSourceResult, Pascal>>;

// A literal depth is applied precisely
const _shallowResult = transform(data, { depth: 1 });
export type _shallow = Expect<
  Equal<
    typeof _shallowResult,
    { userId: number; userInfo: { first_name: string } }
  >
>;

// `undefined` behaves like an omitted option, as it does at runtime
const _explicitUndefinedResult = transform(data, {
  targetCase: undefined,
  depth: undefined,
});
export type _explicitUndefined = Expect<
  Equal<typeof _explicitUndefinedResult, Camel>
>;

const _undefinedOptionsResult = transform(data, undefined);
export type _undefinedOptions = Expect<
  Equal<typeof _undefinedOptionsResult, Camel>
>;

// A value that may be `undefined` may also fall back to the default
declare const maybeSnake: 'snake' | undefined;
const _maybeTargetResult = transform(data, { targetCase: maybeSnake });
export type _maybeTarget = Expect<
  Equal<typeof _maybeTargetResult, Snake | Camel>
>;

declare const maybeOne: 1 | undefined;
const _maybeDepthResult = transform(data, { depth: maybeOne });
export type _maybeDepth = Expect<
  Equal<
    typeof _maybeDepthResult,
    { userId: number; userInfo: { first_name: string } } | Camel
  >
>;

// An options object that may be `undefined` gives `unknown`: the runtime may use either
// the given options or the defaults
declare const maybeOptions: { targetCase: 'snake' } | undefined;
const _maybeOptionsResult = transform(data, maybeOptions);
export type _maybeOptions = Expect<Equal<typeof _maybeOptionsResult, unknown>>;

// Options only known as `TransformOptions` (or a non-literal depth) give `unknown`
declare const options: TransformOptions;
const _unknownOptionsResult = transform(data, options);
export type _unknownOptions = Expect<
  Equal<typeof _unknownOptionsResult, unknown>
>;

const _infiniteDepthResult = transform(data, { depth: Infinity });
export type _infiniteDepth = Expect<
  Equal<typeof _infiniteDepthResult, unknown>
>;

// `TransformOptions` accepts every option
export const allOptions: TransformOptions = {
  targetCase: 'kebab',
  depth: 2,
  exclude: ['user_info.*'],
};

// The explicit output type overload returns exactly the given type, even when that type
// has a property named like an option
type Output = { userId: number; depth: number };
const _explicitResult = transform<typeof data, Output>(data, {
  targetCase: 'camel',
});
export type _explicit = Expect<Equal<typeof _explicitResult, Output>>;

// With only the input type given, the options are not inferred: the call still compiles,
// with an unknown result type when options are passed
const _explicitInputResult = transform<typeof data>(data);
export type _explicitInput = Expect<Equal<typeof _explicitInputResult, Camel>>;

const _explicitInputOptionsResult = transform<typeof data>(data, {
  targetCase: 'snake',
});
export type _explicitInputOptions = Expect<
  Equal<typeof _explicitInputOptionsResult, unknown>
>;

// `any` as the output type gives `any`, with or without options
/* eslint-disable @typescript-eslint/no-explicit-any */
const _explicitAnyResult = transform<typeof data, any>(data, {
  targetCase: 'snake',
});
export type _explicitAny = Expect<Equal<typeof _explicitAnyResult, any>>;

const _explicitAnyNoOptionsResult = transform<typeof data, any>(data);
export type _explicitAnyNoOptions = Expect<
  Equal<typeof _explicitAnyNoOptionsResult, any>
>;

// Options, a target case or a depth typed `any` say nothing about the result: `unknown`
declare const anyTargetCase: any;
const _anyTargetCaseResult = transform(data, { targetCase: anyTargetCase });
export type _anyTargetCase = Expect<
  Equal<typeof _anyTargetCaseResult, unknown>
>;

declare const anyDepth: any;
const _anyDepthResult = transform(data, {
  targetCase: 'snake',
  depth: anyDepth,
});
export type _anyDepth = Expect<Equal<typeof _anyDepthResult, unknown>>;

declare const anyOptions: any;
const _anyOptionsResult = transform(data, anyOptions);
export type _anyOptions = Expect<Equal<typeof _anyOptionsResult, unknown>>;
/* eslint-enable @typescript-eslint/no-explicit-any */

// A non-literal options object with other properties still compiles, with an unknown
// result type, as before (the explicit output type overload accepts it)
const config = { targetCase: 'snake' as const, retries: 3 };
const _configResult = transform(data, config);
export type _config = Expect<Equal<typeof _configResult, unknown>>;

// Invalid options are rejected
// @ts-expect-error 'title' is not a supported case
transform(data, { targetCase: 'title' });
// @ts-expect-error 'depht' is not an option, even next to a valid one
transform(data, { targetCase: 'snake', depht: 1 });
// @ts-expect-error 'targetcase' is not an option
transform(data, { targetcase: 'snake' });
// @ts-expect-error sourceCase is not accepted together with an explicit output type
transform<typeof data, Output>(data, { sourceCase: 'snake' });
