import transformCase from './transformCase';

describe('transformCase', () => {
  describe('Basic transformation', () => {
    it('should transform snake_case to camelCase', () => {
      expect(transformCase('hello_world', 'camel')).toBe('helloWorld');
    });

    it('should transform camelCase to snake_case', () => {
      expect(transformCase('helloWorld', 'snake')).toBe('hello_world');
    });

    it('should transform kebab-case to PascalCase', () => {
      expect(transformCase('hello-world', 'pascal')).toBe('HelloWorld');
    });

    it('should transform PascalCase to kebab-case', () => {
      expect(transformCase('HelloWorld', 'kebab')).toBe('hello-world');
    });
  });

  describe('Edge cases', () => {
    it('should return original string if case detection fails', () => {
      expect(transformCase('$hello', 'camel')).toBe('$hello');
    });

    it('should handle empty strings', () => {
      expect(transformCase('', 'camel')).toBe('');
    });

    it('should handle strings with numbers at the start', () => {
      expect(transformCase('123hello', 'camel')).toBe('123hello');
    });

    it('should handle strings with only special characters', () => {
      expect(transformCase('___', 'camel')).toBe('___');
    });

    it('should return original string if already in target case', () => {
      expect(transformCase('helloWorld', 'camel')).toBe('helloWorld');
    });
  });

  describe('Complex transformations', () => {
    it('should handle camelCase with numbers to snake_case', () => {
      expect(transformCase('hello123World', 'snake')).toBe('hello123_world');
    });

    it('should handle PascalCase acronyms to camelCase', () => {
      expect(transformCase('HTTPResponse', 'camel')).toBe('httpResponse');
      expect(transformCase('UserID', 'camel')).toBe('userID');
    });

    it('should lowercase only a one-letter first word to camelCase', () => {
      expect(transformCase('XAxis', 'camel')).toBe('xAxis');
      expect(transformCase('ETag', 'camel')).toBe('eTag');
      expect(transformCase('OAuth2Token', 'camel')).toBe('oAuth2Token');
      expect(transformCase('XId', 'camel')).toBe('xId');
      // ...but not a plural s ending a two-letter acronym
      expect(transformCase('IDs', 'camel')).toBe('ids');
      // snake_case and kebab-case keep such a start as one word
      expect(transformCase('ETag', 'snake')).toBe('etag');
      expect(transformCase('OAuth2Token', 'kebab')).toBe('oauth2-token');
    });

    it('should leave words written only in capitals unchanged', () => {
      expect(transformCase('ID', 'camel')).toBe('ID');
      expect(transformCase('USD', 'snake')).toBe('USD');
      expect(transformCase('GET', 'kebab')).toBe('GET');
      expect(transformCase('B2B', 'camel')).toBe('B2B');
      // like SCREAMING_SNAKE keys
      expect(transformCase('USER_ID', 'camel')).toBe('USER_ID');
    });

    it('should keep plural acronyms together', () => {
      expect(transformCase('allowedURLs', 'snake')).toBe('allowed_urls');
      expect(transformCase('URLsForIDs', 'camel')).toBe('urlsForIDs');
    });

    it('should handle PascalCase with consecutive uppercase letters to kebab-case', () => {
      expect(transformCase('HTTPResponse', 'kebab')).toBe('http-response');
    });
  });
});
