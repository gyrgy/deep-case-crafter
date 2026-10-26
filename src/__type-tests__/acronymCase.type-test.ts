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

// A capital after a capital and before a lowercase letter starts a word, so a capital
// before a capitalised word is a one-letter word, in every target case, unless the
// lowercase letter is a plural s ending the acronym.
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
  Equal<TransformKey<'ETag', 'snake'>, 'e_tag'>
>;
export type _oneLetterWordSnake2 = Expect<
  Equal<TransformKey<'XAxis', 'snake'>, 'x_axis'>
>;
export type _oneLetterWordSnake3 = Expect<
  Equal<TransformKey<'IPv4', 'snake'>, 'i_pv4'>
>;
export type _oneLetterWordKebab = Expect<
  Equal<TransformKey<'OAuthToken', 'kebab'>, 'o-auth-token'>
>;
export type _oneLetterWordBeforeSSnake = Expect<
  Equal<TransformKey<'IDsort', 'snake'>, 'i_dsort'>
>;
export type _twoCapitalPlural = Expect<
  Equal<TransformKey<'IDsList', 'camel'>, 'idsList'>
>;
export type _twoCapitalPluralSnake = Expect<
  Equal<TransformKey<'IDsList', 'snake'>, 'ids_list'>
>;

// The same holds inside a key: a one-letter word is not merged with the next word.
export type _innerOneLetterWord = Expect<
  Equal<TransformKey<'isAValidUser', 'snake'>, 'is_a_valid_user'>
>;
export type _innerOneLetterWord2 = Expect<
  Equal<TransformKey<'hasAPrimaryKey', 'kebab'>, 'has-a-primary-key'>
>;
export type _innerOneLetterWordRoundTrip = Expect<
  Equal<TransformKey<'threeDSecure', 'snake'>, 'three_d_secure'>
>;
export type _innerOneLetterWordRoundTrip2 = Expect<
  Equal<TransformKey<'three_d_secure', 'camel'>, 'threeDSecure'>
>;
export type _oneLetterWordBeforeAcronym = Expect<
  Equal<TransformKey<'iOSVersion', 'snake'>, 'i_os_version'>
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
// An s word right after an acronym is read as a plural too (a documented trade-off).
export type _pluralBeforeWord = Expect<
  Equal<TransformKey<'SSLIsEnabled', 'snake'>, 'sslis_enabled'>
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
