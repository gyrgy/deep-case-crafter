import snakeToPascalCase from './snakeToPascalCase';

describe('snakeToPascalCase', () => {
  it('should convert a simple snake_case string to PascalCase', () => {
    expect(snakeToPascalCase('hello_world')).toBe('HelloWorld');
  });

  it('should handle multiple underscores', () => {
    expect(snakeToPascalCase('hello_world_again')).toBe('HelloWorldAgain');
  });

  it('should handle snake_case strings with numbers', () => {
    expect(snakeToPascalCase('hello_123_world')).toBe('Hello123World');
  });

  it('should capitalize the first letter of a single word', () => {
    expect(snakeToPascalCase('hello')).toBe('Hello');
  });

  it('should handle consecutive underscores', () => {
    expect(snakeToPascalCase('hello__world')).toBe('HelloWorld');
  });

  it('should correctly handle uppercase characters by lowercasing first', () => {
    expect(snakeToPascalCase('HELLO_WORLD')).toBe('HelloWorld');
  });

  it('should return empty string for empty input', () => {
    expect(snakeToPascalCase('')).toBe('');
  });
});
