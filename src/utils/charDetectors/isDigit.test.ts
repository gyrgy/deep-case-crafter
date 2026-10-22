import isDigit from './isDigit';

describe('isDigit', () => {
  it('should return true for 0 to 9', () => {
    expect(isDigit('0')).toBe(true);
    expect(isDigit('5')).toBe(true);
    expect(isDigit('9')).toBe(true);
  });

  it('should return false for other characters', () => {
    expect(isDigit('a')).toBe(false);
    expect(isDigit('A')).toBe(false);
    expect(isDigit('/')).toBe(false); // just before '0'
    expect(isDigit(':')).toBe(false); // just after '9'
    expect(isDigit('')).toBe(false);
  });
});
