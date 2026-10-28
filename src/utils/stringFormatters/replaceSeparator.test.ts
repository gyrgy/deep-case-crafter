import replaceSeparator from './replaceSeparator';

describe('replaceSeparator', () => {
  it('should replace every separator', () => {
    expect(replaceSeparator('user_id', '_', '-')).toBe('user-id');
    expect(replaceSeparator('a-b-c-d', '-', '_')).toBe('a_b_c_d');
  });

  it('should leave a string without the separator unchanged', () => {
    expect(replaceSeparator('user', '_', '-')).toBe('user');
  });
});
