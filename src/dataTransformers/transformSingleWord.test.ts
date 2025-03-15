import transformSingleWord from './transformSingleWord';

describe('transformSingleWord', () => {
  // Test transformation to PascalCase
  it('should transform lowercase word to PascalCase', () => {
    expect(transformSingleWord('role', 'pascal')).toBe('Role');
    expect(transformSingleWord('user', 'pascal')).toBe('User');
  });

  it('should transform uppercase word to PascalCase', () => {
    expect(transformSingleWord('ROLE', 'pascal')).toBe('Role');
    expect(transformSingleWord('USER', 'pascal')).toBe('User');
  });

  it('should preserve PascalCase for already PascalCase words', () => {
    expect(transformSingleWord('Role', 'pascal')).toBe('Role');
    expect(transformSingleWord('User', 'pascal')).toBe('User');
  });

  // Test transformation to camelCase
  it('should transform lowercase word to camelCase', () => {
    expect(transformSingleWord('role', 'camel')).toBe('role');
    expect(transformSingleWord('user', 'camel')).toBe('user');
  });

  it('should transform uppercase word to camelCase', () => {
    expect(transformSingleWord('ROLE', 'camel')).toBe('rOLE');
    expect(transformSingleWord('USER', 'camel')).toBe('uSER');
  });

  it('should transform PascalCase word to camelCase', () => {
    expect(transformSingleWord('Role', 'camel')).toBe('role');
    expect(transformSingleWord('User', 'camel')).toBe('user');
  });

  // Test transformation to snake_case
  it('should transform any casing to snake_case', () => {
    expect(transformSingleWord('role', 'snake')).toBe('role');
    expect(transformSingleWord('ROLE', 'snake')).toBe('role');
    expect(transformSingleWord('Role', 'snake')).toBe('role');
  });

  // Test transformation to kebab-case
  it('should transform any casing to kebab-case', () => {
    expect(transformSingleWord('role', 'kebab')).toBe('role');
    expect(transformSingleWord('ROLE', 'kebab')).toBe('role');
    expect(transformSingleWord('Role', 'kebab')).toBe('role');
  });

  // Edge cases
  it('should handle empty strings', () => {
    expect(transformSingleWord('', 'pascal')).toBe('');
    expect(transformSingleWord('', 'camel')).toBe('');
    expect(transformSingleWord('', 'snake')).toBe('');
    expect(transformSingleWord('', 'kebab')).toBe('');
  });

  it('should handle single character strings', () => {
    expect(transformSingleWord('r', 'pascal')).toBe('R');
    expect(transformSingleWord('R', 'camel')).toBe('r');
    expect(transformSingleWord('r', 'snake')).toBe('r');
    expect(transformSingleWord('R', 'kebab')).toBe('r');
  });

  it('should handle invalid target case by returning the input unchanged', () => {
    // @ts-expect-error Testing with invalid target case
    expect(transformSingleWord('role', 'invalid')).toBe('role');
  });
});
