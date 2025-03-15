import transformCase from './transformCase';
import formatterMap from '../constants/formatterMap';

describe('transformCase', () => {
  describe('Basic transformation', () => {
    it('should transform snake_case to camelCase', () => {
      expect(transformCase('hello_world', { targetCase: 'camel' })).toBe(
        'helloWorld',
      );
    });

    it('should transform camelCase to snake_case', () => {
      expect(transformCase('helloWorld', { targetCase: 'snake' })).toBe(
        'hello_world',
      );
    });

    it('should transform kebab-case to PascalCase', () => {
      expect(transformCase('hello-world', { targetCase: 'pascal' })).toBe(
        'HelloWorld',
      );
    });

    it('should transform PascalCase to kebab-case', () => {
      expect(transformCase('HelloWorld', { targetCase: 'kebab' })).toBe(
        'hello-world',
      );
    });
  });

  describe('Edge cases', () => {
    it('should return original string if case detection fails', () => {
      expect(transformCase('$hello', { targetCase: 'camel' })).toBe('$hello');
    });

    it('should handle empty strings', () => {
      expect(transformCase('', { targetCase: 'camel' })).toBe('');
    });

    it('should handle strings with numbers at the start', () => {
      expect(transformCase('123hello', { targetCase: 'camel' })).toBe(
        '123hello',
      );
    });

    it('should handle strings with only special characters', () => {
      expect(transformCase('___', { targetCase: 'camel' })).toBe('___');
    });

    it('should return original string if already in target case', () => {
      expect(transformCase('helloWorld', { targetCase: 'camel' })).toBe(
        'helloWorld',
      );
    });
  });

  describe('Complex transformations', () => {
    it('should handle camelCase with numbers to snake_case', () => {
      expect(transformCase('hello123World', { targetCase: 'snake' })).toBe(
        'hello123_world',
      );
    });

    it('should handle PascalCase with consecutive uppercase letters to kebab-case', () => {
      expect(transformCase('HTTPResponse', { targetCase: 'kebab' })).toBe(
        'http-response',
      );
    });
  });

  describe('Unhandled cases in formatterMap', () => {
    it('should return the original string if sourceMap is missing', () => {
      const originalFormatterMap = { ...formatterMap };

      // Simulate missing sourceMap by setting it to undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (formatterMap as any)['snake'] = undefined;

      expect(transformCase('hello_world', { targetCase: 'camel' })).toBe(
        'hello_world',
      );

      // Restore original formatterMap after test
      Object.assign(formatterMap, originalFormatterMap);
    });

    it('should return the original string if formatter is missing in sourceMap', () => {
      const originalFormatterMap = { ...formatterMap };

      // Simulate missing target formatter by assigning an empty object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (formatterMap as any)['snake'] = {} as any;

      expect(transformCase('hello_world', { targetCase: 'camel' })).toBe(
        'hello_world',
      );

      // Restore original formatterMap after test
      Object.assign(formatterMap, originalFormatterMap);
    });
  });
});
