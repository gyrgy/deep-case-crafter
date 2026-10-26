# Changelog

All notable changes to deep-case-crafter are listed here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows
[semantic versioning](https://semver.org/spec/v2.0.0.html).

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
