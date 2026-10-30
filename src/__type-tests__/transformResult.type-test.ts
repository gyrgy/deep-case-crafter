/**
 * Compile-time type tests for the shape of `TransformResult`: nesting, arrays, Maps,
 * Sets, values returned untouched, and key kinds. See preservedKey.type-test.ts.
 */
import type { TransformResult } from '../types/transformTypes';
import type { Equal, Expect } from './typeAssertions';

// Nested objects, arrays and nullable values
type Api = {
  user_id: number;
  user_info: { first_name: string; tag_list: string[] };
  owner_info: { user_id: number } | null;
};
export type _nested = Expect<
  Equal<
    TransformResult<Api>,
    {
      userId: number;
      userInfo: { firstName: string; tagList: string[] };
      ownerInfo: { userId: number } | null;
    }
  >
>;

// Every target case
type Keys = { user_id: number; firstName: string; 'zip-code': string };
export type _snake = Expect<
  Equal<
    TransformResult<Keys, 'snake'>,
    { user_id: number; first_name: string; zip_code: string }
  >
>;
export type _pascal = Expect<
  Equal<
    TransformResult<Keys, 'pascal'>,
    { UserId: number; FirstName: string; ZipCode: string }
  >
>;
export type _kebab = Expect<
  Equal<
    TransformResult<Keys, 'kebab'>,
    { 'user-id': number; 'first-name': string; 'zip-code': string }
  >
>;
export type _constant = Expect<
  Equal<
    TransformResult<Keys, 'constant'>,
    { USER_ID: number; FIRST_NAME: string; ZIP_CODE: string }
  >
>;
export type _targetUnion = Expect<
  Equal<
    TransformResult<{ user_id: 1 }, 'camel' | 'pascal'>,
    { userId: 1 } | { UserId: 1 }
  >
>;

// Numeric keys are kept (with transformed values); symbol keys and their values are kept as-is
declare const sym: unique symbol;
type KeyKinds = {
  200: { status_text: string };
  [sym]: { inner_key: number };
  user_id: number;
};
export type _keyKinds = Expect<
  Equal<
    TransformResult<KeyKinds>,
    {
      200: { statusText: string };
      [sym]: { inner_key: number };
      userId: number;
    }
  >
>;
export type _numberRecord = Expect<
  Equal<
    TransformResult<Record<number, { user_id: number }>>,
    { [x: number]: { userId: number } }
  >
>;

// Index signatures and template-literal keys cannot be known exactly
export type _indexSignature = Expect<
  Equal<
    TransformResult<{ [key: string]: { user_id: number } }>,
    { [x: string]: { userId: number } }
  >
>;
export type _templateKeys = Expect<
  Equal<
    TransformResult<Record<`user_${string}`, number>>,
    { [x: string]: number }
  >
>;

// Readonly arrays and tuples stay arrays and tuples
type Lists = {
  tag_list: readonly { tag_name: string }[];
  point_xy: [number, { unit_name: string }];
  const_list: readonly ['a_b', { c_d: 1 }];
};
export type _lists = Expect<
  Equal<
    TransformResult<Lists>,
    {
      tagList: readonly { tagName: string }[];
      pointXy: [number, { unitName: string }];
      constList: readonly ['a_b', { cD: 1 }];
    }
  >
>;

// Values the runtime returns untouched keep their exact type
export class Money {
  constructor(public amount_cents: number) {}
}
type Untouched = {
  created_at: Date;
  name_pattern: RegExp;
  on_click: (event_name: string) => void;
  money_class: typeof Money;
  raw_bytes: Uint8Array;
  pending_job: Promise<{ job_id: number }>;
};
export type _untouched = Expect<
  Equal<
    TransformResult<Untouched>,
    {
      createdAt: Date;
      namePattern: RegExp;
      onClick: (event_name: string) => void;
      moneyClass: typeof Money;
      rawBytes: Uint8Array;
      pendingJob: Promise<{ job_id: number }>;
    }
  >
>;

// With a target case that renames their members, a value mapped as an object would differ:
// Date and RegExp members (getTime, lastIndex) are camelCase, Promise and Function members
// (then, apply) single lowercase words.
export type _untouchedSnake = Expect<
  Equal<TransformResult<Untouched, 'snake'>, Untouched>
>;
export type _untouchedPascal = Expect<
  Equal<
    TransformResult<Untouched, 'pascal'>,
    {
      CreatedAt: Date;
      NamePattern: RegExp;
      OnClick: (event_name: string) => void;
      MoneyClass: typeof Money;
      RawBytes: Uint8Array;
      PendingJob: Promise<{ job_id: number }>;
    }
  >
>;

// Branded primitives and values typed as the global Function keep their exact type
type UserId = string & { readonly __brand: 'UserId' };
type Cents = number & { readonly __unit: 'cents' };
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type Callback = Function;
export type _branded = Expect<
  Equal<
    TransformResult<{ user_id: UserId; price_cents: Cents; on_done: Callback }>,
    { userId: UserId; priceCents: Cents; onDone: Callback }
  >
>;
export type _brandedPascal = Expect<
  Equal<
    TransformResult<
      { user_id: UserId; price_cents: Cents; on_done: Callback },
      'pascal'
    >,
    { UserId: UserId; PriceCents: Cents; OnDone: Callback }
  >
>;

// Recursive types such as a JSON value type compile ("excessively deep" guard)
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export const _json: TransformResult<{ user_data: Json }> = {
  userData: { any_key: [1, 'x', null, { nested_value: true }] },
};
type NestedStrings = string | NestedStrings[];
export const _nestedStrings: TransformResult<{ string_tree: NestedStrings }> = {
  stringTree: ['a', ['b', ['c']]],
};

// Maps (string keys transformed) and Sets; a ReadonlyMap becomes a new Map
type Collections = {
  user_map: Map<'user_id' | '_private' | 7, { first_name: string }>;
  id_set: Set<{ user_id: number } | 'user_id'>;
  read_map: ReadonlyMap<string, { a_b: 1 }>;
};
export type _collections = Expect<
  Equal<
    TransformResult<Collections>,
    {
      userMap: Map<'userId' | '_private' | 7, { firstName: string }>;
      idSet: Set<{ userId: number } | 'user_id'>;
      readMap: Map<string, { aB: 1 }>;
    }
  >
>;

// Optional and readonly modifiers are kept
export type _modifiers = Expect<
  Equal<
    TransformResult<{ user_id?: number; readonly first_name: string }>,
    { userId?: number; readonly firstName: string }
  >
>;

// any, unknown and primitives
export type _any = Expect<Equal<TransformResult<any>, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
export type _anyValue = Expect<
  Equal<TransformResult<{ some_data: any }>, { someData: any }> // eslint-disable-line @typescript-eslint/no-explicit-any
>;
export type _unknown = Expect<Equal<TransformResult<unknown>, unknown>>;
export type _primitive = Expect<Equal<TransformResult<'user_id'>, 'user_id'>>;
export type _null = Expect<Equal<TransformResult<null>, null>>;

// Recursive data types compile and stay recursive
type TreeNode = { node_name: string; child_nodes: TreeNode[] };
export type _recursive = Expect<
  Equal<
    TransformResult<TreeNode>['childNodes'][number]['childNodes'][number]['nodeName'],
    string
  >
>;
