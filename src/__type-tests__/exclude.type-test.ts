/**
 * Compile-time type tests for the `exclude` option: which keys keep their names along
 * nested paths, wildcards, collections and depth, and how the paths are captured from the
 * options. These calls are type-checked, never executed. See preservedKey.type-test.ts.
 */
import transform from '../transform/transform';
import type { TransformOptions } from '../types/transformOptionTypes';
import type { TransformResult } from '../types/transformTypes';
import type { Equal, Expect } from './typeAssertions';

type Api = {
  users_by_id: { u_1: { first_name: string }; u_2: { first_name: string } };
  metadata: { order_ref: string; line_items: { item_id: number }[] };
  user_info: { first_name: string };
};
declare const api: Api;

type Camel = {
  usersById: { u1: { firstName: string }; u2: { firstName: string } };
  metadata: { orderRef: string; lineItems: { itemId: number }[] };
  userInfo: { firstName: string };
};

/** `Camel` with the keys of `users_by_id` and `metadata` kept */
type IdsAndMetadataKept = {
  usersById: { u_1: { firstName: string }; u_2: { firstName: string } };
  metadata: { order_ref: string; line_items: { itemId: number }[] };
  userInfo: { firstName: string };
};

/** `Camel` with the keys of `user_info` kept */
type UserInfoKept = {
  usersById: { u1: { firstName: string }; u2: { firstName: string } };
  metadata: { orderRef: string; lineItems: { itemId: number }[] };
  userInfo: { first_name: string };
};

// The keys at the paths keep their names; the values under them are still transformed
const _inlineResult = transform(api, {
  exclude: ['users_by_id.*', 'metadata.*'],
});
export type _inline = Expect<Equal<typeof _inlineResult, IdsAndMetadataKept>>;

// A path names one key at each level; array items add no key to it
const _nestedResult = transform(api, {
  exclude: ['metadata.line_items.item_id', 'user_info'],
  targetCase: 'kebab',
});
export type _nested = Expect<
  Equal<
    typeof _nestedResult,
    {
      'users-by-id': {
        'u-1': { 'first-name': string };
        'u-2': { 'first-name': string };
      };
      metadata: { 'order-ref': string; 'line-items': { item_id: number }[] };
      user_info: { 'first-name': string };
    }
  >
>;

// `*` matches any key at its level
const _wildcardResult = transform(api, { exclude: ['*.*.first_name'] });
export type _wildcard = Expect<
  Equal<
    typeof _wildcardResult,
    {
      usersById: { u1: { first_name: string }; u2: { first_name: string } };
      metadata: { orderRef: string; lineItems: { itemId: number }[] };
      userInfo: { firstName: string };
    }
  >
>;

const _topLevelResult = transform(api, { exclude: ['*'] });
export type _topLevel = Expect<
  Equal<
    typeof _topLevelResult,
    {
      users_by_id: { u1: { firstName: string }; u2: { firstName: string } };
      metadata: { orderRef: string; lineItems: { itemId: number }[] };
      user_info: { firstName: string };
    }
  >
>;

// A key that contains a dot can only be matched by `*`; numeric keys are matched by name
type Odd = { 'a.b': { c_d: 1 }; 200: { status_text: 2 } };
declare const odd: Odd;
const _dottedResult = transform(odd, {
  exclude: ['a.b.c_d', '200.status_text'],
});
export type _dotted = Expect<
  Equal<typeof _dottedResult, { 'a.b': { cD: 1 }; 200: { status_text: 2 } }>
>;
const _dottedWildcardResult = transform(odd, { exclude: ['*.c_d'] });
export type _dottedWildcard = Expect<
  Equal<
    typeof _dottedWildcardResult,
    { 'a.b': { c_d: 1 }; 200: { statusText: 2 } }
  >
>;

// Nested arrays, tuples and Sets add no key to a path (the members of a Set are one depth
// level deeper all the same)
type Collections = {
  cell_grid: { cell_id: number }[][];
  pair_tuple: readonly [{ a_b: 1 }, { c_d: 2 }];
  tag_set: Set<{ tag_name: string }>;
};
declare const collections: Collections;
const _collectionsResult = transform(collections, {
  exclude: ['cell_grid.cell_id', 'pair_tuple.c_d', 'tag_set.tag_name'],
});
export type _collections = Expect<
  Equal<
    typeof _collectionsResult,
    {
      cellGrid: { cell_id: number }[][];
      pairTuple: readonly [{ aB: 1 }, { c_d: 2 }];
      tagSet: Set<{ tag_name: string }>;
    }
  >
>;

// Map keys are a level of their own; `*` also matches the keys that are not strings
declare const userMap: Map<'user_id' | 7, { first_name: string }>;
const _mapResult = transform(userMap, {
  exclude: ['user_id', '*.first_name'],
});
export type _map = Expect<
  Equal<typeof _mapResult, Map<'user_id' | 7, { first_name: string }>>
>;

