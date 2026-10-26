/**
 * Generic code around `transform`, as a library exports it. With `declaration: true` the
 * compiler writes these result types into declaration files, so they must refer to
 * exported types; an unexported recursive type would be expanded until the compiler runs
 * out of memory.
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import {
  transform,
  transformKey,
  type StringCase,
  type TransformKeyOptions,
  type TransformOptions,
} from 'deep-case-crafter';

export function toCamel<T>(data: T) {
  return transform(data);
}

export function toSnake<T>(data: T) {
  return transform(data, { targetCase: 'snake' });
}

export function toShallowKebab<T, D extends number>(data: T, depth: D) {
  return transform(data, { targetCase: 'kebab', depth });
}

export function toCamelPage<T>(page: { page_items: T[]; next_page: T }) {
  return transform(page);
}

export function withOptions<T, O extends TransformOptions>(
  data: T,
  options: O,
) {
  return transform(data, options);
}

export const toPascalMap = <T,>(map: Map<string, T>) =>
  transform(map, { targetCase: 'pascal' });

export function keepingMetadata<T>(data: T) {
  return transform(data, { exclude: ['metadata.*'] });
}

export function excluding<T, E extends readonly string[]>(data: T, exclude: E) {
  return transform(data, { exclude });
}

export function toCamelPageById<T>(page: {
  items_by_id: Record<string, T>;
  next_page: T;
}) {
  return transform(page, { exclude: ['items_by_id.*'] });
}

export function toSnakeKey<K extends string>(key: K) {
  return transformKey(key, { targetCase: 'snake' });
}

export function keyToCase<K extends string, C extends StringCase>(
  key: K,
  targetCase: C,
) {
  return transformKey(key, { targetCase });
}

export function keyWithOptions<K extends string, O extends TransformKeyOptions>(
  key: K,
  options: O,
) {
  return transformKey(key, options);
}

export const toKebabKeys = <K extends string>(keys: readonly K[]) =>
  keys.map((key) => transformKey(key, { targetCase: 'kebab' }));

// A fixed key with a generic target case: the key type is written in terms of
// TransformKeyToEach (see consumer.mts, which checks the declarations written here)
export function createdByIdIn<C extends StringCase>(targetCase: C) {
  return transformKey('created_by_id', { targetCase });
}

export function sortParam<C extends StringCase>(
  field: 'createdAt' | 'updatedByUser',
  targetCase: C,
) {
  return transformKey(field, { targetCase });
}
