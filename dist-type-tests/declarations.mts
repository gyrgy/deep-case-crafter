/**
 * Generic code around `transform`, as a library exports it. With `declaration: true` the
 * compiler writes these result types into declaration files, so they must refer to
 * exported types; an unexported recursive type would be expanded until the compiler runs
 * out of memory.
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import { transform, type TransformOptions } from 'deep-case-crafter';

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
