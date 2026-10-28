import isDigitCode from './isDigitCode';
import isLowerCaseCode from './isLowerCaseCode';
import isUpperCaseCode from './isUpperCaseCode';

const code = (char: string) => char.charCodeAt(0);

describe('character code detectors', () => {
  it('should detect ASCII uppercase letters only', () => {
    expect(['A', 'M', 'Z'].every((c) => isUpperCaseCode(code(c)))).toBe(true);
    expect(
      ['@', '[', 'a', '0', 'Ä'].some((c) => isUpperCaseCode(code(c))),
    ).toBe(false);
    expect(isUpperCaseCode(NaN)).toBe(false);
  });

  it('should detect ASCII lowercase letters only', () => {
    expect(['a', 'm', 'z'].every((c) => isLowerCaseCode(code(c)))).toBe(true);
    expect(
      ['`', '{', 'A', '0', 'ä'].some((c) => isLowerCaseCode(code(c))),
    ).toBe(false);
    expect(isLowerCaseCode(NaN)).toBe(false);
  });

  it('should detect ASCII digits only', () => {
    expect(['0', '5', '9'].every((c) => isDigitCode(code(c)))).toBe(true);
    expect(['/', ':', 'a', '٣'].some((c) => isDigitCode(code(c)))).toBe(false);
    expect(isDigitCode(NaN)).toBe(false);
  });
});
