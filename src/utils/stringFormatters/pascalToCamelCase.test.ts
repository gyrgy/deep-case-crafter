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

  it('should handle consecutive uppercase letters correctly', () => {
    expect(pascalToCamelCase('HTTPRequest')).toBe('hTTPRequest');
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
