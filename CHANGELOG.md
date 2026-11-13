# Changelog

All notable changes to deep-case-crafter are listed here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `transform`, and the functions that `transformTo` makes, no longer slow down for the
  rest of the process after converting one object keyed by numbers (`{ "1": … }`), or
  one with at most one key whose keys V8 cannot list from its hidden class: one made by
  `Object.create(null)`, or one in dictionary mode, as an object that keys were deleted
  from can be. After such an object, on Node 24 and later, V8 compiled the loop that
  reads objects about a thousand times in 40 conversions, and records of 5 to 100 keys
  took 2.1 to 2.5 times as long to convert. The loop now reads values through a function
  of its own, which keeps V8 from compiling it again and again: measured with Node 24 on
  an Apple M4 Pro, those records then convert in 27–42% less time than with 3.7.0 (25–38%
  with Node 26), and other data converts as fast as before: no scenario measured takes
  over 3% longer. Node 20 and 22 never compiled the loop again, and are as fast as with
  3.7.0: after such an object, V8 there takes a slower path through the loop, which
  still takes 7–65% longer than before it.
- A number of another kind in the middle of a call, a fraction or one of 2^31 or more in
  a field of whole numbers, no longer leaves the later results of 20 to 200 keys with
  that layout in dictionary mode. From the third result of a layout in a call, or from
  when the call stops learning layouts, `transform` keeps a copy of the layout without
  data, as the functions that `transformTo` makes have since 3.7.0, so a number of
  another kind in the third result leaves only that result in dictionary mode. 3.7.0
  left every later result in dictionary mode for records built with computed keys, as
  some database drivers build rows. Emptying the copy costs about 0.2 µs for each layout
  of 20 keys, 0.3 µs for 30 keys and 0.6 µs for 50 keys that a call meets three times or
  more: 4–18% of the time of a call that converts 3 to 20 such records, the most for 3,
  and nothing for a call with fewer.

### Changed

- `transform` takes about 3.9 KB gzipped, bundled and minified (3.7 KB).

## [3.7.0] - 2026-11-11

### Added

- `transformTo(targetCase, options)` makes a function that transforms the keys of its
  argument as `transform(data, { targetCase, ...options })` does, with the same result
  type. The function it makes uses only its first argument, so it can be passed by name
  as a callback, and its result type stays exact there:
  `fetchUser().then(transformTo('camel'))`, `items.map(transformTo('snake'))`. Passed by
  name, `transform` itself gets an `unknown` result type, and `map` passes it the index
  as its options. The options are checked and read once, when the function is made.
- A function made by `transformTo` remembers the layouts of its results across its
  calls, so records of 20 to 200 keys converted one per call, as `rows.map(toCamel)`
  does, are fast objects from the fourth call on, and from the first once the function
  knows their layout. Measured with Node 24 on an Apple M4 Pro, for 20,000 records
  converted one per call, a third of whose values were strings, the function took
  17–25% less time than one call to `transform` per record at 20, 30, 50 and 100 keys,
  7–10% less at 85 and 200 keys, and between 4% less and 3% more at 150 to 170 keys.
  Its results took 33–40% less memory and read 2.4 to 4.4 times as fast by property
  name; read by a computed key from a list of keys, they take 1.5 times as long at 30
  keys and 2.2 times at 100, as the results of one call to `transform` have since 3.6.0.
  Records of fewer keys or in many shapes, and objects keyed by IDs, convert within 2%
  of the time they took with `transform`.
- Once a call has returned, the function keeps none of its data but keys: the keys of
  some results, and for each layout it has learned, a copy of a result with an empty
  object in place of every value. A record with a value of another kind in a field,
  such as a fraction where the others had whole numbers, leaves the layout fast. The
  function checks each layout with the first result of that layout in a call. Once it
  has learned 16 layouts (with `exclude`, 16 for one set of matching paths), or results
  with the same number of keys and last key have other keys, the rest of that call and
  its later calls learn as calls to `transform` do.
- The types `TransformTo<TargetCase, Options>`, of such a function, and
  `TransformToOptions`, of its options (`depth`, `exclude` and `keepReferences`), which
  `TransformOptions` now extends.

### Changed

- `transform` takes about 3.7 KB gzipped, bundled and minified (3.2 KB).
- `transform` reads `keepReferences` from its options before `exclude`, as
  `transformTo` does, so getters or a Proxy among the options see them in that order.
  Its results, and the errors that invalid options throw, are the same as before.

