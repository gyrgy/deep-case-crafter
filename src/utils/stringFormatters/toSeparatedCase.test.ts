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
  });

  it('should keep plural acronyms together', () => {
    expect(toSeparatedCase('allowedURLs', '_')).toBe('allowed_urls');
    expect(toSeparatedCase('getURLsForIDs', '_')).toBe('get_urls_for_ids');
    expect(toSeparatedCase('APIsList', '-')).toBe('apis-list');
    expect(toSeparatedCase('HTTPServer', '_')).toBe('http_server');
  });

  it('should start a new word after a digit', () => {
    expect(toSeparatedCase('hello123World', '_')).toBe('hello123_world');
  });

  it('should return empty strings unchanged', () => {
    expect(toSeparatedCase('', '_')).toBe('');
  });
});
