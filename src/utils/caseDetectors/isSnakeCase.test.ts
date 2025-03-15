import isSnakeCase from './isSnakeCase';

describe('isSnakeCase', () => {
  it('should return true for valid snake_case strings', () => {
    expect(isSnakeCase('hello_world')).toBe(true);
    expect(isSnakeCase('hello_world_123')).toBe(true);
  });

  it('should return false for non-snake strings', () => {
    expect(isSnakeCase('helloWorld')).toBe(false);
    expect(isSnakeCase('Hello_world')).toBe(false); // starts with uppercase
    expect(isSnakeCase('hello__world')).toBe(false); // consecutive underscores
  });

  it('should return false for non-string inputs', () => {
    // @ts-expect-error: non-string inputs
    expect(isSnakeCase(123)).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isSnakeCase({})).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isSnakeCase(null)).toBe(false);
    // @ts-expect-error: non-string inputs
    expect(isSnakeCase(undefined)).toBe(false);
  });

  it('should return true for a valid snake_case string with underscores', () => {
    expect(isSnakeCase('hello_world')).toBe(true);
    expect(isSnakeCase('hello_world_123')).toBe(true);
  });

  it('should return false for strings with consecutive underscores', () => {
    expect(isSnakeCase('hello__world')).toBe(false);
  });

  it('should return true for a single lowercase word (using SINGLE_WORD_REGEX)', () => {
    // Even though the string "hello" has no underscores,
    // it passes SINGLE_WORD_REGEX (i.e. /^[a-z0-9]+$/) and is considered snake case.
    expect(isSnakeCase('hello')).toBe(true);
    expect(isSnakeCase('world')).toBe(true);
  });

  it('should return false for a single word that does not pass SINGLE_WORD_REGEX', () => {
    // A single word with uppercase letters should fail the SINGLE_WORD_REGEX test.
    expect(isSnakeCase('Hello')).toBe(false);
    expect(isSnakeCase('WORLD')).toBe(false);
  });
});
