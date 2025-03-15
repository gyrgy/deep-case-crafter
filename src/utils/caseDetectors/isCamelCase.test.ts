import isCamelCase from './isCamelCase';

describe('isCamelCase', () => {
  it('should return true for valid camelCase strings', () => {
    expect(isCamelCase('helloWorld')).toBe(true);
    expect(isCamelCase('helloWorld123')).toBe(true);
  });

  it('should return false for non-camel strings', () => {
    expect(isCamelCase('HelloWorld')).toBe(false); // PascalCase instead
    expect(isCamelCase('hello_world')).toBe(false);
    expect(isCamelCase('hello-world')).toBe(false);
  });

  it('should return false for non-string inputs', () => {
    // @ts-expect-error: non-string inputs
    expect(isCamelCase(123)).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isCamelCase({})).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isCamelCase(null)).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isCamelCase(undefined)).toBe(false);
  });
});
