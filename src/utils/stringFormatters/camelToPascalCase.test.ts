import camelToPascalCase from './camelToPascalCase';

describe('camelToPascalCase', () => {
  it('should convert a simple camelCase string to PascalCase', () => {
    expect(camelToPascalCase('helloWorld')).toBe('HelloWorld');
  });

  it('should handle camelCase with numbers', () => {
    expect(camelToPascalCase('hello123World')).toBe('Hello123World');
  });

  it('should not modify a string that id already PascalCase', () => {
    expect(camelToPascalCase('HelloWorld')).toBe('HelloWorld');
  });

  it('should handle single word inputs', () => {
    expect(camelToPascalCase('hello')).toBe('Hello');
  });

  it('should return empty string for empty input', () => {
    expect(camelToPascalCase('')).toBe('');
  });

  it('should handle null/undefined input', () => {
    // @ts-expect-error: testing invalid input
    expect(camelToPascalCase(null)).toBe(null);
    // @ts-expect-error: testing invalid input
    expect(camelToPascalCase(undefined)).toBe(undefined);
  });
});
