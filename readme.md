# DeepCaseCrafter

Transform deeply nested object, array, Map, and Set keys between common case formats while preserving TypeScript type safety.

## Features

- 🚀 Supports transformations between `snake_case`, `camelCase`, `PascalCase`, and `kebab-case`.
- 🔄 Recursively transforms deeply nested objects, arrays, Maps, and Sets.
- ✅ Preserves TypeScript type inference for precise auto-completion.
- 🔍 Detects preserved keys (those starting with special characters or numbers, containing `--` or `__`).
- ⚡ Customizable recursion depth (defaults to 3).
- 🔥 Optimized for performance with minimal overhead.
- 📦 Lightweight bundle size (~27.33 KB).

## Installation

```bash
npm install deep-case-crafter
```

## Usage

### Transforming an Object

```typescript
import transform from 'deep-case-crafter';

const input = { user_id: 1, first_name: 'John' };
const result = transform(input, { targetCase: 'camel', sourceCase: 'snake' });

console.log(result);
// Output: { userId: 1, firstName: 'John' }
```

### Transforming Deeply Nested Data

```typescript
const nestedInput = {
  user_info: { first_name: 'John', last_name: 'Doe' },
  posts: [{ post_id: 1, post_title: 'Hello' }],
};

const transformed = transform(nestedInput, { targetCase: 'camel' });

// Output:
// {
//   userInfo: { firstName: 'John', lastName: 'Doe' },
//   posts: [{ postId: 1, postTitle: 'Hello' }]
// }
```

### Transforming a Map

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

### Transforming a Set

```typescript
const setInput = new Set(['user_id', 'first_name']);
const result = transform(setInput, {
  targetCase: 'camel',
  sourceCase: 'snake',
});

console.log(result); // Set { 'userId', 'firstName' }
```

## API

### `transform(data, options)`

- **data**: The data structure to transform (`object`, `array`, `Map`, or `Set`).
- **options**:
  - `targetCase` (optional): `'camel' | 'snake' | 'pascal' | 'kebab'` **defaults** to `'camel'`
  - `sourceCase` (optional): Specify the source case for better type inference.
  - `depth` (optional): Specify recursion depth (default is 3).

### Preserved Keys

Keys are automatically preserved (not transformed) if:

- They start with a special character or number.
- They contain `__` or `--`.
- Numbers at the end are allowed.

### Case Detection

- Runtime case detection is **always** performed for each key.
- Specifying `sourceCase` enhances TypeScript type inference but does not influence runtime detection.

## Performance Considerations

- **Default Depth**: 3 levels deep to avoid unnecessary processing.
- **Custom Depth**: Set `depth` to control recursion. Use `Infinity` for full recursion.
- **Lightweight**: The bundle size is approximately **27.33 KB**.
- **Benchmarks**: Transform Deep Object (Depth 5, Width 10) x 361,538 ops/sec ±0.12% (91 runs sampled)
  Fastest is Transform Deep Object (Depth 5, Width 10)

## Contribution

1. Fork the repository.
2. Create a new branch.
3. Commit your changes.
4. Submit a pull request.

## License

MIT
