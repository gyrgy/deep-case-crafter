import snakeToKebabCase from './snakeToKebabCase';

describe('snakeToKebabCase', () => {
  it('should convert a simple snake_case string to kebab-case', () => {
    expect(snakeToKebabCase('hello_world')).toBe('hello-world');
  });

  it('should handle multiple underscores', () => {
    expect(snakeToKebabCase('hello_world_again')).toBe('hello-world-again');
  });

  it('should handle consecutive underscores', () => {
    expect(snakeToKebabCase('hello__world')).toBe('hello--world');
  });

  it('should not change strings without underscores', () => {
    expect(snakeToKebabCase('hello')).toBe('hello');
  });

  it('should return empty string for empty input', () => {
    expect(snakeToKebabCase('')).toBe('');
  });
});
