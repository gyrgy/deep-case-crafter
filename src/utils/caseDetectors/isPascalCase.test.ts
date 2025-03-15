import isPascalCase from './isPascalCase';

describe('isPascalCase', () => {
  it('should return true for valid PascalCase strings', () => {
    expect(isPascalCase('HelloWorld')).toBe(true);
    expect(isPascalCase('HelloWorld123')).toBe(true);
  });

  it('should return false for non-Pascal strings', () => {
    expect(isPascalCase('helloWorld')).toBe(false);
    expect(isPascalCase('Hello_World')).toBe(false);
    expect(isPascalCase('Hello-world')).toBe(false);
  });

  it('should return false for non-string inputs', () => {
    // @ts-expect-error: non-string inputs
    expect(isPascalCase(123)).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isPascalCase({})).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isPascalCase(null)).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isPascalCase(undefined)).toBe(false);
  });
});
