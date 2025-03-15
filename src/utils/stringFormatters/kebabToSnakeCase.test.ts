import kebabToSnakeCase from './kebabToSnakeCase';

describe('kebabToSnakeCase', () => {
  it('should convert a simple kebab-case string to snake_case', () => {
    expect(kebabToSnakeCase('hello-world')).toBe('hello_world');
  });

  it('should handle multiple hyphens', () => {
    expect(kebabToSnakeCase('hello-world-again')).toBe('hello_world_again');
  });

  it('should handle consecutive hyphens', () => {
    expect(kebabToSnakeCase('hello--world')).toBe('hello__world');
  });

  it('should not change strings without hyphens', () => {
    expect(kebabToSnakeCase('hello')).toBe('hello');
  });

  it('should return empty string for empty input', () => {
    expect(kebabToSnakeCase('')).toBe('');
  });
});
