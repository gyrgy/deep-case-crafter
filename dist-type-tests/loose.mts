/**
 * Type tests against the published declarations in a project without `strict` (so
 * without `strictNullChecks`, where `undefined` and `null` are assignable to every type).
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import { transform } from 'deep-case-crafter';
import type { Equal, Expect } from './typeAssertions.js';

const input = { user_id: 1, tags: ['a'], user_info: { first_name: 'x' } };

type Camel = {
  userId: number;
  tags: string[];
  userInfo: { firstName: string };
};

const _defaultValue = transform(input);
export type _default = Expect<Equal<typeof _defaultValue, Camel>>;

const _snakeValue = transform(
  { userId: 1, Tags: ['a'], UserInfo: { FirstName: 'x' } },
  { targetCase: 'snake' },
);
export type _snake = Expect<
  Equal<
    typeof _snakeValue,
    { user_id: number; tags: string[]; user_info: { first_name: string } }
  >
>;

const _shallowValue = transform(input, { depth: 1 });
export type _shallow = Expect<
  Equal<
    typeof _shallowValue,
    { userId: number; tags: string[]; userInfo: { first_name: string } }
  >
>;

const _sourceCaseValue = transform(input, {
  sourceCase: 'snake',
  targetCase: 'camel',
});
export type _sourceCase = Expect<Equal<typeof _sourceCaseValue, Camel>>;

// Keys the runtime leaves unchanged keep their type
const _preservedValue = transform({ USER_ID: 1, mixed_Case: 2, 'a.b': 3 });
export type _preserved = Expect<
  Equal<
    typeof _preservedValue,
    { USER_ID: number; mixed_Case: number; 'a.b': number }
  >
>;

// An optional depth or targetCase may be omitted, also without strictNullChecks, where
// `undefined` disappears from the property type
const camelInput = { userId: 1, userInfo: { firstName: 'x' } };
interface ShallowSnake {
  targetCase: 'snake';
  depth?: 1;
}
declare const shallowSnake: ShallowSnake;
const _optionalDepthValue = transform(camelInput, shallowSnake);
export type _optionalDepth = Expect<
  Equal<
    typeof _optionalDepthValue,
    | { user_id: number; user_info: { first_name: string } }
    | { user_id: number; user_info: { firstName: string } }
  >
>;

declare const maybeKebab: { targetCase?: 'kebab' };
const _optionalTargetValue = transform(camelInput, maybeKebab);
export type _optionalTarget = Expect<
  Equal<
    typeof _optionalTargetValue,
    | { 'user-id': number; 'user-info': { 'first-name': string } }
    | { userId: number; userInfo: { firstName: string } }
  >
>;
