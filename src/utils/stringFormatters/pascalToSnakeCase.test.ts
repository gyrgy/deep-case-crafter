import pascalToSnakeCase from './pascalToSnakeCase';

describe('pascalToSnakeCase', () => {
  it('should convert a simple PascalCase string to snake_case', () => {
    expect(pascalToSnakeCase('HelloWorld')).toBe('hello_world');
  });

  it('should handle multiple capital letters', () => {
    expect(pascalToSnakeCase('HelloWorldAgain')).toBe('hello_world_again');
  });

  it('should handle consecutive capital letters', () => {
    expect(pascalToSnakeCase('HTTPResponse')).toBe('http_response');
  });

  it('should handle PascalCase strings with numbers', () => {
    expect(pascalToSnakeCase('Hello123World')).toBe('hello123_world');
  });

  it('should convert a single word correctly', () => {
    expect(pascalToSnakeCase('Hello')).toBe('hello');
  });

  it('should return empty string for empty input', () => {
    expect(pascalToSnakeCase('')).toBe('');
  });

  it('should handle null/undefined input', () => {
    // @ts-expect-error: testing invalid input
    expect(pascalToSnakeCase(null)).toBe(null);
    // @ts-expect-error: testing invalid input
    expect(pascalToSnakeCase(undefined)).toBe(undefined);
  });

  it('should handle consecutive uppercase letters in the middle', () => {
    expect(pascalToSnakeCase('HelloABCWorld')).toBe('hello_abc_world');
  });

  it('should handle consecutive uppercase letters at start', () => {
    expect(pascalToSnakeCase('ABCHelloWorld')).toBe('abc_hello_world');
  });

  it('should handle words ending with uppercase', () => {
    expect(pascalToSnakeCase('HelloWorldABC')).toBe('hello_world_abc');
  });

  it('should handle mixed uppercase and lowercase throughout', () => {
    expect(pascalToSnakeCase('HelloABCWorldDEFTest')).toBe(
      'hello_abc_world_def_test',
    );
  });
});