// A Map has one value type for all of its keys, so values the paths treat differently
// become a union
declare const pairMap: Map<'a_b' | 'c_d', { x_y: number }>;
const _mapValuesResult = transform(pairMap, { exclude: ['a_b.x_y'] });
export type _mapValues = Expect<
  Equal<
    typeof _mapValuesResult,
    Map<'aB' | 'cD', { x_y: number } | { xY: number }>
  >
>;

declare const scoreMap: { score_map: Map<string, { x_y: number }> };
const _mapStringKeysResult = transform(scoreMap, {
  exclude: ['score_map.u1.x_y'],
});
export type _mapStringKeys = Expect<
  Equal<
    typeof _mapStringKeysResult,
    { scoreMap: Map<string, { x_y: number } | { xY: number }> }
  >
>;

// A key type that is not a single literal may stand for keys the paths treat
// differently: each gives its own value type
declare const usersById: {
  users_by_id: Record<string, { first_name: string }>;
};
const _indexSignatureResult = transform(usersById, {
  exclude: ['users_by_id.u1.first_name'],
});
export type _indexSignature = Expect<
  Equal<
    typeof _indexSignatureResult,
    {
      usersById: {
        [x: string]: { firstName: string } | { first_name: string };
      };
    }
  >
>;

// ...and keeps its exact type where `*` keeps every key
declare const templateKeys: { by_user: Record<`user_${string}`, { a_b: 1 }> };
const _templateKeysResult = transform(templateKeys, { exclude: ['by_user.*'] });
export type _templateKeys = Expect<
  Equal<
    typeof _templateKeysResult,
    { byUser: { [x: `user_${string}`]: { aB: 1 } } }
  >
>;

// A branded key type stands for any key it shares a value with, and a Map key type that
// may hold strings (`unknown`) for any string key
type UserId = string & { readonly __brand: 'UserId' };
declare const brandedIds: { by_id: Record<UserId, { first_name: string }> };
const _brandedKeysResult = transform(brandedIds, {
  exclude: ['by_id.u1.first_name'],
});
export type _brandedKeys = Expect<
  Equal<
    typeof _brandedKeysResult,
    { byId: { [x: string]: { firstName: string } | { first_name: string } } }
  >
>;

declare const unknownKeyMap: Map<unknown, { a_b: number }>;
const _unknownMapKeysResult = transform(unknownKeyMap, { exclude: ['x.a_b'] });
export type _unknownMapKeys = Expect<
  Equal<
    typeof _unknownMapKeysResult,
    Map<unknown, { aB: number } | { a_b: number }>
  >
>;

// String enum members are the keys they stand for, as object keys and as Map keys
enum Status {
  Active = 'active_user',
  Idle = 'idle_user',
}
declare const byStatus: { by_status: Record<Status, { first_name: string }> };
const _enumKeysResult = transform(byStatus, {
  exclude: ['by_status.active_user', 'by_status.idle_user.first_name'],
});
export type _enumKeys = Expect<
  Equal<
    typeof _enumKeysResult,
    {
      byStatus: {
        active_user: { firstName: string };
        idleUser: { first_name: string };
      };
    }
  >
>;

declare const statusMap: Map<Status, { first_name: string }>;
const _enumMapKeysResult = transform(statusMap, {
  exclude: ['active_user', 'idle_user.first_name'],
});
export type _enumMapKeys = Expect<
  Equal<
    typeof _enumMapKeysResult,
    Map<
      Status.Active | 'idleUser',
      { firstName: string } | { first_name: string }
    >
  >
>;

// exclude does not change the depth: deeper keys are untouched anyway
const _depthResult = transform(api, { exclude: ['metadata.*'], depth: 1 });
export type _depth = Expect<
  Equal<
    typeof _depthResult,
    {
      usersById: Api['users_by_id'];
      metadata: { order_ref: string; line_items: { item_id: number }[] };
      userInfo: { first_name: string };
    }
  >
>;

// ...and the depths whose results are not known stay unknown
declare const someDepth: number;
const _someDepthResult = transform(api, {
  exclude: ['metadata.*'],
  depth: someDepth,
});
export type _someDepth = Expect<Equal<typeof _someDepthResult, unknown>>;
export type _negativeDepth = Expect<
  Equal<TransformResult<Api, 'camel', -1, ['metadata.*']>, Api>
>;
export type _fractionalDepth = Expect<
  Equal<TransformResult<Api, 'camel', 1.5, ['metadata.*']>, unknown>
>;

// No path, or an empty array, is the same as no exclude
const _emptyResult = transform(api, { exclude: [] });
export type _empty = Expect<Equal<typeof _emptyResult, Camel>>;

const _undefinedResult = transform(api, { exclude: undefined });
export type _undefined = Expect<Equal<typeof _undefinedResult, Camel>>;

// A path with an empty key makes transform throw
const _emptyKeyResult = transform(api, { exclude: ['metadata..order_ref'] });
export type _emptyKey = Expect<Equal<typeof _emptyKeyResult, never>>;

