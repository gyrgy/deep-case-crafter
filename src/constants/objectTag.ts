/**
 * The `Object.prototype.toString` tag of ordinary key/value objects: plain objects,
 * `Object.create(null)` objects and class instances.
 *
 * Built-ins that keep their state in internal slots report their own tag instead
 * (`[object Date]`, `[object RegExp]`, `[object Uint8Array]`, ...).
 */
export const OBJECT_TAG = '[object Object]';

/** The `Object.prototype.toString` tag of a `Map`, from any realm */
export const MAP_TAG = '[object Map]';

/** The `Object.prototype.toString` tag of a `Set`, from any realm */
export const SET_TAG = '[object Set]';
