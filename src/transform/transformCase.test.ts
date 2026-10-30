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

    it('should leave UUIDs unchanged', () => {
      const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      expect(transformCase(uuid, 'camel')).toBe(uuid);
      expect(transformCase(uuid, 'pascal')).toBe(uuid);
      expect(transformCase(uuid, 'snake')).toBe(uuid);
      expect(transformCase(uuid, 'constant')).toBe(uuid);
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
    });

    it('should keep a one-letter word apart in snake_case and kebab-case', () => {
      expect(transformCase('XAxis', 'snake')).toBe('x_axis');
      expect(transformCase('ETag', 'snake')).toBe('e_tag');
      expect(transformCase('OAuth2Token', 'kebab')).toBe('o-auth2-token');
      expect(transformCase('isAValidUser', 'snake')).toBe('is_a_valid_user');
      expect(transformCase('hasAPrimaryKey', 'kebab')).toBe(
        'has-a-primary-key',
      );
      // ...but not a plural s ending a two-letter acronym
      expect(transformCase('IDs', 'snake')).toBe('ids');
    });

    it('should round-trip a one-letter word through snake_case', () => {
      expect(transformCase('threeDSecure', 'snake')).toBe('three_d_secure');
      expect(transformCase('three_d_secure', 'camel')).toBe('threeDSecure');
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

  describe('CONSTANT_CASE', () => {
    it('should transform every case to CONSTANT_CASE', () => {
      expect(transformCase('userId', 'constant')).toBe('USER_ID');
      expect(transformCase('UserId', 'constant')).toBe('USER_ID');
      expect(transformCase('user_id', 'constant')).toBe('USER_ID');
      expect(transformCase('user-id', 'constant')).toBe('USER_ID');
      expect(transformCase('user', 'constant')).toBe('USER');
      expect(transformCase('User', 'constant')).toBe('USER');
    });

    it('should split words as snake_case does', () => {
      expect(transformCase('getHTTPResponse', 'constant')).toBe(
        'GET_HTTP_RESPONSE',
      );
      expect(transformCase('XMLHttpRequest', 'constant')).toBe(
        'XML_HTTP_REQUEST',
      );
      expect(transformCase('isAValidUser', 'constant')).toBe('IS_A_VALID_USER');
      expect(transformCase('allowedURLs', 'constant')).toBe('ALLOWED_URLS');
      expect(transformCase('addressLine1', 'constant')).toBe('ADDRESS_LINE1');
      expect(transformCase('address_1', 'constant')).toBe('ADDRESS_1');
    });

    it('should leave CONSTANT_CASE keys unchanged, as every target case does', () => {
      expect(transformCase('USER_ID', 'constant')).toBe('USER_ID');
      expect(transformCase('ID', 'constant')).toBe('ID');
      expect(transformCase('USER-ID', 'constant')).toBe('USER-ID');
      expect(transformCase('mixed_Case', 'constant')).toBe('mixed_Case');
      expect(transformCase('_private', 'constant')).toBe('_private');
    });
  });
});
