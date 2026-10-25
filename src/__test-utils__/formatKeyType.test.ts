import ts from 'typescript';
import formatKeyType from './formatKeyType';

describe('formatKeyType', () => {
  // A checker without any source files is enough to create the types
  const checker = ts.createProgram([], { noLib: true }).getTypeChecker();

  it('should format a string literal type as its value', () => {
    expect(
      formatKeyType(checker, checker.getStringLiteralType('user_id')),
    ).toBe('user_id');
    expect(formatKeyType(checker, checker.getStringLiteralType(''))).toBe('');
  });

  it('should wrap any other type in angle brackets', () => {
    expect(formatKeyType(checker, checker.getStringType())).toBe('<string>');
    expect(formatKeyType(checker, checker.getNeverType())).toBe('<never>');
  });
});
