# DeepCaseCrafter

**DeepCaseCrafter** transforms deeply nested object keys between case formats (`camelCase`, `PascalCase`, `snake_case`, `kebab-case`). It works on objects, arrays, Maps, and Sets, with configurable recursion depth, and types the result precisely: every key is typed the way it is transformed at runtime (with a few [exceptions](#result-types)).

[![npm version](https://img.shields.io/npm/v/deep-case-crafter)](https://www.npmjs.com/package/deep-case-crafter)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/deep-case-crafter)](https://bundlephobia.com/package/deep-case-crafter)
[![npm type definitions](https://img.shields.io/npm/types/deep-case-crafter)](https://www.npmjs.com/package/deep-case-crafter)
[![Dev dependency: typescript](https://img.shields.io/github/package-json/dependency-version/gyrgy/deep-case-crafter/dev/typescript/main)](https://github.com/gyrgy/deep-case-crafter/blob/main/package.json)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/gyrgy/deep-case-crafter#readme)
[![Maintenance](https://img.shields.io/maintenance/yes/2026.svg)](https://github.com/gyrgy/deep-case-crafter/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/gyrgy/deep-case-crafter/blob/main/LICENSE)

## Features

- Converts keys to `camelCase`, `PascalCase`, `snake_case`, and `kebab-case`.
- **Acronym-aware**: `HTTPResponse` → `http_response` or `httpResponse`, `userID` → `user_id` — not `h_t_t_p_...` or `hTTPResponse`.
- Works with deeply nested structures, including objects, arrays, Maps, and Sets.
- Leaves `Date`, `RegExp`, `Error`, typed arrays, `Buffer` and other built-in values untouched.
- **Precise result types**: every key is typed the way it is transformed at runtime, so `result.firstName` is known at compile time without casts.
- Preserves special keys (`__`, `--`, leading numbers, special characters, words in capitals).
- Configurable recursion depth (default: fully recursive).

## Installation

```bash
npm install deep-case-crafter
```

The type definitions require TypeScript 4.7 or later.

> **⚠️ v2 breaking change:** `transform` is now a **named export**. Update
> `import transform from 'deep-case-crafter'` to
> `import { transform } from 'deep-case-crafter'` (CommonJS:
> `const { transform } = require('deep-case-crafter')`). This fixes type
> resolution for modern (`node16`/`nodenext`/bundler) consumers.

> **⚠️ v3 breaking changes:** result types are precise without `sourceCase`, a few keys
> convert differently, built-in values are returned untouched, and invalid options
> throw. See [Upgrading to v3](#upgrading-to-v3).

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

## Acronym-aware conversion

When converting **to** `snake_case` or `kebab-case`, runs of capitals (acronyms)
are treated as whole words instead of being split letter-by-letter:

```typescript
const input = { getHTTPResponse: 1, userID: 2, parseHTMLString: 3 };
const result = transform(input, { targetCase: 'snake' });

console.log(result);
// Output: { get_http_response: 1, user_id: 2, parse_html_string: 3 }
//   (not  { get_h_t_t_p_response, user_i_d, ... })
```

A plural `s` stays with its acronym: `allowedURLs` → `allowed_urls`,
`getURLsForIDs` → `get_urls_for_ids`. An `s` word that follows an acronym directly is
read the same way, so `SSLIsEnabled` becomes `sslis_enabled`.

When converting `PascalCase` **to** `camelCase`, a leading acronym is lowercased as
a whole. Two capitals followed by a lowercase letter are a one-letter word and the next
word, unless that letter is a plural `s` ending the acronym:

```typescript
const input = { HTTPResponse: 1, UserID: 2, XAxis: 3, IDs: 4 };
const result = transform(input, { targetCase: 'camel' });

console.log(result);
// Output: { httpResponse: 1, userID: 2, xAxis: 3, ids: 4 }
```

Words of two or more capitals, such as `ID`, `USD` or `GET`, are left unchanged, like
`SCREAMING_SNAKE` keys (see [Key Preservation Rules](#key-preservation-rules)). A single
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
- **options**:
  - `targetCase` (optional): `'camel' | 'snake' | 'pascal' | 'kebab'` (default: `'camel'`, also used for any falsy value such as `''`, `null` or `0`). Any other value throws a `TypeError`.
  - `depth` (optional): **How many nesting levels to transform** (default: `Infinity` — the whole structure; `null` means the same). `1` transforms only the top-level keys, `2` the keys one level down as well, and so on. The values of objects, Maps and Sets are one level deeper; array items stay on their array's level. A value that is not a number (`NaN`, `'3'`, `3n`) throws a `TypeError`.
  - `sourceCase` (**deprecated**): has no effect. Every key's case is detected from the key itself, at runtime and in the result type. It is still accepted, and so is the 2.x form with explicit type arguments, `transform<Data, 'snake', 'camel'>(data, { sourceCase: 'snake', targetCase: 'camel' })`, except together with `depth` (leave the type arguments out to use `depth`); the key types follow the runtime, not `sourceCase` (see [Upgrading to v3](#upgrading-to-v3)).

Circular references are resolved to the transformed object. With a finite `depth`, a
cycle is transformed once per level down to the limit instead: the result grows with the
depth, and a depth of more than about a thousand levels on cyclic data exceeds the call
stack and throws a `RangeError`. Omit `depth` for cyclic data, or keep it small.

### Result types

The result type follows the runtime: every key is typed the way it is transformed
(including the [preservation rules](#key-preservation-rules)), untouched values such as
`Date` keep their type, and `readonly` arrays, tuples, Maps and Sets keep their shape. Use
`TransformResult<Data, TargetCase, Depth>` to name it.

- A literal `depth` is applied to the type precisely. A depth only known as a `number` (a
  variable, or `Infinity`) gives `unknown`, so omit `depth` to transform everything.
- `targetCase` and `depth` may be string enum members, branded literals, unions, or come
  from a stored options object: every options value they may hold gives its own result.
  Options that are not known at all give `unknown`: an options object that may be
  `undefined`, one typed as `TransformOptions` or `any`, one carrying other properties
  (without `sourceCase`), and options passed with only the input type given
  (`transform<Data>(data, options)`). Leave the type arguments out to get the precise
  type.
- When a library exports a value or function built on `transform`, annotate it with
  `TransformResult<...>`. Otherwise the result type is written out into its declaration
  files: recursive types (trees, JSON values) are cut off as `any`, and very large types
  or symbol-keyed members fail to compile (TS7056, TS4118). Generic functions around
  `transform` are not affected.
- Some values cannot be told apart by their types. `Error`, `URL`, boxed primitives,
  iterators, module namespace objects and other built-ins whose types do not declare a
  `Symbol.toStringTag` are returned untouched, but typed as plain objects with
  transformed keys. Class instances lose their prototype methods, getters and setters at
  runtime, while their type still lists them. A class that implements `Map`, `Set`,
  `ReadonlyMap` or `ReadonlySet` without extending `Map` or `Set` (and a Proxy around a
  Map or Set) is typed as a transformed `Map` or `Set`, but at runtime it is returned
  untouched when it has a `Symbol.toStringTag` (as every class implementing `Map` or
  `Set` does), and rebuilt as a plain object otherwise.

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
- **is not written in one recognisable case**, e.g. `mixed_Case`, `USER_ID`, `a_b-c`, or
  is a word of two or more capitals, e.g. `ID`, `USD`, `B2B`.

Trailing digits are kept but treated as part of the word, so they do **not** by
themselves preserve a key — `address_1` becomes `address1`, and the single word
`item2` stays `item2`.

These rules apply to the result types as well.

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

Symbol-keyed properties are copied unchanged.

Worth knowing:

- If two keys of one object become the same key (`user_id` and `userId` both become
  `userId`), the last one wins.
- Every property is read once, in order, and its value is transformed before the next one
  is read; getters run during the transformation. Maps are read through their iterator.
- With `depth`, values below the limit are returned as they are: the result shares them
  with the input instead of copying them. An object reached at several levels is
  transformed once per level.
- The transformation is recursive: data nested about a thousand levels deep or more can
  exceed the JavaScript call stack and throw an error (usually a `RangeError`).

---

## Upgrading to v3

Runtime behaviour:

- A few keys convert differently:
  - a leading acronym is lowercased as a whole in camelCase: `HTTPResponse` →
    `httpResponse` (was `hTTPResponse`), `IOStream` → `ioStream`, `URLs` → `urls`;
  - a plural `s` stays with its acronym: `allowedURLs` → snake_case `allowed_urls` (was
    `allowed_ur_ls`), `IDs` → camelCase `ids` (was `iDs`). An `s` word right after an
    acronym is read as a plural too: `SSLIsEnabled` → `sslis_enabled` (was
    `ssl_is_enabled`);
  - a key named `Infinity` is converted like any other word (`infinity`).
- `Date`, `RegExp`, `Error`, `URL`, typed arrays, `Buffer` and other built-ins, objects
  with a `Symbol.toStringTag` (their own or their class's), `arguments` objects and module
  namespaces are returned untouched. 2.x rebuilt them as plain objects, which turned a
  `Date` into `{}`.
- Maps and Sets from another realm (an iframe, `node:vm`) are transformed, and a Proxy
  around a Map or Set is returned untouched (2.x threw).
- Enumerable properties added to `Object.prototype` are no longer copied into results.
- Properties are read and transformed one at a time, so getters run in a different order,
  and Maps are read through their iterator rather than `entries()`.
- With a finite `depth`, an object reached at several levels is transformed once per
  level, and a circular reference is transformed down to the limit (see the API section
  for large depths). 2.x shared one result, which depended on key order and ignored the
  limit.
- An unsupported `targetCase`, or a `depth` that is not a number, throws a `TypeError`.
- Very deeply nested data reaches the call stack limit at different depths: nested
  objects can go deeper than in 2.x, chains of Maps or Sets nested more than about 1,400
  levels deep no longer fit.

Types:

- The result type is precise without `sourceCase`, which is deprecated and has no effect.
  `TransformResult` is exported to name it.
- Assigning or casting (`as Foo`) the result of `transform(x)` to a declared type now
  checks it against the real result type; a cast to an unrelated type fails with TS2352.
  If `x` is typed `unknown` or loosely, state the output type:
  `transform<Input, Output>(x)`.
- `depth: Infinity` (or any `depth` not known as a literal) gives `unknown`: omit `depth`
  instead.
- An input typed `any` gives `any` (2.x gave `unknown`).
- Key types follow the runtime, also when `sourceCase` is passed, so code that relied on
  2.x's key types for keys the runtime converts differently (`result.hTTPResponse`) no
  longer compiles.
- `TransformOptions` includes `depth`, so `Required<TransformOptions>` requires it.
- The 2.x form with three type arguments, `transform<Data, 'snake', 'camel'>(...)`, no
  longer accepts `depth`: leave the type arguments out instead. As an instantiation
  expression (`ReturnType<typeof transform<Data, 'snake', 'camel'>>`) it no longer
  compiles: use `TransformResult<Data, 'camel'>`.
- `Parameters<typeof transform>[1]` (the options of the last overload) no longer includes
  the deprecated `sourceCase`.

---

## Contributing

1. Fork the repository.
2. Create a new branch (`feature/my-feature`).
3. Commit your changes.
4. Run `npm run check` (lint, formatting, types, tests with coverage, build and the
   published types).
5. Submit a pull request.

---

## License

MIT

---

## Links

- [NPM Package](https://www.npmjs.com/package/deep-case-crafter)
- [GitHub Repository](https://github.com/gyrgy/deep-case-crafter)
- [TypeScript Docs](https://www.typescriptlang.org/)
