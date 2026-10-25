import isLowerCaseLetter from './isLowerCaseLetter';

describe('isLowerCaseLetter', () => {
  it('should return true for a to z', () => {
    expect(isLowerCaseLetter('a')).toBe(true);
    expect(isLowerCaseLetter('m')).toBe(true);
    expect(isLowerCaseLetter('z')).toBe(true);
  });

  it('should return false for other characters', () => {
    expect(isLowerCaseLetter('A')).toBe(false);
    expect(isLowerCaseLetter('1')).toBe(false);
    expect(isLowerCaseLetter('-')).toBe(false);
    expect(isLowerCaseLetter('`')).toBe(false); // just before 'a'
    expect(isLowerCaseLetter('{')).toBe(false); // just after 'z'
    expect(isLowerCaseLetter('é')).toBe(false);
    expect(isLowerCaseLetter('')).toBe(false);
  });
});
