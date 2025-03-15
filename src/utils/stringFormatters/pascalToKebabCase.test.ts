import pascalToKebabCase from './pascalToKebabCase';

describe('pascalToKebabCase', () => {
  it('should convert a simple PascalCase string to kebab-case', () => {
    expect(pascalToKebabCase('HelloWorld')).toBe('hello-world');
  });

  it('should handle multiple capital letters', () => {
    expect(pascalToKebabCase('HelloWorldAgain')).toBe('hello-world-again');
  });

  it('should handle consecutive capital letters', () => {
    expect(pascalToKebabCase('HTTPResponse')).toBe('http-response');
  });

  it('should handle PascalCase strings with numbers', () => {
    expect(pascalToKebabCase('Hello123World')).toBe('hello123-world');
  });

  it('should convert a single word correctly', () => {
    expect(pascalToKebabCase('Hello')).toBe('hello');
  });

  it('should return empty string for empty input', () => {
    expect(pascalToKebabCase('')).toBe('');
  });

  it('should handle null/undefined input', () => {
    // @ts-expect-error: testing invalid input
    expect(pascalToKebabCase(null)).toBe(null);
    // @ts-expect-error: testing invalid input
    expect(pascalToKebabCase(undefined)).toBe(undefined);
  });

  it('should handle consecutive uppercase letters in the middle', () => {
    expect(pascalToKebabCase('HelloABCWorld')).toBe('hello-abc-world');
  });

  it('should handle consecutive uppercase letters at start', () => {
    expect(pascalToKebabCase('ABCHelloWorld')).toBe('abc-hello-world');
  });

  it('should handle words ending with uppercase', () => {
    expect(pascalToKebabCase('HelloWorldABC')).toBe('hello-world-abc');
  });

  it('should handle mixed uppercase and lowercase throughout', () => {
    expect(pascalToKebabCase('HelloABCWorldDEFTest')).toBe(
      'hello-abc-world-def-test',
    );
  });
});
