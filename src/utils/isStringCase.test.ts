import isStringCase from './isStringCase';

describe('isStringCase', () => {
  it('should return true for the supported case formats', () => {
    expect(isStringCase('camel')).toBe(true);
    expect(isStringCase('snake')).toBe(true);
    expect(isStringCase('pascal')).toBe(true);
    expect(isStringCase('kebab')).toBe(true);
  });

  it('should return false for anything else, including inherited property names', () => {
    expect(isStringCase('title')).toBe(false);
    expect(isStringCase('toString')).toBe(false);
    expect(isStringCase('__proto__')).toBe(false);
    expect(isStringCase('Camel')).toBe(false);
    expect(isStringCase(undefined)).toBe(false);
    expect(isStringCase(1)).toBe(false);
  });
});
