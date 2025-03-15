import kebabToPascalCase from './kebabToPascalCase';

describe('kebabToPascalCase', () => {
  it('should convert a simple kebab-case string to PascalCase', () => {
    expect(kebabToPascalCase('hello-world')).toBe('HelloWorld');
  });

  it('should handle multiple hyphens', () => {
    expect(kebabToPascalCase('hello-world-again')).toBe('HelloWorldAgain');
  });

  it('should handle kebab-case strings with numbers', () => {
    expect(kebabToPascalCase('hello-123-world')).toBe('Hello123World');
  });

  it('should correctly handle uppercase characters by lowercasing first', () => {
    expect(kebabToPascalCase('HELLO-WORLD')).toBe('HelloWorld');
  });

  it('should handle consecutive hyphens', () => {
    expect(kebabToPascalCase('hello--world')).toBe('HelloWorld');
  });

  it('should capitalize a single word', () => {
    expect(kebabToPascalCase('hello')).toBe('Hello');
  });

  it('should return empty string for empty input', () => {
    expect(kebabToPascalCase('')).toBe('');
  });
});
