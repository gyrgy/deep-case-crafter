import snakeToCamelCase from './snakeToCamelCase';

describe('snakeToCamelCase', () => {
  it('should convert a simple snake_case string to camelCase', () => {
    expect(snakeToCamelCase('hello_world')).toBe('helloWorld');
  });

  it('should handle multiple underscores', () => {
    expect(snakeToCamelCase('hello_world_again')).toBe('helloWorldAgain');
  });

  it('should handle strings with numbers', () => {
    expect(snakeToCamelCase('hello_123_world')).toBe('hello123World');
  });

  it('should not change text without underscores', () => {
    expect(snakeToCamelCase('hello')).toBe('hello');
  });

  it('should return empty string for empty input', () => {
    expect(snakeToCamelCase('')).toBe('');
  });
});
