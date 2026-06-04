/**
 * Compile-time type tests for acronym-aware camel/pascal -> snake/kebab conversion.
 * Enforced by `tsc --noEmit`; ignored by jest; never bundled. See preservedKey.type-test.ts.
 */
import type { TransformKey } from '../types/transformTypes';

type Expect<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type CamelToSnakeKey<K extends string> = TransformKey<
  K,
  { sourceCase: 'camel'; targetCase: 'snake' }
>;
type PascalToSnakeKey<K extends string> = TransformKey<
  K,
  { sourceCase: 'pascal'; targetCase: 'snake' }
>;
type CamelToKebabKey<K extends string> = TransformKey<
  K,
  { sourceCase: 'camel'; targetCase: 'kebab' }
>;
type PascalToKebabKey<K extends string> = TransformKey<
  K,
  { sourceCase: 'pascal'; targetCase: 'kebab' }
>;

// Acronyms are treated as whole words (the 4.1 fix), at the type level.
export type _camelAcronym1 = Expect<
  Equal<CamelToSnakeKey<'getHTTPResponse'>, 'get_http_response'>
>;
export type _camelAcronym2 = Expect<
  Equal<CamelToSnakeKey<'userID'>, 'user_id'>
>;
export type _camelAcronym3 = Expect<
  Equal<CamelToKebabKey<'getHTTPResponse'>, 'get-http-response'>
>;
export type _pascalAcronym1 = Expect<
  Equal<PascalToSnakeKey<'HTTPResponse'>, 'http_response'>
>;
export type _pascalAcronym2 = Expect<
  Equal<PascalToSnakeKey<'XMLParser'>, 'xml_parser'>
>;
export type _pascalAcronym3 = Expect<
  Equal<PascalToKebabKey<'HTTPResponse'>, 'http-response'>
>;

// Non-acronym conversions still behave (regression guards).
export type _plainCamelSnake = Expect<
  Equal<CamelToSnakeKey<'helloWorld'>, 'hello_world'>
>;
export type _digits = Expect<
  Equal<CamelToSnakeKey<'hello123World'>, 'hello123_world'>
>;
export type _pascalRun = Expect<
  Equal<PascalToSnakeKey<'HelloABCWorldDEFTest'>, 'hello_abc_world_def_test'>
>;

// Long keys must compile (the tail-recursive scanner handles ~1000 chars; the
// earlier nested form hit TS2589 around ~55). This 62-char key is the guard.
export type _longKey = Expect<
  Equal<
    CamelToSnakeKey<'fetchUserProfileDataFromTheRemoteAPIEndpointThenCacheItLocally'>,
    'fetch_user_profile_data_from_the_remote_api_endpoint_then_cache_it_locally'
  >
>;
