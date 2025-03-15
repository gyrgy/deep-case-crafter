import detectStringCase from './detectStringCase';

describe('detectStringCase', () => {
  it('should detect snake case', () => {
    expect(detectStringCase('hello_world')).toBe('snake');
  });

  it('should detect camel case', () => {
    expect(detectStringCase('helloWorld')).toBe('camel');
  });

  it('should detect pascal case', () => {
    expect(detectStringCase('HelloWorld')).toBe('pascal');
  });

  it('should detect kebab case', () => {
    expect(detectStringCase('hello-world')).toBe('kebab');
  });

  it('should return "single" for single-word strings', () => {
    expect(detectStringCase('hello')).toBe('single');
    expect(detectStringCase('Hello')).toBe('single');
  });

  it('should return bull for non-string inputs', () => {
    // @ts-expect-error: non-string inputs
    expect(detectStringCase(123)).toBe(null);
    // @ts-expect-error: non-string inputs
    expect(detectStringCase({})).toBe(null);
    // @ts-expect-error: non-string inputs
    expect(detectStringCase(null)).toBe(null);
    // @ts-expect-error: non-string inputs
    expect(detectStringCase(undefined)).toBe(null);
  });

  it('should return null for strings that do not match any known case', () => {
    // For example, a string that mixes delimiters or cases unexpectedly:
    expect(detectStringCase('Hello_world')).toBeNull();
    expect(detectStringCase('helloWorld-123')).toBeNull();
    // Also, any string that doesn't meet the criteria for snake, camel, pascal, or kebab.
  });
});
