import separatedToCamelCase from './separatedToCamelCase';

describe('separatedToCamelCase', () => {
  it('should convert snake_case and kebab-case to camelCase', () => {
    expect(separatedToCamelCase('user_id', '_', false)).toBe('userId');
    expect(separatedToCamelCase('first-name', '-', false)).toBe('firstName');
    expect(separatedToCamelCase('a_b_c', '_', false)).toBe('aBC');
  });

  it('should convert them to PascalCase', () => {
    expect(separatedToCamelCase('user_id', '_', true)).toBe('UserId');
    expect(separatedToCamelCase('api-key', '-', true)).toBe('ApiKey');
  });

  it('should keep digits in place', () => {
    expect(separatedToCamelCase('address_line_1', '_', false)).toBe(
      'addressLine1',
    );
    expect(separatedToCamelCase('s3-bucket', '-', true)).toBe('S3Bucket');
  });

  it('should leave a single word as it is, capitalized for PascalCase', () => {
    expect(separatedToCamelCase('user', '_', false)).toBe('user');
    expect(separatedToCamelCase('user', '_', true)).toBe('User');
  });
});