// Paths stored `as const` are known; paths only known as `string[]` are not
const storedOptions = { exclude: ['users_by_id.*', 'metadata.*'] } as const;
const _storedResult = transform(api, storedOptions);
export type _stored = Expect<Equal<typeof _storedResult, IdsAndMetadataKept>>;

declare const paths: string[];
const _wideResult = transform(api, { exclude: paths });
export type _wide = Expect<Equal<typeof _wideResult, unknown>>;

const wideOptions = { exclude: ['metadata.*'] };
const _wideStoredResult = transform(api, wideOptions);
export type _wideStored = Expect<Equal<typeof _wideStoredResult, unknown>>;

const _restResult = transform(api, { exclude: ['metadata.*', ...paths] });
export type _rest = Expect<Equal<typeof _restResult, unknown>>;

declare const options: TransformOptions;
const _optionsResult = transform(api, options);
export type _options = Expect<Equal<typeof _optionsResult, unknown>>;

// A path only known to be one of several gives each result, and so does an exclude
// that may be omitted
declare const somePath: 'users_by_id.*' | 'user_info.*';
const _somePathResult = transform(api, { exclude: ['metadata.*', somePath] });
export type _somePath = Expect<
  Equal<
    typeof _somePathResult,
    | IdsAndMetadataKept
    | {
        usersById: { u1: { firstName: string }; u2: { firstName: string } };
        metadata: { order_ref: string; line_items: { itemId: number }[] };
        userInfo: { first_name: string };
      }
  >
>;

// ...while a path that is not a single literal cannot be known
declare const someTemplate: 'metadata.*' | `user_info.${string}`;
const _someTemplateResult = transform(api, { exclude: [someTemplate] });
export type _someTemplate = Expect<Equal<typeof _someTemplateResult, unknown>>;

declare const maybeExclude: { exclude?: readonly ['user_info.*'] };
const _maybeExcludeResult = transform(api, maybeExclude);
export type _maybeExclude = Expect<
  Equal<typeof _maybeExcludeResult, Camel | UserInfoKept>
>;

// Each member of a union of options objects keeps its own paths
declare const unionOptions:
  | { exclude: readonly ['user_info.*'] }
  | { targetCase: 'snake'; exclude: readonly ['users_by_id.*', 'metadata.*'] }
  | { depth: 1 };
const _unionResult = transform(api, unionOptions);
export type _union = Expect<
  Equal<
    typeof _unionResult,
    | UserInfoKept
    | Api
    | {
        usersById: Api['users_by_id'];
        metadata: Api['metadata'];
        userInfo: Api['user_info'];
      }
  >
>;

declare const keepIds: boolean;
const _conditionalResult = transform(
  api,
  keepIds
    ? { exclude: ['users_by_id.*', 'metadata.*'] }
    : { exclude: ['user_info.*'] },
);
export type _conditional = Expect<
  Equal<typeof _conditionalResult, IdsAndMetadataKept | UserInfoKept>
>;

// TransformResult takes the type of the exclude option as its fourth type argument
export type _named = Expect<
  Equal<
    TransformResult<Api, 'camel', undefined, ['users_by_id.*', 'metadata.*']>,
    IdsAndMetadataKept
  >
>;
export type _namedMaybe = Expect<
  Equal<
    TransformResult<
      Api,
      'camel',
      undefined,
      readonly ['user_info.*'] | undefined
    >,
    Camel | UserInfoKept
  >
>;
export type _namedWide = Expect<
  Equal<TransformResult<Api, 'camel', undefined, string[]>, unknown>
>;
/* eslint-disable @typescript-eslint/no-explicit-any */
export type _namedAny = Expect<
  Equal<TransformResult<Api, 'camel', undefined, any>, unknown>
>;
declare const anyExclude: any;
const _anyExcludeResult = transform(api, { exclude: anyExclude });
export type _anyExclude = Expect<Equal<typeof _anyExcludeResult, unknown>>;
/* eslint-enable @typescript-eslint/no-explicit-any */

// The explicit output type overload accepts exclude, and returns the given type
const _explicitResult = transform<Api, Camel>(api, { exclude: paths });
export type _explicit = Expect<Equal<typeof _explicitResult, Camel>>;

// Invalid paths and unknown option names are rejected
// @ts-expect-error exclude is an array of paths
transform(api, { exclude: 'metadata.*' });
// @ts-expect-error a path is a string
transform(api, { exclude: [1] });
// @ts-expect-error 'excludes' is not an option
transform(api, { excludes: ['metadata.*'] });
// @ts-expect-error 'depht' is not an option, also next to exclude
transform(api, { exclude: ['metadata.*'], depht: 1 });

// The deprecated 2.x form with explicit type arguments does not accept exclude
transform<Api, 'snake', 'camel'>(api, {
  sourceCase: 'snake',
  targetCase: 'camel',
  // @ts-expect-error exclude needs the inferred form (no type arguments)
  exclude: ['metadata.*'],
});
