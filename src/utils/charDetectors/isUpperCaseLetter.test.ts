import isUpperCaseLetter from './isUpperCaseLetter';

describe('isUpperCaseLetter', () => {
  it('should return true for A to Z', () => {
    expect(isUpperCaseLetter('A')).toBe(true);
    expect(isUpperCaseLetter('M')).toBe(true);
    expect(isUpperCaseLetter('Z')).toBe(true);
  });

  it('should return false for other characters', () => {
    expect(isUpperCaseLetter('a')).toBe(false);
    expect(isUpperCaseLetter('1')).toBe(false);
    expect(isUpperCaseLetter('_')).toBe(false);
    expect(isUpperCaseLetter('@')).toBe(false); // just before 'A'
    expect(isUpperCaseLetter('[')).toBe(false); // just after 'Z'
    expect(isUpperCaseLetter('É')).toBe(false);
    expect(isUpperCaseLetter('')).toBe(false);
  });
});
