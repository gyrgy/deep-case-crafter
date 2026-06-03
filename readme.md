# DeepCaseCrafter

**DeepCaseCrafter** transforms deeply nested object keys between case formats (`camelCase`, `PascalCase`, `snake_case`, `kebab-case`). It works on objects, arrays, Maps, and Sets, with configurable recursion depth, and produces precise output types when both `sourceCase` and `targetCase` are set.

[![npm version](https://img.shields.io/npm/v/deep-case-crafter)](https://www.npmjs.com/package/deep-case-crafter)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/deep-case-crafter)](https://bundlephobia.com/package/deep-case-crafter)
[![npm type definitions](https://img.shields.io/npm/types/deep-case-crafter)](https://www.npmjs.com/package/deep-case-crafter)
[![Dev dependency: typescript](https://img.shields.io/github/package-json/dependency-version/gyrgy/deep-case-crafter/dev/typescript/main)](https://github.com/gyrgy/deep-case-crafter/blob/main/package.json)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/gyrgy/deep-case-crafter#readme)
[![Maintenance](https://img.shields.io/maintenance/yes/2026.svg)](https://github.com/gyrgy/deep-case-crafter/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/gyrgy/deep-case-crafter/blob/main/LICENSE)

## Features

- Converts keys to `camelCase`, `PascalCase`, `snake_case`, and `kebab-case`.
- Works with deeply nested structures, including objects, arrays, Maps, and Sets.
- Precise TypeScript inference when `sourceCase` and `targetCase` are set (otherwise the result type is widened).
- Preserves special keys (`__`, `--`, leading numbers, special characters).
- Configurable recursion depth (default: fully recursive).

## Installation

```bash
npm install deep-case-crafter
```

> **⚠️ v2 breaking change:** `transform` is now a **named export**. Update
> `import transform from 'deep-case-crafter'` to
> `import { transform } from 'deep-case-crafter'` (CommonJS:
> `const { transform } = require('deep-case-crafter')`). This fixes type
> resolution for modern (`node16`/`nodenext`/bundler) consumers.

---

## Quick Start

### 1. Basic usage — just call `transform`

```typescript
import { transform } from 'deep-case-crafter';

const input = { user_id: 1, first_name: 'John' };
const result = transform(input);

console.log(result);
// Output: { userId: 1, firstName: 'John' }
```

_(Automatically converts from `snake_case` to `camelCase`)_

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

### 3. Explicitly define `sourceCase` for TypeScript benefits

_TypeScript infers the exact output keys when **both** `sourceCase` and `targetCase` are set._

```typescript
const input = { user_id: 1, first_name: 'John' };
const result = transform(input, { targetCase: 'camel', sourceCase: 'snake' });

console.log(result);
// Output: { userId: 1, firstName: 'John' }
```

---

### 4. Transform deeply nested structures

```typescript
const nestedInput = {
  user_info: { first_name: 'John', last_name: 'Doe' },
  posts: [{ post_id: 1, post_title: 'Hello' }],
};

const transformed = transform(nestedInput, {
  targetCase: 'camel',
  sourceCase: 'snake',
});

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
const mapInput = new Map([
  ['user_id', 1],
  ['first_name', 'John'],
]);

const result = transform(mapInput, {
  targetCase: 'camel',
  sourceCase: 'snake',
});

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
const result = transform(setInput, {
  targetCase: 'camel',
  sourceCase: 'snake',
});

console.log(result); // Set { { userId: 1 }, { firstName: 'John' } }

// Primitive members are left as-is:
const strings = new Set(['user_id', 'first_name']);
console.log(transform(strings, { targetCase: 'camel', sourceCase: 'snake' }));
// Set { 'user_id', 'first_name' }
```

---

## API

### `transform(data, options)`

- **data**: The data structure to transform (`object`, `array`, `Map`, or `Set`).
- **options**:
  - `targetCase` (optional): `'camel' | 'snake' | 'pascal' | 'kebab'` (default: `'camel'`)
  - `sourceCase` (optional): `'snake' | 'camel' | 'pascal' | 'kebab'`. Omit it to auto-detect each key's case at runtime.
  - `depth` (optional): **Recursion depth** (default: `Infinity` — the whole structure is transformed). Pass a number to stop transforming below that level. Circular references are always handled safely.

> **TypeScript inference:** precise output types are produced only when both `sourceCase` and `targetCase` are passed. Without both, the call still works at runtime (auto-detecting each key) but the result type is `unknown`.

---

## Advanced: explicit output type overload

If you want to specify the output type explicitly (for example, when you know the exact shape you want), you can use the following overload:

```typescript
const result = transform<Input, Output>(obj, { targetCase: 'camel' });
const typedResult: Output = result; // TypeScript will enforce Output type here
```

**Note:**

- When using this overload, you cannot pass `sourceCase` in the options. If you do, TypeScript will show an error:
  > Object literal may only specify known properties, and 'sourceCase' does not exist in type 'Omit<TransformOptions, "sourceCase"> & { depth?: number }'.
- This overload is useful when you want to take full control of the output type, but type safety between input, options, and output is not enforced by the library.
- If you want to use `sourceCase` and benefit from type inference, use the standard overload:

```typescript
const result = transform(obj, { targetCase: 'camel', sourceCase: 'snake' }); // Output type is inferred
```

---

## Key Preservation Rules

A key is left **completely unchanged** when it:

- **starts with anything other than a letter** (a digit or special character), e.g. `1st_place`, `_private`;
- **ends with a non-alphanumeric character**, e.g. `value_`, `count-`;
- **contains characters outside** `A-Z a-z 0-9 _ -`, e.g. `user.name`, `a@b`;
- **contains consecutive `__` or `--`**, e.g. `a__b`, `x--y` (ambiguous to detect).

Trailing digits are kept but treated as part of the word, so they do **not** by
themselves preserve a key — `address_1` becomes `address1`, and the single word
`item2` stays `item2`.

---

## Contributing

1. Fork the repository.
2. Create a new branch (`feature/my-feature`).
3. Commit your changes.
4. Submit a pull request.

---

## License

MIT

---

## Links

- [NPM Package](https://www.npmjs.com/package/deep-case-crafter)
- [GitHub Repository](https://github.com/gyrgy/deep-case-crafter)
- [TypeScript Docs](https://www.typescriptlang.org/)
