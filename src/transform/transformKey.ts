import transformCase from './transformCase';
import { TransformKey } from '../types/keyTypes';
import {
  NoUnknownKeyOptions,
  TransformKeyOptions,
} from '../types/transformOptionTypes';
import { TransformKeyFor } from '../types/transformTypes';
import describeValue from '../utils/describeValue';
import resolveTargetCase from '../utils/resolveTargetCase';

/**
 * Transforms one key to camelCase, the way `transform` transforms every key. A string
 * that is not a key in one of the four cases, such as `'Hello World'`, `'USER_ID'` or a
 * UUID, is returned unchanged (see "Key Preservation Rules" in the readme).
 *
 * The result type is the transformed key: `transformKey('user_id')` is typed `'userId'`.
 */
function transformKey<K extends string>(
  key: K,
  options?: undefined,
): TransformKey<K>;

/**
 * Transforms one key to `targetCase` (default `'camel'`), the way `transform` transforms
 * every key. A string that is not a key in one of the four cases, such as
 * `'Hello World'`, `'USER_ID'` or a UUID, is returned unchanged (see "Key Preservation
 * Rules" in the readme).
 *
 * The result type is the transformed key: `transformKey('userID', { targetCase: 'snake' })`
 * is typed `'user_id'`, a union of keys or target cases gives the union of the results,
 * and a `string` key gives `string`.
 *
 * `Options` captures the options object as a whole, as `transform` does, so each member
 * of a union of options objects gets its own result, and an optional `targetCase` also
 * gives the camelCase key. `NoUnknownKeyOptions` rejects option names other than
 * `targetCase`, and otherwise leaves the parameter `TransformKeyOptions` itself, so a
 * value with no property in common with it, such as `'snake'`, is rejected as well. An
 * options object that may itself be `undefined` does not match this overload, and gets
 * a `string` result type from the last one.
 */
function transformKey<
  K extends string,
  Options extends TransformKeyOptions = TransformKeyOptions,
>(
  key: K,
  options: Options & NoUnknownKeyOptions<Options>,
): TransformKeyFor<K, Options>;

/**
 * Transforms one key to `targetCase` (default `'camel'`), the way `transform` transforms
 * every key, typed as a `string`: for an options object that may be `undefined`, or one
 * with properties other than `targetCase`.
 */
function transformKey(key: string, options?: TransformKeyOptions): string;

// Implementation
function transformKey(key: string, options?: TransformKeyOptions): string {
  // Plain JavaScript callers can pass anything; reject it before converting
  if (typeof key !== 'string') {
    throw new TypeError(`Unsupported key ${describeValue(key)}. Use a string.`);
  }
  // The likely mistake of passing the target case itself. Other values that are not
  // options objects are ignored, as transform ignores them: `keys.map(transformKey)`
  // passes each key's index.
  if (typeof options === 'string') {
    throw new TypeError(
      `Unsupported options ${describeValue(options)}. Use an options object: { targetCase: ${describeValue(options)} }.`,
    );
  }

  // Not remembered like object keys (`transformObjectKey`): any string can be passed
  // here, such as a slice of a much larger string, which a cache entry would keep alive
  return transformCase(key, resolveTargetCase(options?.targetCase));
}

export default transformKey;
