import camelToKebabCase from './camelToKebabCase';

describe('camelToKebabCase', () => {
  it('should convert a simple camelCase string to kebab-case', () => {
    expect(camelToKebabCase('helloWorld')).toBe('hello-world');
  });

  it('should handle multiple capital letters', () => {
    expect(camelToKebabCase('helloWorldAgain')).toBe('hello-world-again');
  });

  it('should handle consecutive capital letters', () => {
    expect(camelToKebabCase('getHTTPResponse')).toBe('get-h-t-t-p-response');
  });

  it('should handle camelCase strings with numbers', () => {
    expect(camelToKebabCase('hello123World')).toBe('hello123-world');
  });

  it('should return empty string for empty input', () => {
    expect(camelToKebabCase('')).toBe('');
  });
});