## [3.6.0] - 2026-11-08

### Changed

- Results of 20 to 200 keys take a quarter to a seventh of the memory and read faster,
  and most of them convert faster. V8 stores an object built with computed keys, as
  `transform` builds its results, in dictionary mode from its 20th key, unless a fast
  object with the same keys in the same order already exists: each object then holds its
  own table of keys. `transform` now makes one, with a single copy, from the second result
  of each layout that repeats in a call, so the results after it are fast objects.
  Measured with Node 24 on an Apple M4 Pro, records of 20 to 50 keys convert in 41–49%
  less time, in calls of 50 to 60,000 records, and wider ones in 7–29% less, except
  records of about 150 to 170 keys, which take up to 3% longer. Reading the results by
  property name is 1.6 to 4 times as fast, with `for...in` 2.6 times and with
  `Object.values` 20 times; reading them by a computed key from a list of keys takes 1.4
  times as long (2.2 times at 100 keys). 1 million records of 30 keys convert in 0.7
  instead of 1.4 seconds, with 420 MB instead of 1.7 GB more memory at the peak. Other
  data converts within 2% of the time it took before.
- These convert as before:
  - the first two results of each layout in a call, so a call with only one or two
    records of a layout gains only while results of that layout from an earlier call
    are still in memory;
  - layouts seen once in a call, such as those of objects keyed by IDs, and layouts that
    come back only after 16 other new layouts of 20 to 200 keys;
  - objects of more than 200 keys, which V8 builds faster in dictionary mode;
  - records that come in many shapes, with optional keys present or left out. A call
    stops learning once a result has the number of keys and the last key of a layout it
    has seen once, but other keys, since such data reads faster when all of it stays in
    dictionary mode. A result with the number of keys and the last key of a layout the
    call has already learned, but other keys, stays in dictionary mode.
- A call learns at most 16 layouts. With `exclude`, each set of matching paths learns on
  its own.
- Nesting depth: the first call in a process converts 2–4% deeper data than before
  (nested objects 2,400 instead of 2,300 levels). After ordinary API payloads, later calls
  convert every shape at least as deep as before (nested objects 2,500 instead of 2,400
  levels). After deeply nested data of the same shape, they convert nested objects about
  8% deeper (4,800 instead of 4,400 levels), and nested arrays, Maps and Sets, or objects
  and arrays in turn, about 8% less deep (4,800 instead of 5,200). Objects, arrays, Maps
  and Sets nested in turn then convert 5% less deep (3,300 instead of 3,500).
- The package is built for ES2018 (it was ES2016), for the object spread syntax that
  makes the copies. It needs Node 8.3, Chrome 60, Firefox 55, Safari 11.1 (iOS 11.3),
  Samsung Internet 8 or Edge 79, or later: Edge 17 and 18 and Safari 11.0 no longer load
  it.
- `transform` takes about 3.2 KB gzipped, bundled and minified (2.9 KB).
- Readme: the figures under Limits are measured on 1 million records of 30 keys as
  `JSON.parse` returns them, which take 260 MB. On that input, 3.5.0 needed 1.7 GB more
  at its peak.

## [3.5.0] - 2026-11-06

### Added

- `deep-case-crafter/package.json` can be required or imported (it threw
  `ERR_PACKAGE_PATH_NOT_EXPORTED`), as some tools do to read a dependency's version. The
  package also declares `"sideEffects": false`, so bundlers can drop it when it is
  unused, and `"type": "commonjs"`.
- Readme: a table of the calls for common tasks, after the first example.

### Changed

- A string in place of the options throws a `TypeError` (see Fixed), also one that a
  callback passes: lodash's `mapValues(object, transform)` passes each key, so it now
  throws instead of converting each value to camelCase, and TypeScript does not report
  it. Wrap the call: `mapValues(object, (value) => transform(value))`.
- `rows.map(transform<Row>)` or `Array.from(rows, transform<Row>)`, with only the input
  type given, no longer compiles under `strict`, since the callback receives each index
  as the options (its result was typed `unknown[]`). `rows.map(transform)` compiles as
  before, with an `unknown` result type; `rows.map((row) => transform(row))` gives the
  precise one.
- Options typed `object` (or, without `strict`, `unknown`), which may hold any
  `targetCase`, give an `unknown` result type instead of the camelCase result.
