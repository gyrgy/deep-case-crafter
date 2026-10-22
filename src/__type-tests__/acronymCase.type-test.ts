/**
 * Compile-time type tests for acronym-aware camel/pascal -> snake/kebab conversion.
 * Enforced by `tsc --noEmit`; ignored by jest; never bundled. See preservedKey.type-test.ts.
 */
import type { TransformKey } from '../types/keyTypes';
import type { Equal, Expect } from './typeAssertions';

// Acronyms are treated as whole words, at the type level.
export type _camelAcronym1 = Expect<
  Equal<TransformKey<'getHTTPResponse', 'snake'>, 'get_http_response'>
>;
export type _camelAcronym2 = Expect<
  Equal<TransformKey<'userID', 'snake'>, 'user_id'>
>;
export type _camelAcronym3 = Expect<
  Equal<TransformKey<'getHTTPResponse', 'kebab'>, 'get-http-response'>
>;
export type _pascalAcronym1 = Expect<
  Equal<TransformKey<'HTTPResponse', 'snake'>, 'http_response'>
>;
export type _pascalAcronym2 = Expect<
  Equal<TransformKey<'XMLParser', 'snake'>, 'xml_parser'>
>;
export type _pascalAcronym3 = Expect<
  Equal<TransformKey<'HTTPResponse', 'kebab'>, 'http-response'>
>;

// A leading acronym is lowercased as a whole when converting to camelCase.
export type _pascalToCamelAcronym1 = Expect<
  Equal<TransformKey<'HTTPResponse', 'camel'>, 'httpResponse'>
>;
export type _pascalToCamelAcronym2 = Expect<
  Equal<TransformKey<'XMLHttpRequest', 'camel'>, 'xmlHttpRequest'>
>;
export type _pascalToCamelInnerAcronym = Expect<
  Equal<TransformKey<'UserID', 'camel'>, 'userID'>
>;

// Two capitals before a lowercase letter are a one-letter word when converting to
// camelCase, unless the letter is a plural s ending the acronym.
export type _oneLetterWordCamel = Expect<
  Equal<TransformKey<'XAxis', 'camel'>, 'xAxis'>
>;
export type _oneLetterWordCamel2 = Expect<
  Equal<TransformKey<'OAuth2Token', 'camel'>, 'oAuth2Token'>
>;
export type _oneLetterWordCamel3 = Expect<
  Equal<TransformKey<'XId', 'camel'>, 'xId'>
>;
export type _oneLetterWordCamel4 = Expect<
  Equal<TransformKey<'IPv4', 'camel'>, 'iPv4'>
>;
export type _oneLetterWordBeforeS = Expect<
  Equal<TransformKey<'IDsort', 'camel'>, 'iDsort'>
>;
export type _oneLetterWordSnake = Expect<
  Equal<TransformKey<'ETag', 'snake'>, 'etag'>
>;
export type _twoCapitalPlural = Expect<
  Equal<TransformKey<'IDsList', 'camel'>, 'idsList'>
>;

// A word written only in capitals is not in one recognisable case: it is left unchanged.
export type _allCapsCamel = Expect<Equal<TransformKey<'ID', 'camel'>, 'ID'>>;
export type _allCapsSnake = Expect<Equal<TransformKey<'USD', 'snake'>, 'USD'>>;
export type _allCapsDigits = Expect<Equal<TransformKey<'B2B', 'kebab'>, 'B2B'>>;

// A plural s stays with its acronym.
export type _pluralSnake = Expect<
  Equal<TransformKey<'allowedURLs', 'snake'>, 'allowed_urls'>
>;
export type _pluralInside = Expect<
  Equal<TransformKey<'getURLsForIDs', 'kebab'>, 'get-urls-for-ids'>
>;
export type _pluralCamel = Expect<
  Equal<TransformKey<'URLsForIDs', 'camel'>, 'urlsForIDs'>
>;
export type _notPlural = Expect<
  Equal<TransformKey<'HTTPServer', 'snake'>, 'http_server'>
>;

// Non-acronym conversions still behave (regression guards).
export type _plainCamelSnake = Expect<
  Equal<TransformKey<'helloWorld', 'snake'>, 'hello_world'>
>;
export type _digits = Expect<
  Equal<TransformKey<'hello123World', 'snake'>, 'hello123_world'>
>;
export type _pascalRun = Expect<
  Equal<
    TransformKey<'HelloABCWorldDEFTest', 'snake'>,
    'hello_abc_world_def_test'
  >
>;

// Long keys must compile (the tail-recursive scanners handle ~1000 chars; a nested form
// hits TS2589 around ~55). This 62-char key is the guard.
export type _longKey = Expect<
  Equal<
    TransformKey<
      'fetchUserProfileDataFromTheRemoteAPIEndpointThenCacheItLocally',
      'snake'
    >,
    'fetch_user_profile_data_from_the_remote_api_endpoint_then_cache_it_locally'
  >
>;
export type _longSnakeKey = Expect<
  Equal<
    TransformKey<
      'fetch_user_profile_data_from_the_remote_api_endpoint_then_cache_it_locally',
      'camel'
    >,
    'fetchUserProfileDataFromTheRemoteApiEndpointThenCacheItLocally'
  >
>;
