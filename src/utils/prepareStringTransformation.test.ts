import { prepareStringTransformation } from './prepareStringTransformation';

describe('prepareStringTransformation', () => {
  it('should throw an error if input is not a string', () => {
    expect(() =>
      prepareStringTransformation(null as unknown as string),
    ).toThrow('Input must be a string');
    expect(() => prepareStringTransformation(123 as unknown as string)).toThrow(
      'Input must be a string',
    );
    expect(() =>
      prepareStringTransformation(undefined as unknown as string),
    ).toThrow('Input must be a string');
    expect(() => prepareStringTransformation({} as unknown as string)).toThrow(
      'Input must be a string',
    );
  });

  it('should return early for empty strings', () => {
    const result = prepareStringTransformation('');
    expect(result).toEqual({
      string: '',
      shouldTransform: false,
      sourceCase: null,
      singleWord: false,
    });
  });

  it('should treat strings with unsupported characters as preserved keys', () => {
    const result = prepareStringTransformation('invalid@string');
    expect(result).toEqual({
      string: 'invalid@string',
      shouldTransform: false,
      sourceCase: null,
      singleWord: false,
    });
  });

  it('should treat strings with leading underscores as preserved keys', () => {
    const result = prepareStringTransformation('_leading');
    expect(result).toEqual({
      string: '_leading',
      shouldTransform: false,
      sourceCase: null,
      singleWord: false,
    });
  });

  it('should treat strings with trailing hyphens as preserved keys', () => {
    const result = prepareStringTransformation('trailing-');
    expect(result).toEqual({
      string: 'trailing-',
      shouldTransform: false,
      sourceCase: null,
      singleWord: false,
    });
  });

  it('should treat UUIDs as preserved keys, in either case', () => {
    const uuids = [
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'F47AC10B-58CC-4372-A567-0E02B2C3D479',
      'abcdefab-cdef-abcd-efab-cdefabcdefab',
      '550e8400-e29b-41d4-a716-446655440000',
    ];
    for (const uuid of uuids) {
      expect(prepareStringTransformation(uuid)).toEqual({
        string: uuid,
        shouldTransform: false,
        sourceCase: null,
        singleWord: false,
      });
    }
  });

  it('should detect the case of keys that are not quite UUIDs', () => {
    const nearMisses = [
      'f47ac10b-58cc-4372-a567-0e02b2c3d47', // a segment too short
      'f47ac10b-58cc-4372-a5670-e02b2c3d479', // a segment too long
      'f47ac10b-58cc-4372-a567-0e02b2c3d4790', // one character too many
      'g47ac10b-58cc-4372-a567-0e02b2c3d479', // a letter that is not hexadecimal
      'f47ac10b-58cc-4372-a567-0e02-b2c3d479', // an extra dash
    ];
    for (const key of nearMisses) {
      expect(prepareStringTransformation(key)).toEqual({
        string: key,
        shouldTransform: true,
        sourceCase: 'kebab',
        singleWord: false,
      });
    }
    // Without dashes, or with underscores instead
    expect(
      prepareStringTransformation('f47ac10b58cc4372a5670e02b2c3d479'),
    ).toEqual({
      string: 'f47ac10b58cc4372a5670e02b2c3d479',
      shouldTransform: true,
      sourceCase: null,
      singleWord: true,
    });
    expect(
      prepareStringTransformation('f47ac10b_58cc_4372_a567_0e02b2c3d479'),
    ).toEqual({
      string: 'f47ac10b_58cc_4372_a567_0e02b2c3d479',
      shouldTransform: true,
      sourceCase: 'snake',
      singleWord: false,
    });
  });

  it('should return shouldTransform false if detectStringCase returns null', () => {
    const result = prepareStringTransformation('123string');
    expect(result).toEqual({
      string: '123string',
      shouldTransform: false,
      sourceCase: null,
      singleWord: false,
    });
  });

  it('should handle single word strings correctly', () => {
    const result = prepareStringTransformation('word');
    expect(result).toEqual({
      string: 'word',
      shouldTransform: true,
      sourceCase: null,
      singleWord: true,
    });
  });

  it('should handle camel case strings correctly', () => {
    const result = prepareStringTransformation('camelCaseString');
    expect(result).toEqual({
      string: 'camelCaseString',
      shouldTransform: true,
      sourceCase: 'camel',
      singleWord: false,
    });
  });

  it('should handle pascal case strings correctly', () => {
    const result = prepareStringTransformation('PascalCaseString');
    expect(result).toEqual({
      string: 'PascalCaseString',
      shouldTransform: true,
      sourceCase: 'pascal',
      singleWord: false,
    });
  });

  it('should handle snake case strings correctly', () => {
    const result = prepareStringTransformation('snake_case_string');
    expect(result).toEqual({
      string: 'snake_case_string',
      shouldTransform: true,
      sourceCase: 'snake',
      singleWord: false,
    });
  });

  it('should handle kebab case strings correctly', () => {
    const result = prepareStringTransformation('kebab-case-string');
    expect(result).toEqual({
      string: 'kebab-case-string',
      shouldTransform: true,
      sourceCase: 'kebab',
      singleWord: false,
    });
  });

  it('should handle strings with numbers correctly', () => {
    const result = prepareStringTransformation('string123');
    expect(result).toEqual({
      string: 'string123',
      shouldTransform: true,
      sourceCase: null,
      singleWord: true,
    });
  });

  it('should return shouldTransform false if detectStringCase returns null for ambiguous cases', () => {
    const result = prepareStringTransformation('mixedString_test');
    expect(result).toEqual({
      string: 'mixedString_test',
      shouldTransform: false,
      sourceCase: null,
      singleWord: false,
    });
  });
});