- `transformKey(key, 'foo')`, with a string that is not a target case in place of the
  options, throws the message `transform` throws, which suggests `{ targetCase: "snake" }`
  instead of `{ targetCase: "foo" }`.
- Result types take fewer instantiations to check than in 3.4.1: about 4% fewer in this
  package's type tests, and 12% for large nested types. Only keys with at least four
  hyphens are compared with the UUID form, and the depth limit is checked once for each
  object instead of once for each value.
- With TypeScript 4.7 to 4.9, a primitive literal passed without options is typed by its
  base type: `transform('id')` is `string`, not `'id'`, since the result type now
  distributes over the input (see Fixed). TypeScript 5.0 and later keep the literal.
- `transform` takes about 2.9 KB gzipped, bundled and minified (2.8 KB), with the messages
  for string options.
- A shorter npm description.

### Fixed

- `transform(data, 'snake')`, with the target case in place of the options object,
  converted to camelCase without an error. It now fails to compile and throws a
  `TypeError`, as `transformKey(key, 'snake')` already did. Another primitive in place
  of the options (a number, a boolean, a bigint or a symbol) is a type error as well, and
  is still ignored at runtime, so that `rows.map(transform)` keeps working.
- Generic code can read the properties of a result through the constraint of its input:
  `transform(user).userId` compiles in `<T extends { user_id: number }>(user: T) => ...`,
  for every target case and option (it failed with TS2339). `TransformValue` and
  `TransformValueExcluding` distribute over the input type for this. Declaration files
  emitted with earlier versions refer to them with the same parameters, and keep working.
- Non-enumerable symbol-keyed properties were copied into the result, as enumerable ones.
  They are left out, like non-enumerable string keys, as `{ ...object }` does.
- Readme and option docs: with `keepReferences: false`, a getter on a circular path runs
  up to 256 times before the conversion starts over (not twice), and an object is read
  once for every copy made of it. Later calls convert up to about 5,200 levels of nesting,
  depending on the data converted before, but not always 2,600 or more. A function with a
  generic target case cannot annotate its result as `TransformResult<T, C>`, which the
  readme advised for exported functions: leave it inferred.

## [3.4.1] - 2026-11-06

### Changed

- Faster, with the same results (measured with Node 24 on an Apple M4 Pro):
  - Typical API payloads: 8-15% faster; small objects about 1.3x.
  - Arrays of objects: 15-30% faster. Records holding arrays of numbers: about 1.3x.
  - Large inputs: 100,000 records convert in 132 ms instead of 163 ms, 1 million records
    in 1.73 s instead of 1.86 s (0.87 s instead of 1.05 s with `keepReferences: false`),
    and 100 MB of JSON in 86 ms instead of 100 ms.
  - About half as much memory is allocated per object. The minified build no longer
    creates a closure for each of the traversal's helpers on every object, array, Map
    and Set, and values that are not objects are stored without a function call.
- Nesting limits on the first call in a process are 2-4% lower, as a stack frame grew:
  2,291 levels of nested objects instead of 2,382, and 1,295 of nested Maps instead of
  1,324. Once the code is warm they are the same or higher: 5,176 levels of nested Maps
  and Sets instead of 4,436. The Limits section lists them.

## [3.4.0] - 2026-10-30

### Added

- The target case `'constant'`: CONSTANT_CASE, also called SCREAMING_SNAKE_CASE.
  `transform(data, { targetCase: 'constant' })` turns `userID` into `USER_ID`, typed
  `USER_ID`. Words are split as for snake_case: `getHTTPResponse` becomes
  `GET_HTTP_RESPONSE`, `addressLine1` becomes `ADDRESS_LINE1`. `transformKey` and the
  `TransformKey` and `TransformResult` types take it as well.

  It is a target case only. CONSTANT_CASE keys such as `USER_ID` or `ID` are left
  unchanged by every target case, as before, so they do not convert back. A single
  capital, with or without digits, is converted as a one-letter word, as before:
  `'constant'` turns `p99` into `P99`, and camelCase, snake_case and kebab-case turn
  `P99` back into `p99`.

- The type exports `PlainCase` and `CaseOrDefault`. Declaration files emitted for code
  with a generic target case, such as
  `<C extends StringCase>(targetCase: C) => transformKey(key, { targetCase })`, refer to
  them instead of writing out the list of target cases, so cases added in later versions
  are typed as well. Like `TransformKeyToEach`, they are not meant for direct use.

### Changed

