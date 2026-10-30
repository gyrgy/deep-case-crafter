import singleWordToCase from './singleWordToCase';

describe('singleWordToCase', () => {
  it('should capitalize a word for PascalCase', () => {
    expect(singleWordToCase('user', 'pascal')).toBe('User');
    expect(singleWordToCase('User', 'pascal')).toBe('User');
    expect(singleWordToCase('item2', 'pascal')).toBe('Item2');
  });

  it('should lowercase the first letter for camelCase', () => {
    expect(singleWordToCase('User', 'camel')).toBe('user');
    expect(singleWordToCase('user', 'camel')).toBe('user');
    expect(singleWordToCase('S3', 'camel')).toBe('s3');
  });

  it('should uppercase a word for CONSTANT_CASE', () => {
    expect(singleWordToCase('user', 'constant')).toBe('USER');
    expect(singleWordToCase('User', 'constant')).toBe('USER');
    expect(singleWordToCase('item2', 'constant')).toBe('ITEM2');
  });

  it('should lowercase a word for snake_case and kebab-case', () => {
    expect(singleWordToCase('User', 'snake')).toBe('user');
    expect(singleWordToCase('user', 'snake')).toBe('user');
    expect(singleWordToCase('User', 'kebab')).toBe('user');
  });
});
