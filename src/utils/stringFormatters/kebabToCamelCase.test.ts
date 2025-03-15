import kebabToCamelCase from './kebabToCamelCase';

describe('kebabToCamelCase', () => {
  it('should convert a simple kebab-case string to camelCase', () => {
    expect(kebabToCamelCase('hello-world')).toBe('helloWorld');
  });

  it('should handle multiple hyphens', () => {
    expect(kebabToCamelCase('hello-world-again')).toBe('helloWorldAgain');
  });

  it('should handle kebab-case strings with numbers', () => {
    expect(kebabToCamelCase('hello-123-world')).toBe('hello123World');
  });

  it('should correctly handle uppercase characters by lowercasing first', () => {
    expect(kebabToCamelCase('HELLO-WORLD')).toBe('helloWorld');
  });

  it('should handle consecutive hyphens', () => {
    expect(kebabToCamelCase('hello--world')).toBe('helloWorld');
  });

  it('should not modify text without hyphens', () => {
    expect(kebabToCamelCase('hello')).toBe('hello');
  });

  it('should return empty string for empty input', () => {
    expect(kebabToCamelCase('')).toBe('');
  });
});
