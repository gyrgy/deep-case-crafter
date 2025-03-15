import detectSingleWord from './detectSingleWord';

describe('detectSingleWord', () => {
  it('should return true for an empty string', () => {
    expect(detectSingleWord('')).toBe(true);
  });

  it('should return true for a single-character string', () => {
    expect(detectSingleWord('a')).toBe(true);
    expect(detectSingleWord('Z')).toBe(true);
    expect(detectSingleWord('1')).toBe(true);
  });

  it('should return true for a lowercase single-word string', () => {
    expect(detectSingleWord('hello')).toBe(true);
    expect(detectSingleWord('world')).toBe(true);
    expect(detectSingleWord('test123')).toBe(true);
  });

  it('should return true for a capitalized single-word string', () => {
    expect(detectSingleWord('Hello')).toBe(true);
    expect(detectSingleWord('Test')).toBe(true);
  });

  it('should return false for a string containing an underscore', () => {
    expect(detectSingleWord('hello_world')).toBe(false);
    expect(detectSingleWord('_private')).toBe(false);
  });

  it('should return false for a string containing a hyphen', () => {
    expect(detectSingleWord('hello-world')).toBe(false);
    expect(detectSingleWord('-prefix')).toBe(false);
  });

  it('should return false for camelCase strings', () => {
    expect(detectSingleWord('helloWorld')).toBe(false);
    expect(detectSingleWord('testString')).toBe(false);
  });

  it('should return false for PascalCase strings', () => {
    expect(detectSingleWord('HelloWorld')).toBe(false);
    expect(detectSingleWord('TestString')).toBe(false);
  });

  it('should return false for mixed-case strings with uppercase letters beyond the first character', () => {
    expect(detectSingleWord('helloWorldTest')).toBe(false);
    expect(detectSingleWord('ThisIsATest')).toBe(false);
  });

  it('should return true for numbers-only strings', () => {
    expect(detectSingleWord('12345')).toBe(true);
    expect(detectSingleWord('0')).toBe(true);
  });

  it('should return false for strings that contain spaces', () => {
    expect(detectSingleWord('hello world')).toBe(false);
    expect(detectSingleWord(' multiple words ')).toBe(false);
  });

  it('should return false for strings that contain special characters', () => {
    expect(detectSingleWord('hello@world')).toBe(false);
    expect(detectSingleWord('hello.world')).toBe(false);
    expect(detectSingleWord('hello$world')).toBe(false);
  });
});
