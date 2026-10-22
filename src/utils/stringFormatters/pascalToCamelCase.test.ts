import pascalToCamelCase from './pascalToCamelCase';

describe('pascalToCamelCase', () => {
  it('should convert a simple PascalCase string to camelCase', () => {
    expect(pascalToCamelCase('HelloWorld')).toBe('helloWorld');
  });

  it('should handle PascalCase with numbers', () => {
    expect(pascalToCamelCase('Hello123World')).toBe('hello123World');
  });

  it('should handle single word PascalCase', () => {
    expect(pascalToCamelCase('Hello')).toBe('hello');
  });

  it('should not modify a string that is already camelCase', () => {
    expect(pascalToCamelCase('helloWorld')).toBe('helloWorld');
  });

  it('should lowercase a leading acronym as a whole', () => {
    expect(pascalToCamelCase('HTTPRequest')).toBe('httpRequest');
    expect(pascalToCamelCase('XMLHttpRequest')).toBe('xmlHttpRequest');
    expect(pascalToCamelCase('IOStream')).toBe('ioStream');
    expect(pascalToCamelCase('Html5Video')).toBe('html5Video');
  });

  it('should keep acronyms after the first word as they are', () => {
    expect(pascalToCamelCase('UserID')).toBe('userID');
    expect(pascalToCamelCase('GetHTTPResponse')).toBe('getHTTPResponse');
  });

  it('should keep a plural s with a leading acronym', () => {
    expect(pascalToCamelCase('URLs')).toBe('urls');
    expect(pascalToCamelCase('IDs')).toBe('ids');
    expect(pascalToCamelCase('URLsForIDs')).toBe('urlsForIDs');
  });

  it('should lowercase only a one-letter first word before a capitalized word', () => {
    expect(pascalToCamelCase('XAxis')).toBe('xAxis');
    expect(pascalToCamelCase('ETag')).toBe('eTag');
    expect(pascalToCamelCase('IPhone')).toBe('iPhone');
    expect(pascalToCamelCase('OAuth2Token')).toBe('oAuth2Token');
    expect(pascalToCamelCase('VCpuCount')).toBe('vCpuCount');
    expect(pascalToCamelCase('XId')).toBe('xId');
    expect(pascalToCamelCase('IPv4')).toBe('iPv4');
    expect(pascalToCamelCase('ABc')).toBe('aBc');
  });

  it('should keep a plural s with two leading capitals, unless a word follows', () => {
    expect(pascalToCamelCase('IDsList')).toBe('idsList');
    expect(pascalToCamelCase('IDs2')).toBe('ids2');
    expect(pascalToCamelCase('IDsort')).toBe('iDsort');
  });

  it('should handle very short strings', () => {
    expect(pascalToCamelCase('X')).toBe('x');
    expect(pascalToCamelCase('XY')).toBe('xy');
  });

  it('should return empty string for empty input', () => {
    expect(pascalToCamelCase('')).toBe('');
  });

  it('should handle null/undefined input', () => {
    // @ts-expect-error: testing invalid input
    expect(pascalToCamelCase(null)).toBe(null);
    // @ts-expect-error: testing invalid input
    expect(pascalToCamelCase(undefined)).toBe(undefined);
  });
});
