# DeepCaseCrafter

[![npm version](https://img.shields.io/npm/v/deep-case-crafter)](https://www.npmjs.com/package/deep-case-crafter)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/deep-case-crafter)](https://bundlephobia.com/package/deep-case-crafter)
[![npm type definitions](https://img.shields.io/npm/types/deep-case-crafter)](https://www.npmjs.com/package/deep-case-crafter)
[![Dev dependency: typescript](https://img.shields.io/github/package-json/dependency-version/gyrgy/deep-case-crafter/dev/typescript/main)](https://github.com/gyrgy/deep-case-crafter/blob/main/package.json)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/gyrgy/deep-case-crafter#readme)
[![Maintenance](https://img.shields.io/maintenance/yes/2026.svg)](https://github.com/gyrgy/deep-case-crafter/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/gyrgy/deep-case-crafter/blob/main/LICENSE)

Converts the keys of nested objects, arrays, Maps and Sets between camelCase,
snake_case, kebab-case and PascalCase, or to CONSTANT_CASE, and types the result
exactly.

```typescript
import { transform } from 'deep-case-crafter';

// A record from a snake_case API
const apiUser = { user_id: 42, first_name: 'Ann', orders: [{ order_id: 7 }] };

const user = transform(apiUser);
//    ^? { userId: number; firstName: string; orders: { orderId: number }[] }
console.log(user); // { userId: 42, firstName: 'Ann', orders: [{ orderId: 7 }] }

const body = transform(user, { targetCase: 'snake' });
//    ^? { user_id: number; first_name: string; orders: { order_id: number }[] }
```

| For                                      | Use                                                                |
| ---------------------------------------- | ------------------------------------------------------------------ |
| camelCase keys                           | `transform(data)`                                                  |
| snake_case keys                          | `transform(data, { targetCase: 'snake' })`                         |
| kebab-case, PascalCase or CONSTANT_CASE  | `targetCase: 'kebab'`, `'pascal'` or `'constant'`                  |
| One key                                  | `transformKey('user_id')` → `'userId'`                             |
| Some keys left as they are               | `transform(data, { exclude: ['users_by_id.*'] })`                  |
| The top level only                       | `transform(data, { depth: 1 })`                                    |
| Faster conversion of `JSON.parse` output | `transform(data, { keepReferences: false })`                       |
| A callback, or options set once          | `.then(transformTo('camel'))`                                      |
| The result type, or a key's type         | `TransformResult<typeof data, 'snake'>`, `TransformKey<'user_id'>` |

## Features

- **Exact result types**: every key is typed the way it is converted at runtime, so
  `user.firstName` is checked at compile time, without casts or type arguments (with a
  few [exceptions](#result-types)).
- **No source case to declare**: every key's case is detected from the key itself, so
  keys in different cases can be mixed in one input.
- **Acronym-aware**: `userID` → `user_id`, `HTTPResponse` → `http_response` or
  `httpResponse`.
- **CONSTANT_CASE output**: `targetCase: 'constant'` turns `userID` into `USER_ID` and
  `HTTPResponse` into `HTTP_RESPONSE`. It is an output case only: the other cases leave
  `USER_ID` as it is.
- **Deep**: objects, arrays, `Map` and `Set`, down to an optional `depth`, circular
  references included. `Date`, `RegExp`, typed arrays and other built-in values are
  returned untouched.
- **Keys that are data keep their names**: UUIDs always, and any other key whose path
  you list in [`exclude`](#leaving-keys-unchanged), such as `'users_by_id.*'`.
- **Callbacks keep their types**: [`transformTo`](#transformtotargetcase-options) makes a
  function with its options set once, which keeps the exact result type where it is
  passed by name: `.then(transformTo('camel'))`, `items.map(transformTo('snake'))`.
- **Single keys too**: [`transformKey`](#transformkeykey-options) converts one key by
  the same rules, `transformKey('userID', { targetCase: 'snake' })` → `'user_id'`, typed
  `'user_id'`.
- No dependencies, with ES module and CommonJS builds.

## Installation

```bash
npm install deep-case-crafter
```

The type definitions require TypeScript 4.7 or later.

Upgrading from an earlier major version? The
[changelog](https://github.com/gyrgy/deep-case-crafter/blob/main/CHANGELOG.md) lists
what changed in each version and what to update.

---

## Quick Start

### 1. Basic usage — just call `transform`

```typescript
import { transform } from 'deep-case-crafter';

const input = { user_id: 1, first_name: 'John' };
const result = transform(input);
//    ^? { userId: number; firstName: string }

console.log(result);
// Output: { userId: 1, firstName: 'John' }
```

_(Automatically converts from `snake_case` to `camelCase`; the case of every key is detected from the key itself)_

---

### 2. Specify the `targetCase`

```typescript
const input = { user_id: 1, first_name: 'John' };

const pascalCaseResult = transform(input, { targetCase: 'pascal' });
console.log(pascalCaseResult);
// Output: { UserId: 1, FirstName: 'John' }

const kebabCaseResult = transform(input, { targetCase: 'kebab' });
console.log(kebabCaseResult);
// Output: { "user-id": 1, "first-name": "John" }

const constantCaseResult = transform(input, { targetCase: 'constant' });
console.log(constantCaseResult);
// Output: { USER_ID: 1, FIRST_NAME: 'John' }
```

---

### 3. Name the result type with `TransformResult`

```typescript
import { transform, type TransformResult } from 'deep-case-crafter';

type ApiUser = { user_id: number; first_name: string; created_at: Date };
type User = TransformResult<ApiUser>;
// { userId: number; firstName: string; createdAt: Date }

function toUser(apiUser: ApiUser): User {
  return transform(apiUser);
}
```

---

### 4. Transform deeply nested structures

```typescript
const nestedInput = {
  user_info: { first_name: 'John', last_name: 'Doe' },
  posts: [{ post_id: 1, post_title: 'Hello' }],
};

const transformed = transform(nestedInput, { targetCase: 'camel' });

console.log(transformed);
// Output:
// {
//   userInfo: { firstName: 'John', lastName: 'Doe' },
//   posts: [{ postId: 1, postTitle: 'Hello' }]
// }
```

---

### 5. Transforming a `Map`

```typescript
const mapInput = new Map<string, number | string>([
  ['user_id', 1],
  ['first_name', 'John'],
]);

const result = transform(mapInput, { targetCase: 'camel' });

console.log(result.get('userId')); // 1
console.log(result.get('firstName')); // 'John'
```

---

### 6. Transforming a `Set`

A `Set` is a collection of _values_, not key/value pairs, so its primitive
members (strings, numbers, etc.) are passed through unchanged — only the **keys
of objects nested inside the Set** are transformed.

```typescript
const setInput = new Set([{ user_id: 1 }, { first_name: 'John' }]);
const result = transform(setInput, { targetCase: 'camel' });

console.log(result); // Set { { userId: 1 }, { firstName: 'John' } }

// Primitive members are left as-is:
const strings = new Set(['user_id', 'first_name']);
console.log(transform(strings, { targetCase: 'camel' }));
// Set { 'user_id', 'first_name' }
```

---

### 7. Convert a single key with `transformKey`

```typescript
import { transformKey } from 'deep-case-crafter';

transformKey('user_id'); // 'userId'
transformKey('userID', { targetCase: 'snake' }); // 'user_id'

type SortField = 'createdAt' | 'userID';

function toSortParam(field: SortField) {
  return transformKey(field, { targetCase: 'snake' });
  //     ^? 'created_at' | 'user_id'
}
```

---

### 8. Set the options once with `transformTo`

```typescript
import { transformTo } from 'deep-case-crafter';

const toCamel = transformTo('camel');
const toPayload = transformTo('snake', { exclude: ['metadata.*'] });

const users = await fetch('/api/users')
  .then((response) => response.json() as Promise<{ user_id: number }[]>)
  .then(toCamel);
//    ^? { userId: number }[]

const body = toPayload({ userId: 1, metadata: { orderRef: 'A1' } });
//    ^? { user_id: number; metadata: { orderRef: string } }
```

Passed by name, `transform` itself gets an `unknown` result type (see
[Passing `transform` as a callback](#passing-transform-as-a-callback)).

---

## How it compares

Checked in October and November 2026 against
[ts-case-convert](https://www.npmjs.com/package/ts-case-convert) 2.3.2 (the closest
typed alternative), [camelcase-keys](https://www.npmjs.com/package/camelcase-keys)
10.0.3, [snakecase-keys](https://www.npmjs.com/package/snakecase-keys) 9.0.2 and
[es-toolkit](https://www.npmjs.com/package/es-toolkit) 1.53.0 (`toCamelCaseKeys`,
`toSnakeCaseKeys`). Plain snake_case keys such as `user_id` become the same camelCase
keys in all of them. The table shows where they differ:

|                                                    | deep-case-crafter                            | ts-case-convert                                                        | camelcase-keys, snakecase-keys                                    | es-toolkit                                                     |
| -------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `userID` to snake_case                             | `user_id`                                    | `user_i_d`                                                             | `user_id`                                                         | `user_id`, typed `user_i_d`                                    |
| `HTTPResponse` to snake_case                       | `http_response`                              | `h_t_t_p_response`                                                     | `http_response`                                                   | `http_response`, typed `h_t_t_p_response`                      |
| `isAValidUser` to snake_case                       | `is_a_valid_user`                            | `is_a_valid_user`                                                      | `is_a_valid_user`                                                 | `is_a_valid_user`                                              |
| `addressLine1` to snake_case                       | `address_line1`                              | `address_line_1`, or `address_line1` with `no-split-numbers`           | `address_line1`                                                   | `address_line_1`, typed `address_line1`                        |
| Objects inside a `Map` or `Set`                    | keys converted                               | outside its documented scope                                           | outside their documented scope                                    | left as they are, as documented                                |
| Result type for `await res.json()`, an `any` input | `any`                                        | a union that includes `Date` and `null`, so `.userId` does not compile | `any`                                                             | `any`                                                          |
| A `readonly string[]` field in the result type     | `readonly string[]`                          | an object type whose `.map()` does not compile                         | `readonly string[]`                                               | an object type: `.map()` compiles, `[0]` and `for...of` do not |
| A `[number, number]` field in the result type      | `[number, number]`                           | `number[]`                                                             | `[number, number]`                                                | `number[]`                                                     |
| Leaving chosen keys unchanged                      | `exclude` paths, such as `'metadata.*'`      | no option                                                              | `exclude` keys by name or RegExp; camelcase-keys also `stopPaths` | no option                                                      |
| Target cases                                       | camel, snake, kebab, Pascal, SCREAMING_SNAKE | camel, snake, Pascal, SCREAMING_SNAKE                                  | camel and Pascal; snake                                           | camel, snake, kebab, Pascal, SCREAMING_SNAKE                   |

Where the others are better or different:

- **Bundle size**: bundled and minified with esbuild, ts-case-convert's `objectToCamel`
  and `objectToSnake` take about 1.1 KB gzipped, deep-case-crafter's `transform` about
  3.2 KB.
- **CONSTANT_CASE input**: camelcase-keys, snakecase-keys and es-toolkit also read
  SCREAMING_SNAKE_CASE keys, so `USER_ID` becomes `userId` or `user_id`.
  deep-case-crafter converts to CONSTANT_CASE, but leaves keys such as `USER_ID` and
  `ID` unchanged (see [Key Preservation Rules](#key-preservation-rules)).
- **Single strings**: like `transformKey`, ts-case-convert's `toSnake('userId')` and
  es-toolkit's `snakeCase('userId')` return `'user_id'`. es-toolkit's functions also
  convert text, such as `'Hello World'` → `'hello_world'`, which `transformKey` returns
  unchanged.
- **Digits**: ts-case-convert separates digits by default (`addressLine1` →
  `address_line_1`), so `address_line_1` → `addressLine1` → `address_line_1`
  round-trips. Its `ts-case-convert/no-split-numbers` entry point keeps digits attached
  instead, as deep-case-crafter always does: `addressLine1` → `address_line1`.
- **Acronyms**: ts-case-convert splits every capital, so `userID` → `user_i_d` comes back
  as `userID`. deep-case-crafter's `user_id` comes back as `userId`.
- **Options**: camelcase-keys and snakecase-keys leave keys unchanged by name or RegExp
  at any depth, and snakecase-keys accepts your own conversion function. camelcase-keys
  converts only the top level unless you pass `deep: true`.

---

## Acronym-aware conversion

When converting **to** `snake_case`, `kebab-case` or `CONSTANT_CASE`, runs of capitals
(acronyms) are treated as whole words instead of being split letter-by-letter:

```typescript
const input = { getHTTPResponse: 1, userID: 2, parseHTMLString: 3 };
const result = transform(input, { targetCase: 'snake' });

console.log(result);
// Output: { get_http_response: 1, user_id: 2, parse_html_string: 3 }
//   (not  { get_h_t_t_p_response, user_i_d, ... })
```

The last capital before a lowercase letter starts the next word, so a single capital
before a capitalised word is a one-letter word, in every target case:

```typescript
const input = { isAValidUser: 1, XAxis: 2 };

console.log(transform(input, { targetCase: 'snake' }));
// Output: { is_a_valid_user: 1, x_axis: 2 }

console.log(transform(input, { targetCase: 'camel' }));
// Output: { isAValidUser: 1, xAxis: 2 }
```

Such keys round-trip: `three_d_secure` → `threeDSecure` → `three_d_secure`. A key that
starts with two capitals before a lowercase letter is read the same way:
`OAuthToken` → `o_auth_token`, `IPv4` → `i_pv4`.

A plural `s` stays with its acronym: `allowedURLs` → `allowed_urls`,
`getURLsForIDs` → `get_urls_for_ids`, `IDs` → `ids`. An `s` word that follows an
acronym directly is read the same way, so `SSLIsEnabled` becomes `sslis_enabled`.

When converting `PascalCase` **to** `camelCase`, the first word is lowercased: a leading
acronym as a whole, a leading one-letter word on its own:

```typescript
const input = { HTTPResponse: 1, UserID: 2, XAxis: 3, IDs: 4 };
const result = transform(input, { targetCase: 'camel' });

console.log(result);
// Output: { httpResponse: 1, userID: 2, xAxis: 3, ids: 4 }
```

Words of two or more capitals, such as `ID`, `USD` or `GET`, are left unchanged, like
`CONSTANT_CASE` keys (see [Key Preservation Rules](#key-preservation-rules)). A single
capital, with or without digits (`S`, `S3`), is converted as a one-letter word.

Converting back to `PascalCase` cannot restore a lowercased acronym: `httpResponse`
becomes `HttpResponse`, and `ids` becomes `Ids`. In the other direction, a camelCase key
that starts with a one-letter word before an acronym does not come back either:
`iOSVersion` → `IOSVersion` → `iosVersion`.

The result **types** match all of this, so `result.get_http_response` and
`result.httpResponse` are known at compile time.

---

## API

### `transform(data, options)`

- **data**: The data structure to transform (`object`, `array`, `Map`, or `Set`).
- **options**: An object. Passing the target case itself, `transform(data, 'snake')`,
  does not compile and throws a `TypeError`.
  - `targetCase` (optional): `'camel' | 'snake' | 'pascal' | 'kebab' | 'constant'` (default: `'camel'`, also used for any falsy value such as `''`, `null` or `0`). Any other value throws a `TypeError`. `'constant'` is CONSTANT_CASE, also called SCREAMING_SNAKE_CASE: `userID` becomes `USER_ID`, split into words as for snake_case. It is a target case only: keys such as `USER_ID` or `ID` are left unchanged by every target case, so they do not convert back. A single capital, with or without digits, is still converted as a one-letter word: `'constant'` turns `p99` into `P99`, and camel, snake and kebab turn it back into `p99` (see [Key Preservation Rules](#key-preservation-rules)).
  - `depth` (optional): **How many nesting levels to transform** (default: `Infinity` — the whole structure; `null` means the same). `1` transforms only the top-level keys, `2` the keys one level down as well, and so on. The values of objects, Maps and Sets are one level deeper; array items stay on their array's level. A value that is not a number (`NaN`, `'3'`, `3n`) throws a `TypeError`.
  - `exclude` (optional): **Keys to leave unchanged**, as paths of keys joined with dots, such as `['users_by_id.*', 'metadata.*']` (default: none; `null` means the same). See [Leaving keys unchanged](#leaving-keys-unchanged). Anything but an array of such paths throws a `TypeError`.
  - `keepReferences` (optional): **Whether shared and circular references keep their shape** (default: `true`; `null` means the same). An object reached through several references then gives one result, and a circular reference points back into the result. Pass `false` for data that cannot contain such references, such as the output of `JSON.parse`, to skip that bookkeeping: inputs with many objects and arrays convert up to about twice as fast. Use it for tree-shaped data only: an object is then copied once for every path that leads to it, so shared objects inside shared objects multiply. Data with more than 256 nested objects, arrays, Maps and Sets on one path, as circular references always have, is converted again from the start with the bookkeeping. That takes longer and runs its getters again; a getter on a circular path has by then run up to 256 times. With a finite `depth`, a circular reference stops at the depth limit instead when that comes first, and is copied once per path down to it. Anything but a boolean throws a `TypeError`.
  - `sourceCase` (**deprecated**): has no effect. Every key's case is detected from the key itself, at runtime and in the result type. It is still accepted, and so is the 2.x form with explicit type arguments, `transform<Data, 'snake', 'camel'>(data, { sourceCase: 'snake', targetCase: 'camel' })`, except together with `depth`, `exclude` or `keepReferences` (leave the type arguments out to use them); the key types follow the runtime, not `sourceCase` (see [3.0.0 in the changelog](https://github.com/gyrgy/deep-case-crafter/blob/main/CHANGELOG.md#300---2026-10-25)).

Circular references are resolved to the transformed object. With a finite `depth`, a
cycle is transformed once per level down to the limit instead: the result grows with the
depth, and a depth of more than about a thousand levels on cyclic data can exceed the
call stack and throw a `RangeError` (see [Limits](#limits)). Omit `depth` for cyclic
data, or keep it small.

### Leaving keys unchanged

Keys that are data rather than field names, such as the IDs of a record, the keys of
free-form metadata, locale codes or Map keys, should keep their names. List their paths
in `exclude`:

```typescript
const response = {
  users_by_id: { abc_1: { first_name: 'Ann' } },
  metadata: { order_ref: 'A1' },
};

const result = transform(response, {
  exclude: ['users_by_id.*', 'metadata.*'],
});

console.log(result);
// Output: { usersById: { abc_1: { firstName: 'Ann' } }, metadata: { order_ref: 'A1' } }
```

- A path is the chain of keys that leads to a key in the input (the keys before they are
  transformed), joined with `.`. A `*` in place of a key matches any key.
- A key keeps its name when its whole path matches: `metadata.*` keeps the keys of
  `metadata`, not `metadata` itself, nor the keys further down. The value of a kept key
  is still transformed, so `first_name` above becomes `firstName`.
- Array items and Set members add no key to a path: `orders.order_id` matches the
  `order_id` of every item of an `orders` array. Map keys do: `prices.*` keeps the keys
  of a `prices` Map, and `*` also matches Map keys that are not strings.
- A key that contains a `.` cannot be named in a path, but `*` matches it.
- `exclude` does not change `depth`: keys below the depth limit are left unchanged
  anyway. An empty array is the same as no `exclude`.

The result type follows the paths when they are written inline or `as const`; paths only
known as `string[]` give an `unknown` result type.

### Passing `transform` as a callback

Use [`transformTo`](#transformtotargetcase-options): `.then(transformTo('camel'))`,
`items.map(transformTo('snake'))`. Passed by name, `transform` itself gets an `unknown`
result type, because TypeScript then uses its last overload, `transform<Input, Output>`,
whose output it cannot infer, and `map` would pass each row's index as the options.
Wrapping it in a function works as well: `rows.map((row) => transform(row))`. A callback
that passes a string, such as the key in lodash's `mapValues(object, transform)`, makes
`transform` throw a `TypeError`.

### Result types

The result type follows the runtime: every key is typed the way it is transformed
(including the [preservation rules](#key-preservation-rules)), untouched values such as
`Date` keep their type, and `readonly` arrays, tuples, Maps and Sets keep their shape. Use
`TransformResult<Data, TargetCase, Depth, Exclude>` to name it, where `Exclude` is the
type of the `exclude` paths, such as `['metadata.*']`.

- A literal `depth` is applied to the type precisely. A depth only known as a `number` (a
  variable, or `Infinity`) gives `unknown`, so omit `depth` to transform everything.
- `exclude` paths are applied to the type when they are literals, written inline or
  stored `as const`. Paths only known as `string[]` give `unknown`, as a depth only known
  as a `number` does.
- `targetCase` and `depth` may be string enum members, branded literals, unions, or come
  from a stored options object: every options value they may hold gives its own result.
  Options that are not known at all give `unknown`: an options object that may be
  `undefined`, one typed as `TransformOptions` or `any`, one carrying other properties
  (without `sourceCase`), and options passed with only the input type given
  (`transform<Data>(data, options)`). Leave the type arguments out to get the precise
  type.
- When a library exports a value or function built on `transform`, `transformKey` or a
  function made by `transformTo`, annotate its result with `TransformResult<...>` or
  `TransformKey<...>`. Otherwise the
  result type is written out into its declaration files. For data of a fixed type,
  recursive types (trees, JSON values) are then cut off as `any`, and very large types or
  symbol-keyed members fail to compile (TS7056, TS4118). For a target case typed
  `StringCase`, generic data included, the result can cover only the cases that existed
  when the library was built, not cases added later. A generic target case, as in
  `<C extends StringCase>(targetCase: C)`, is not affected. Leave its result type
  inferred: `TransformResult<T, C>` and `TransformKey<K, C>` do not match it, and its
  declarations refer to the types by name. A function made by `transformTo` itself needs
  no annotation: it is declared as `TransformTo<...>`.
- Some values cannot be told apart by their types. `Error`, `URL`, boxed primitives,
  iterators, module namespace objects and other built-ins whose types do not declare a
  `Symbol.toStringTag` are returned untouched, but typed as plain objects with
  transformed keys. Class instances lose their prototype methods, getters and setters at
  runtime, while their type still lists them. A class that implements `Map`, `Set`,
  `ReadonlyMap` or `ReadonlySet` without extending `Map` or `Set` (and a Proxy around a
  Map or Set) is typed as a transformed `Map` or `Set`, but at runtime it is returned
  untouched when it has a `Symbol.toStringTag` (as every class implementing `Map` or
  `Set` does), and rebuilt as a plain object otherwise.

### `transformTo(targetCase, options)`

Makes a function that transforms the keys of its argument as
`transform(data, { targetCase, ...options })` does, typed as `transform` types that call.

- **targetCase**: as for `transform` (`undefined` means `'camel'`).
- **options** (optional): `depth`, `exclude` and `keepReferences`, as for `transform`.
  The target case is the first argument: `transformTo('snake', { targetCase: 'kebab' })`
  does not compile and throws a `TypeError`.

```typescript
const toShallowSnake = transformTo('snake', { depth: 1 });

toShallowSnake({ userId: 1, userInfo: { firstName: 'Ann' } });
// { user_id: 1, user_info: { firstName: 'Ann' } }
```

- The function uses only its first argument, so it can be passed to callbacks that pass
  more, such as `map` (the index) or lodash's `mapValues` (the key).
- The options are checked when the function is made, where invalid ones throw a
  `TypeError`, and read only then: changing the options object or the `exclude` array
  afterwards does not change the function.
- Each call converts its data on its own, as a call to `transform` does: shared and
  circular references are kept within a call.
- The function remembers the layouts of its results across its calls. Results of 20 to
  200 keys are fast objects from the third one of a layout in a call (see
  [3.6.0 in the changelog](https://github.com/gyrgy/deep-case-crafter/blob/main/CHANGELOG.md#360---2026-11-08)),
  and records converted one per call, as `rows.map(toCamel)` does, from the fourth
  call on; once the function knows a layout, from the first. Converted one per call
  with `transform`, such records stay in dictionary mode. With Node 24, for 20,000
  records, a third of whose values were strings, the function took 17–25% less time
  than one call to `transform` per record at 20, 30, 50 and 100 keys, 7–10% less at
  85 and 200 keys, and between 4% less and 3% more at 150 to 170 keys. Its results
  took 33–40% less memory and read 2.4 to 4.4 times as fast by property name, but 1.5
  to 2.2 times as slowly by a computed key from a list of keys.
- Once a call has returned, the function keeps none of its data but keys: the keys of
  some results, and for each layout it has learned, a copy of a result with an empty
  object in place of every value. It checks each layout with the first result of that
  layout in a call. Once it has learned 16 layouts (with `exclude`, 16 for one set of
  matching paths), or results with the same number of keys and last key have other
  keys, as records with optional keys or two kinds of records can, the rest of that call
  and its later calls learn as calls to `transform` do.
- Strings are returned as they are, as `transform` returns them. To convert keys, use
  [`transformKey`](#transformkeykey-options):
  `keys.map((key) => transformKey(key, { targetCase: 'snake' }))`.
- Its type is `TransformTo<TargetCase, Options>`, and the type of its options
  `TransformToOptions`.

### `transformKey(key, options)`

Converts a single key by the same rules as the keys of `transform`'s result.

- **key**: The key to transform, a string. Anything else throws a `TypeError`.
- **options**:
  - `targetCase` (optional): as for `transform` (default: `'camel'`). Pass it in an
    object: `transformKey(key, 'snake')` does not compile and throws a `TypeError`.

```typescript
transformKey('HTTPResponse', { targetCase: 'snake' }); // 'http_response'
transformKey('Hello World', { targetCase: 'snake' }); // 'Hello World'
```

It converts names, not text: a string that is not a camelCase, PascalCase, snake_case or
kebab-case key is returned unchanged, such as `'Hello World'`, `'USER_ID'`, `'_id'` or a
UUID (see [Key Preservation Rules](#key-preservation-rules)).

The result type is the converted key. A string literal gives a literal, a union of keys
or of target cases gives the union of their results, and a `string` gives `string`.
`TransformKey<Key, TargetCase>` names it: `TransformKey<'userID', 'snake'>` is
`'user_id'`. Options that are not known exactly, such as an options object that may be
`undefined`, give a wider type: `string`, or the key in any of the target cases.

To use it in a callback, wrap it in a function:
`keys.map((key) => transformKey(key, { targetCase: 'snake' }))`.

---

## Advanced: explicit output type overload

If you want to specify the output type explicitly (for example, when you know the exact shape you want), you can use the following overload:

```typescript
const result = transform<Input, Output>(obj, { targetCase: 'camel' });
const typedResult: Output = result; // TypeScript will enforce Output type here
```

**Note:**

- When using this overload, you cannot pass `sourceCase` in the options; TypeScript reports an error if you do.
- This overload is useful when you want to take full control of the output type, but type safety between input, options, and output is not enforced by the library.
- If you want the result type inferred, use the standard overload:

```typescript
const result = transform(obj, { targetCase: 'camel' }); // Output type is inferred
```

---

## Key Preservation Rules

A key is left **completely unchanged** when it:

- **starts with anything other than a letter** (a digit or special character), e.g. `1st_place`, `_private`;
- **ends with a non-alphanumeric character**, e.g. `value_`, `count-`;
- **contains characters outside** `A-Z a-z 0-9 _ -`, e.g. `user.name`, `a@b`;
- **contains consecutive `__` or `--`**, e.g. `a__b`, `x--y` (ambiguous to detect);
- **is a UUID** (8-4-4-4-12 hexadecimal digits, in either case), e.g.
  `f47ac10b-58cc-4372-a567-0e02b2c3d479`: it is data, not a name, so it is kept whether
  it starts with a digit or a letter;
- **is not written in one recognisable case**, e.g. `mixed_Case`, `USER_ID`, `a_b-c`, or
  is a word of two or more capitals, e.g. `ID`, `USD`, `B2B`.

CONSTANT_CASE keys such as `USER_ID` fall under the last rule, so every target case keeps
them: `'constant'` is a target case only. A single capital, with or without digits
(`X`, `P99`), is not kept: it is converted as a one-letter word.

Trailing digits are kept but treated as part of the word, so they do **not** by
themselves preserve a key — `address_1` becomes `address1`, and the single word
`item2` stays `item2`.

These rules apply to `Map` keys, to `transformKey` and to the result types as well. To
keep other keys unchanged, such as IDs or the keys of free-form metadata, list their
paths in [`exclude`](#leaving-keys-unchanged).

---

## What Gets Transformed

| Value                                                                                                                                         | Result                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Plain objects, `Object.create(null)` objects                                                                                                  | A new plain object with transformed keys                                                   |
| Class instances                                                                                                                               | A new plain object with their own enumerable properties (prototype methods are not copied) |
| Arrays                                                                                                                                        | A new array with every item transformed                                                    |
| `Map`, including one from another realm                                                                                                       | A new `Map` with string keys transformed and every value transformed                       |
| `Set`, including one from another realm                                                                                                       | A new `Set` with every member transformed (primitive members are kept as-is)               |
| Primitives, functions and built-ins such as `Date`, `RegExp`, `Error`, `URL`, `Promise`, typed arrays, `Buffer`                               | Returned untouched (the same reference)                                                    |
| Objects with a `Symbol.toStringTag` of their own or from their class, `arguments` objects, module namespaces, and Proxies around a Map or Set | Returned untouched (the same reference)                                                    |

Enumerable symbol-keyed properties are copied, with their values untransformed.

Worth knowing:

- If two keys of one object become the same key (`user_id` and `userId` both become
  `userId`), the last one wins.
- Every property is read in order, and its value is transformed before the next one is
  read; getters run during the transformation. Maps are read through their iterator. An
  object is read once for every copy made of it, which is one copy unless
  `keepReferences: false` (see the option), `depth` or `exclude` (below) make several.
- With `depth`, values below the limit are returned as they are: the result shares them
  with the input instead of copying them. An object reached at several levels is
  transformed once per level.
- With `exclude`, an object reached through several keys is transformed once for each
  set of paths that match below them: one result when the same paths continue below
  every key, one per set otherwise.
- The transformation is recursive, so very deeply nested data hits a limit: see
  [Limits](#limits).

---

## Limits

Measured with Node 24 on an Apple M4 Pro, with Node's default stack and memory sizes:

- **Nesting depth.** The conversion is recursive. Depending on the shape, the first call
  in a process converts 1,300 to 2,400 levels of nesting (nested Maps the fewest, nested
  objects the most); deeper data throws a `RangeError`. Later calls can go deeper, up to
  about 4,800 levels, depending on the data converted before. API data nests far less,
  but untrusted input can nest deeper (`JSON.parse` accepts millions of levels), so catch
  the error where such input is converted.
- **Size.** There is no fixed limit on keys, objects or array items. The result is a full
  copy, so the input and the result must both fit in memory: converting 1 million records
  of 30 keys (260 MB in memory, as `JSON.parse` returns them) took 0.7 seconds and needed
  420 MB more at its peak, and 370 MB with `keepReferences: false`. When memory runs out,
  Node ends the process, which cannot be caught.
- **Long keys.** Conversion time grows linearly with a key's length: about 20 ms for a key
  of a million characters.

---

## Versioning

deep-case-crafter follows [semantic versioning](https://semver.org). The v3 API is
stable. Key outputs change only to fix bugs, and every change is listed in the
[changelog](https://github.com/gyrgy/deep-case-crafter/blob/main/CHANGELOG.md): if you
store converted keys, such as database columns, check it before upgrading. A minor
version can add an option, which `Required<TransformOptions>`,
`Required<TransformToOptions>` and `Required<TransformKeyOptions>` then require, or a target case, which code that handles
every member of `StringCase` then has to handle too. It can also reject at compile time
options that the runtime ignores or rejects, as 3.5.0 did for a string or a number in
place of the options object.

### Upgrading to v3

The changes from 2.x, and what to update, are listed under
[3.0.0](https://github.com/gyrgy/deep-case-crafter/blob/main/CHANGELOG.md#300---2026-10-25)
in the changelog.

---

## Contributing

1. Fork the repository.
2. Create a new branch (`feature/my-feature`).
3. Commit your changes.
4. Run `npm run check` (lint, formatting, types, tests with coverage, build, the
   published types and the fast objects of the build).
5. Submit a pull request.

---

## License

MIT

---

## Links

- [NPM Package](https://www.npmjs.com/package/deep-case-crafter)
- [GitHub Repository](https://github.com/gyrgy/deep-case-crafter)
- [Changelog](https://github.com/gyrgy/deep-case-crafter/blob/main/CHANGELOG.md)
- [Security Policy](https://github.com/gyrgy/deep-case-crafter/blob/main/SECURITY.md)
- [TypeScript Docs](https://www.typescriptlang.org/)
