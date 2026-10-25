/**
 * Compile-time type tests for the `depth` option, mirroring the runtime: the values of
 * objects, Maps and Sets are one level deeper, array items stay on their array's level.
 * See preservedKey.type-test.ts.
 */
import type { TransformResult } from '../types/transformTypes';
import type { Equal, Expect } from './typeAssertions';

type Nested = { user_info: { address_info: { street_name: string } } };

export type _depth0 = Expect<
  Equal<TransformResult<Nested, 'camel', 0>, Nested>
>;
export type _depth1 = Expect<
  Equal<
    TransformResult<Nested, 'camel', 1>,
    { userInfo: { address_info: { street_name: string } } }
  >
>;
export type _depth2 = Expect<
  Equal<
    TransformResult<Nested, 'camel', 2>,
    { userInfo: { addressInfo: { street_name: string } } }
  >
>;
export type _depth3 = Expect<
  Equal<
    TransformResult<Nested, 'camel', 3>,
    { userInfo: { addressInfo: { streetName: string } } }
  >
>;
export type _unlimited = Expect<
  Equal<
    TransformResult<Nested>,
    { userInfo: { addressInfo: { streetName: string } } }
  >
>;

// Arrays are not a level of their own
export type _arrayItems = Expect<
  Equal<
    TransformResult<{ user_list: { first_name: string }[] }, 'camel', 1>,
    { userList: { first_name: string }[] }
  >
>;
export type _topLevelArray = Expect<
  Equal<TransformResult<{ user_id: 1 }[], 'camel', 1>, { userId: 1 }[]>
>;

// Maps and Sets are
export type _map = Expect<
  Equal<
    TransformResult<Map<'a_b', { c_d: 1 }>, 'camel', 1>,
    Map<'aB', { c_d: 1 }>
  >
>;
export type _set = Expect<
  Equal<TransformResult<Set<{ c_d: 1 }>, 'camel', 1>, Set<{ c_d: 1 }>>
>;

// A depth only known to be one of several values gives the union of the results
export type _depthUnion = Expect<
  Equal<
    TransformResult<Nested, 'camel', 1 | 2>,
    | { userInfo: { address_info: { street_name: string } } }
    | { userInfo: { addressInfo: { street_name: string } } }
  >
>;

// A negative depth transforms nothing; an unknown or fractional depth gives unknown
export type _negative = Expect<
  Equal<TransformResult<Nested, 'camel', -1>, Nested>
>;
export type _wide = Expect<
  Equal<TransformResult<Nested, 'camel', number>, unknown>
>;
export type _fractional = Expect<
  Equal<TransformResult<Nested, 'camel', 1.5>, unknown>
>;
