import { StringCase } from '../types/stringCaseTypes';
import evaluateKeyTypes from './evaluateKeyTypes';

describe('evaluateKeyTypes', () => {
  it('should return the transformed key type of each case, in order', () => {
    expect(
      evaluateKeyTypes([
        { key: 'user_id', targetCase: 'camel' },
        { key: 'userId', targetCase: 'snake' },
        { key: 'user_id', targetCase: 'pascal' },
        { key: 'userId', targetCase: 'kebab' },
        { key: '_private', targetCase: 'camel' },
      ]),
    ).toEqual(['userId', 'user_id', 'UserId', 'user-id', '_private']);
  });

  it('should pass keys with quotes, backslashes and no characters through intact', () => {
    const keys = ['say "hi"', "it's", 'back\\slash', ''];
    expect(
      evaluateKeyTypes(keys.map((key) => ({ key, targetCase: 'snake' }))),
    ).toEqual(keys);
  });

  it('should throw the compiler errors when the types do not compile', () => {
    expect(() =>
      evaluateKeyTypes([{ key: 'a', targetCase: 'title' as StringCase }]),
    ).toThrow(/'"title"' does not satisfy the constraint 'StringCase'/);
  });
});
