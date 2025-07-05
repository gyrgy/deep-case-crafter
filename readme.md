# DeepCaseCrafter

🚀 **DeepCaseCrafter** is a TypeScript utility that **transforms deeply nested object keys** into different case formats while maintaining **type safety**. It supports **objects, arrays, Maps, and Sets** and allows **custom recursion depth**.

[![npm version](https://img.shields.io/npm/v/deep-case-crafter)](https://www.npmjs.com/package/deep-case-crafter)
[![License: MIT](https://img.shields.io/npm/l/deep-case-crafter)](https://github.com/your-repo/deep-case-crafter/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## Features

- 🔄 **Automatically converts keys** to `camelCase`, `PascalCase`, `snake_case`, and `kebab-case`.
- 🌍 **Works with deeply nested structures**, including objects, arrays, Maps, and Sets.
- ✅ **Maintains TypeScript type inference** for better auto-completion.
- 🔍 **Preserves special keys** (`__`, `--`, leading numbers, special characters).
- ⚡ **Performance-optimized** with minimal overhead.
- 🎛 **Configurable recursion depth** (default: `3`).

## 📦 Installation

```bash
npm install deep-case-crafter
```

---

## 🚀 Quick Start

### 1️⃣ **Basic Usage – Just Call `transform`**

```typescript
import transform from 'deep-case-crafter';

const input = { user_id: 1, first_name: 'John' };
const result = transform(input);

console.log(result);
// Output: { userId: 1, firstName: 'John' }
```

_(Automatically converts from `snake_case` to `camelCase`)_

---

### 2️⃣ **Specify the `targetCase`**

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

### 3️⃣ **Explicitly Define `sourceCase` for TypeScript Benefits**

_TypeScript automatically infers key changes when `sourceCase` is set._

```typescript
const input = { user_id: 1, first_name: 'John' };
const result = transform(input, { targetCase: 'camel', sourceCase: 'snake' });

console.log(result);
// Output: { userId: 1, firstName: 'John' }
```

---

### 4️⃣ **Transform Deeply Nested Structures**

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

### 5️⃣ **Transforming a `Map`**

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

### 6️⃣ **Transforming a `Set`**

```typescript
const setInput = new Set(['user_id', 'first_name']);
const result = transform(setInput, {
  targetCase: 'camel',
  sourceCase: 'snake',
});

console.log(result); // Set { 'userId', 'firstName' }
```

---

## 📖 API

### `transform(data, options)`

- **data**: The data structure to transform (`object`, `array`, `Map`, or `Set`).
- **options**:
  - `targetCase` (optional): `'camel' | 'snake' | 'pascal' | 'kebab'` (default: `'camel'`)
  - `sourceCase` (optional): **Required for TypeScript inference** (`'snake' | 'camel' | 'pascal' | 'kebab'`).
  - `depth` (optional): **Recursion depth** (default: `3`, use `Infinity` for full recursion).

---

## 🧑‍💻 Advanced: Explicit Output Type Overload

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

## 🚨 Key Preservation Rules

- **Keys that start with special characters or numbers** are **not transformed**.
- **Keys with `__` or `--` remain unchanged**.
- **Numbers at the end of keys** are preserved.

---

## ⚡ Performance & Benchmarks

DeepCaseCrafter is optimized for speed and efficiency:

```plaintext
Transform Deep Object (Depth 5, Width 10)
x 361,538 ops/sec ±0.12% (91 runs sampled)
```

---

## 💡 Contributing

1. **Fork** the repository.
2. **Create a new branch** (`feature/my-feature`).
3. **Commit your changes** (`git commit -m "Add new feature"`).
4. **Submit a pull request** 🚀.

---

## 📜 License

MIT

---

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/deep-case-crafter)
- [GitHub Repository](https://github.com/your-repo/deep-case-crafter)
- [TypeScript Docs](https://www.typescriptlang.org/)
