import generateKeys from './generateKeys';

describe('generateKeys', () => {
  it('should generate every combination up to the maximum length, shortest first', () => {
    expect(generateKeys(['a', 'B'], 2)).toEqual([
      'a',
      'B',
      'aa',
      'aB',
      'Ba',
      'BB',
    ]);
  });

  it('should generate each key once', () => {
    const keys = generateKeys(['a', 'A', '1'], 3);
    expect(keys).toHaveLength(3 + 3 ** 2 + 3 ** 3);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('should return no keys for a maximum length of 0', () => {
    expect(generateKeys(['a'], 0)).toEqual([]);
  });
});
