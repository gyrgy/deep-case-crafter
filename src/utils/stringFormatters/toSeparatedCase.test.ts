import toSeparatedCase from './toSeparatedCase';

describe('toSeparatedCase', () => {
  it('should separate camelCase and PascalCase words', () => {
    expect(toSeparatedCase('helloWorld', '_')).toBe('hello_world');
    expect(toSeparatedCase('HelloWorld', '-')).toBe('hello-world');
  });

  it('should keep acronyms together', () => {
    expect(toSeparatedCase('getHTTPResponse', '_')).toBe('get_http_response');
    expect(toSeparatedCase('userID', '-')).toBe('user-id');
    expect(toSeparatedCase('XMLHttpRequest', '_')).toBe('xml_http_request');
    expect(toSeparatedCase('iOSVersion', '_')).toBe('i_os_version');
  });

  it('should keep a one-letter word apart from the next word', () => {
    expect(toSeparatedCase('isAValidUser', '_')).toBe('is_a_valid_user');
    expect(toSeparatedCase('hasAPrimaryKey', '-')).toBe('has-a-primary-key');
    expect(toSeparatedCase('threeDSecure', '_')).toBe('three_d_secure');
    expect(toSeparatedCase('XAxis', '_')).toBe('x_axis');
    expect(toSeparatedCase('OAuthToken', '-')).toBe('o-auth-token');
    expect(toSeparatedCase('IPv4', '_')).toBe('i_pv4');
  });

  it('should keep plural acronyms together', () => {
    expect(toSeparatedCase('allowedURLs', '_')).toBe('allowed_urls');
    expect(toSeparatedCase('getURLsForIDs', '_')).toBe('get_urls_for_ids');
    expect(toSeparatedCase('APIsList', '-')).toBe('apis-list');
    expect(toSeparatedCase('IDsList', '_')).toBe('ids_list');
    expect(toSeparatedCase('userIDs', '-')).toBe('user-ids');
    expect(toSeparatedCase('HTTPServer', '_')).toBe('http_server');
    // An s word right after an acronym is read as a plural too
    expect(toSeparatedCase('SSLIsEnabled', '_')).toBe('sslis_enabled');
    // ...unless more lowercase letters follow it: the capital before it starts a word
    expect(toSeparatedCase('IDsort', '_')).toBe('i_dsort');
  });

  it('should start a new word after a digit', () => {
    expect(toSeparatedCase('hello123World', '_')).toBe('hello123_world');
  });

  it('should return empty strings unchanged', () => {
    expect(toSeparatedCase('', '_')).toBe('');
  });
});
