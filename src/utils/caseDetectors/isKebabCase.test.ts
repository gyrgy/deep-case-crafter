import { isKebabCase } from './isKebabCase';

describe('isKebabCase', () => {
  it('should return true for valid kebab-case strings', () => {
    expect(isKebabCase('hello-world')).toBe(true);
    expect(isKebabCase('hello-world-123')).toBe(true);
  });

  it('should return false for non-kebab strings', () => {
    expect(isKebabCase('helloWorld')).toBe(false);
    expect(isKebabCase('hello_world')).toBe(false);
    expect(isKebabCase('Hello-World')).toBe(false);
    expect(isKebabCase('hello--world')).toBe(false); // consecutive hyphens
    expect(isKebabCase('hello--world')).toBe(false); // consecutive hyphens
  });

  it('should return true for a valid single lowercase word (using SINGLE_WORD_REGEX branch)', () => {
    // Even though "hello" does not contain a hyphen,
    // it should pass the SINGLE_WORD_REGEX test and be considered kebab-case.
    expect(isKebabCase('hello')).toBe(true);
    expect(isKebabCase('world')).toBe(true);
  });

  it('should return false for a single word that fails SINGLE_WORD_REGEX', () => {
    // If the word contains uppercase letters, it should fail.
    expect(isKebabCase('Hello')).toBe(false);
    expect(isKebabCase('WORLD')).toBe(false);
  });

  it('should return false for non-string inputs', () => {
    // @ts-expect-error: non-string inputs
    expect(isKebabCase(123)).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isKebabCase({})).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isKebabCase(null)).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isKebabCase(undefined)).toBe(false);
  });
});
