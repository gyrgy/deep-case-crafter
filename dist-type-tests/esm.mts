/**
 * Type tests against the published declarations, as an ES module consumer sees them
 * (`dist/index.d.mts`, resolved through the package `exports`).
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import {
  transform,
  type StringCase,
  type TransformOptions,
  type TransformResult,
} from 'deep-case-crafter';
import type { Equal, Expect } from './typeAssertions.js';

const _resultValue = transform({
  user_id: 1,
  created_at: new Date(),
  tag_list: ['a'] as readonly string[],
});
export type _result = Expect<
  Equal<
    typeof _resultValue,
    { userId: number; createdAt: Date; tagList: readonly string[] }
  >
>;

const _shallowValue = transform(
  { user_info: { first_name: 'x' } },
  { targetCase: 'kebab', depth: 1 },
);
export type _shallow = Expect<
  Equal<typeof _shallowValue, { 'user-info': { first_name: string } }>
>;

export type _named = Expect<
  Equal<
    TransformResult<{ HTTPResponse: 1; firstName: 2 }, 'snake'>,
    { http_response: 1; first_name: 2 }
  >
>;

export const options: TransformOptions = { targetCase: 'pascal', depth: 3 };
export const targetCase: StringCase = 'camel';
