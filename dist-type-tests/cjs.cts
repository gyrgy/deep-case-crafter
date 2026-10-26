/**
 * Type tests against the published declarations, as a CommonJS consumer sees them
 * (`dist/index.d.cts`, resolved through the package `exports`).
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import dcc = require('deep-case-crafter');
import type { Equal, Expect } from './typeAssertions.js';

const _resultValue = dcc.transform(
  { user_id: 1, created_at: new Date() },
  { targetCase: 'kebab' },
);
export type _result = Expect<
  Equal<typeof _resultValue, { 'user-id': number; 'created-at': Date }>
>;

export type _named = Expect<
  Equal<dcc.TransformResult<{ user_id: 1 }, 'pascal'>, { UserId: 1 }>
>;

export const options: dcc.TransformOptions = { depth: 2 };

const _keyValue = dcc.transformKey('user_id', { targetCase: 'kebab' });
export type _key = Expect<Equal<typeof _keyValue, 'user-id'>>;

export type _keyNamed = Expect<
  Equal<dcc.TransformKey<'user_id', 'pascal'>, 'UserId'>
>;