- `StringCase` includes `'constant'`. Code that handles every member of it, such as an
  exhaustive `switch` or a `Record<StringCase, ...>`, has to handle `'constant'` too.
- Declaration files that a library emitted with an earlier version list the four earlier
  target cases in most functions that take a generic or `StringCase` target case and
  return an inferred result. `'constant'` can be passed through such a function, but its
  result is typed `never`, or as the results of other cases only: for an optional target
  case, the camelCase result, which compiles but does not match the runtime. Rebuilding
  the library with 3.4.0 fixes them; the rebuilt declaration files refer to types added
  in 3.4.0, so the library then needs 3.4.0 or later. Annotating the results for a target
  case typed `StringCase` with `TransformResult<...>` or `TransformKey<...>` also keeps
  them right for cases added later (see
  [Result types](https://github.com/gyrgy/deep-case-crafter#result-types)).
- The result type for a `targetCase` typed `StringCase` includes the CONSTANT_CASE
  result. Very large results of that kind take about a fifth more work to check, and
  reach TypeScript's instantiation limit (TS2589) sooner. A literal `targetCase` costs the
  same as before.
- The `TypeError` for an unsupported `targetCase` lists `constant` among the supported
  cases.

## [3.3.0] - 2026-10-28

### Added

- The `keepReferences` option. `keepReferences: false` skips the bookkeeping that keeps
  shared and circular references in shape, for data that has none, such as the output of
  `JSON.parse`: inputs with many objects and arrays convert up to about twice as fast
  (1 million records: 1.0 s instead of 2.0 s). An object is then copied once for every
  path that leads to it. Data with more than 256 nested objects, arrays, Maps and Sets on
  one path, as circular references always have, is converted again from the start with
  the bookkeeping; with a finite `depth`, circular references are copied down to the
  depth limit instead. Anything but a boolean throws a `TypeError`.
- Readme: a [Limits](https://github.com/gyrgy/deep-case-crafter#limits) section with the
  measured nesting depth and memory use.

### Changed

- Faster, with the same results (measured with Node 24 on an Apple M4 Pro):
  - Large inputs: 1 million records with 30 million keys convert in 2.0 s instead of
    3.5 s. References are tracked in a `Map` instead of a `WeakMap`.
  - Keys seen only once, such as the keys of a large lookup object: about 1.9x faster.
  - Arrays of numbers or strings: about 1.7x faster. Items that are not objects are
    copied without a function call.
  - Typical API payloads: 5-14% faster.
  - A key's case is detected in one pass over its characters, without regular
    expressions.
- Nesting limits are a little lower, as the stack frames grew: on the first call in a
  process, for example, 2,389 levels of nested objects instead of 2,486, and 1,328 of
  nested Maps instead of 1,390. The Limits section lists them.
- `TransformOptions` includes `keepReferences`, so code that types a complete options
  object as `Required<TransformOptions>` has to add it.

### Fixed

- Converting more than about 22 million objects and arrays in one call aborted the
  process with V8's fatal "invalid table size" error, which could not be caught.
  23 million one-key objects now convert in 6.9 s.
- Data nested too deeply for the call stack threw a `SyntaxError` ("Invalid regular
  expression: … Stack overflow") on the first call in a process. It now throws a
  `RangeError`, as later calls did.

## [3.2.0] - 2026-10-26

### Added

- `transformKey(key, options)` converts a single key by the same rules as `transform`,
  with the same `targetCase` option and default:
  `transformKey('userID', { targetCase: 'snake' })` returns `'user_id'`, typed
  `'user_id'`. A string that is not a key in one of the four cases, such as
  `'Hello World'`, `'USER_ID'` or a UUID, is returned unchanged. A key that is not a
  string, or a target case passed in place of the options (`transformKey(key, 'snake')`),
  throws a `TypeError`. See
  [`transformKey`](https://github.com/gyrgy/deep-case-crafter#transformkeykey-options).
- The type `TransformKey<Key, TargetCase>`: the key `Key` becomes in `TargetCase`. A
  union of keys or of target cases gives the union of their results.
- The type `TransformKeyOptions`, the options of `transformKey`. `TransformOptions`
  extends it.
- The type export `TransformKeyToEach`, which declaration files emitted for code around
  `transformKey` refer to, such as a function with a fixed key and a generic target
  case. Like `TransformResultFor`, it is not meant for direct use.

## [3.1.0] - 2026-10-26

### Added

- An `exclude` option: paths of keys to leave unchanged, such as
  `transform(data, { exclude: ['users_by_id.*', 'metadata.*'] })`. A path is the chain
  of input keys that leads to a key, joined with `.`, and `*` matches any key. Array
  items and Set members add no key to a path, Map keys do. The value of a kept key is
  still transformed. The result type follows paths written inline or `as const`; paths
  only known as `string[]` give `unknown`. Anything but an array of such paths throws a
  `TypeError` (`null` means none). See
  [Leaving keys unchanged](https://github.com/gyrgy/deep-case-crafter#leaving-keys-unchanged).
- `TransformResult` takes the `exclude` paths as a fourth type parameter:
  `TransformResult<Data, TargetCase, Depth, Exclude>`.
- The type exports `TransformValueExcluding` and `TransformResultForExcluding`, which
  declaration files emitted for generic code around `transform` refer to. Like
  `TransformValue`, they are not meant for direct use.
- Readme: to pass `transform` as a callback, wrap it in a function, as in
  `rows.map((row) => transform(row))`. Passed by name, it gets an `unknown` result type.
- This changelog and a security policy.

### Changed

- `TransformOptions` includes `exclude`, and so does `Parameters<typeof transform>[1]`.
  This breaks code that types a complete options object as `Required<TransformOptions>`:
  add `exclude: []` to it.
- Declaration files emitted for generic functions around `transform` that pass a generic
  `depth` are shorter: they refer to `TransformResult`. Their meaning is unchanged.

### Fixed

- A single capital before a capitalised word is a word of its own in snake_case and
  kebab-case, as it already was in camelCase and PascalCase. `isAValidUser` had become
  `is_avalid_user` in 2.1.0, and `three_d_secure` → `threeDSecure` now comes back as
  `three_d_secure`. Units such as `MHz` and `KBps` are split the same way.

  If you store keys converted to snake_case or kebab-case, such as database columns or
  the keys of request bodies, check them for this pattern before upgrading. These
  snake_case outputs change (kebab-case is the same with `-`):

  | Key              | Before (3.0.0)     | After               |
  | ---------------- | ------------------ | ------------------- |
  | `isAValidUser`   | `is_avalid_user`   | `is_a_valid_user`   |
  | `hasAPrimaryKey` | `has_aprimary_key` | `has_a_primary_key` |
  | `getAValue`      | `get_avalue`       | `get_a_value`       |
  | `threeDSecure`   | `three_dsecure`    | `three_d_secure`    |
  | `XAxis`          | `xaxis`            | `x_axis`            |
  | `ETag`           | `etag`             | `e_tag`             |
  | `IPhone`         | `iphone`           | `i_phone`           |
  | `OAuthToken`     | `oauth_token`      | `o_auth_token`      |
  | `OAuth2Token`    | `oauth2_token`     | `o_auth2_token`     |
  | `IPv4`           | `ipv4`             | `i_pv4`             |
  | `IPv6Address`    | `ipv6_address`     | `i_pv6_address`     |
  | `VCpuCount`      | `vcpu_count`       | `v_cpu_count`       |
  | `IDsort`         | `idsort`           | `i_dsort`           |
  | `cpuMHz`         | `cpu_mhz`          | `cpu_m_hz`          |
  | `frequencyGHz`   | `frequency_ghz`    | `frequency_g_hz`    |
  | `MBps`           | `mbps`             | `m_bps`             |
  | `speedKBps`      | `speed_kbps`       | `speed_k_bps`       |

  camelCase and PascalCase outputs are unchanged. The result types match.

- UUID keys (8-4-4-4-12 hexadecimal digits, in either case) keep their names, as object
  keys, as Map keys and in the result types. A lowercase UUID that starts with a letter
  was converted before: `f47ac10b-58cc-4372-a567-0e02b2c3d479` became
  `f47ac10b58cc4372A5670e02b2c3d479` in camelCase, `F47ac10b58cc4372A5670e02b2c3d479` in
  PascalCase and `f47ac10b_58cc_4372_a567_0e02b2c3d479` in snake_case. UUIDs that start
  with a digit or contain capitals were already kept.

## [3.0.0] - 2026-10-25

Result types are exact without `sourceCase`, acronyms are whole words in every target
case, built-in values are returned untouched, and invalid options throw.

### Added

- Every key of the result type is typed the way the runtime transforms it, including the
  preservation rules. Values the runtime leaves untouched keep their type; `readonly`
  arrays, tuples, Maps and Sets keep their shape; a literal `depth` is applied.
- `targetCase` and `depth` may be string enum members, branded literals, unions or
  stored options objects.
- Generic code around `transform` compiles with `declaration: true`.
- Object keys are converted once per target case and remembered in a bounded cache, so
  data with repeated keys, such as arrays of records, is transformed faster.
- Releases are published with npm provenance, and CI checks the published types on
  TypeScript 4.7, 6 and 7.

### Changed

These changes can break code written for 2.x.

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
  level, and a circular reference is transformed down to the limit (see the readme's API
  section for large depths). 2.x shared one result, which depended on key order and
  ignored the limit.
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

### Deprecated

- `sourceCase`: every key's case is detected from the key itself, at runtime and in the
  result type, so it has no effect. It is still accepted.

## [2.1.1] - 2026-06-04

### Changed

- Arrays are transformed in a single pass.

### Fixed

- A `__proto__` key is kept as an own key of the result. Before, it was dropped and its
  value became the result's prototype.
- Keys with characters outside `A-Z a-z 0-9 _ -`, such as `café_table` or `a.b_c`, keep
  their name in the result type, as they do at runtime.
- Result types of keys of about 50 characters or more, converted to snake_case or
  kebab-case, compile (they failed with TS2589).

## [2.1.0] - 2026-06-04

### Changed

- Acronyms are whole words when converting to snake_case or kebab-case: `userID` →
  `user_id` (was `user_i_d`), `getHTTPResponse` → `get_http_response` (was
  `get_h_t_t_p_response`). The result types match when `sourceCase` and `targetCase`
  are given.

## [2.0.1] - 2026-06-03

### Fixed

- Keys that start with a digit, such as `1st_place`, keep their name in the result type,
  as they do at runtime.

## [2.0.0] - 2026-06-03

### Changed

- `transform` is a named export. Update `import transform from 'deep-case-crafter'` to
  `import { transform } from 'deep-case-crafter'` (CommonJS:
  `const { transform } = require('deep-case-crafter')`). This fixes type resolution for
  modern (`node16`/`nodenext`/bundler) consumers.
- The default `depth` is `Infinity`, so the whole structure is transformed (was 3).
- ES module and CommonJS consumers get their own type declarations, through the
  package's `exports` map.

## [1.0.0] - 2025-07-05

### Added

- An overload with an explicit output type: `transform<Input, Output>(data, options)`.

## [0.0.5] - 2025-03-22

### Changed

- Readme and package keywords.

## [0.0.2] - 2025-03-16

### Added

- First release, followed by 0.0.3 and 0.0.4 on the same day. `transform`, the default
  export, converts the keys of nested objects, arrays, Maps and Sets between camelCase,
  PascalCase, snake_case and kebab-case, with typed results when `sourceCase` and
  `targetCase` are given. The default `depth` is 3.

[Unreleased]: https://github.com/gyrgy/deep-case-crafter/compare/v3.7.0...HEAD
[3.7.0]: https://www.npmjs.com/package/deep-case-crafter/v/3.7.0
[3.6.0]: https://www.npmjs.com/package/deep-case-crafter/v/3.6.0
[3.5.0]: https://www.npmjs.com/package/deep-case-crafter/v/3.5.0
[3.4.1]: https://www.npmjs.com/package/deep-case-crafter/v/3.4.1
[3.4.0]: https://www.npmjs.com/package/deep-case-crafter/v/3.4.0
[3.3.0]: https://www.npmjs.com/package/deep-case-crafter/v/3.3.0
[3.2.0]: https://www.npmjs.com/package/deep-case-crafter/v/3.2.0
[3.1.0]: https://www.npmjs.com/package/deep-case-crafter/v/3.1.0
[3.0.0]: https://www.npmjs.com/package/deep-case-crafter/v/3.0.0
[2.1.1]: https://www.npmjs.com/package/deep-case-crafter/v/2.1.1
[2.1.0]: https://www.npmjs.com/package/deep-case-crafter/v/2.1.0
[2.0.1]: https://www.npmjs.com/package/deep-case-crafter/v/2.0.1
[2.0.0]: https://www.npmjs.com/package/deep-case-crafter/v/2.0.0
[1.0.0]: https://www.npmjs.com/package/deep-case-crafter/v/1.0.0
[0.0.5]: https://www.npmjs.com/package/deep-case-crafter/v/0.0.5
[0.0.2]: https://www.npmjs.com/package/deep-case-crafter/v/0.0.2
