import toSeparatedCase from './toSeparatedCase';

describe('toSeparatedCase', () => {
  it('should separate camelCase and PascalCase words', () => {
    expect(toSeparatedCase('helloWorld', '_', false)).toBe('hello_world');
    expect(toSeparatedCase('HelloWorld', '-', false)).toBe('hello-world');
  });

  it('should keep acronyms together', () => {
    expect(toSeparatedCase('getHTTPResponse', '_', false)).toBe(
      'get_http_response',
    );
    expect(toSeparatedCase('userID', '-', false)).toBe('user-id');
    expect(toSeparatedCase('XMLHttpRequest', '_', false)).toBe(
      'xml_http_request',
    );
    expect(toSeparatedCase('iOSVersion', '_', false)).toBe('i_os_version');
  });

  it('should keep a one-letter word apart from the next word', () => {
    expect(toSeparatedCase('isAValidUser', '_', false)).toBe('is_a_valid_user');
    expect(toSeparatedCase('hasAPrimaryKey', '-', false)).toBe(
      'has-a-primary-key',
    );
    expect(toSeparatedCase('threeDSecure', '_', false)).toBe('three_d_secure');
    expect(toSeparatedCase('XAxis', '_', false)).toBe('x_axis');
    expect(toSeparatedCase('OAuthToken', '-', false)).toBe('o-auth-token');
    expect(toSeparatedCase('IPv4', '_', false)).toBe('i_pv4');
  });

  it('should keep plural acronyms together', () => {
    expect(toSeparatedCase('allowedURLs', '_', false)).toBe('allowed_urls');
    expect(toSeparatedCase('getURLsForIDs', '_', false)).toBe(
      'get_urls_for_ids',
    );
    expect(toSeparatedCase('APIsList', '-', false)).toBe('apis-list');
    expect(toSeparatedCase('IDsList', '_', false)).toBe('ids_list');
    expect(toSeparatedCase('userIDs', '-', false)).toBe('user-ids');
    expect(toSeparatedCase('HTTPServer', '_', false)).toBe('http_server');
    // An s word right after an acronym is read as a plural too
    expect(toSeparatedCase('SSLIsEnabled', '_', false)).toBe('sslis_enabled');
    // ...unless more lowercase letters follow it: the capital before it starts a word
    expect(toSeparatedCase('IDsort', '_', false)).toBe('i_dsort');
  });

  it('should start a new word after a digit', () => {
    expect(toSeparatedCase('hello123World', '_', false)).toBe('hello123_world');
  });

  it('should put the words in capitals for CONSTANT_CASE', () => {
    expect(toSeparatedCase('userID', '_', true)).toBe('USER_ID');
    expect(toSeparatedCase('getHTTPResponse', '_', true)).toBe(
      'GET_HTTP_RESPONSE',
    );
    expect(toSeparatedCase('isAValidUser', '_', true)).toBe('IS_A_VALID_USER');
    expect(toSeparatedCase('allowedURLs', '_', true)).toBe('ALLOWED_URLS');
    expect(toSeparatedCase('hello123World', '_', true)).toBe('HELLO123_WORLD');
  });

  it('should return empty strings unchanged', () => {
    expect(toSeparatedCase('', '_', false)).toBe('');
  });
});
