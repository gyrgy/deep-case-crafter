import camelToSnakeCase from './camelToSnakeCase';

describe('camelToSnakeCase', () => {
  it('should convert a simple camelCase string to snake_case', () => {
    expect(camelToSnakeCase('helloWorld')).toBe('hello_world');
  });

  it('should handle multiple capital letters', () => {
    expect(camelToSnakeCase('helloWorldAgain')).toBe('hello_world_again');
  });

  it('should treat acronyms as whole words', () => {
    expect(camelToSnakeCase('getHTTPResponse')).toBe('get_http_response');
    expect(camelToSnakeCase('userID')).toBe('user_id');
    expect(camelToSnakeCase('parseHTMLString')).toBe('parse_html_string');
  });

  it('should keep a one-letter word apart from the next word', () => {
    expect(camelToSnakeCase('isAValidUser')).toBe('is_a_valid_user');
    expect(camelToSnakeCase('hasAPrimaryKey')).toBe('has_a_primary_key');
    expect(camelToSnakeCase('getAValue')).toBe('get_a_value');
    expect(camelToSnakeCase('threeDSecure')).toBe('three_d_secure');
  });

  it('should handle camelCase strings with numbers', () => {
    expect(camelToSnakeCase('hello123World')).toBe('hello123_world');
  });

  it('should return empty string for empty input', () => {
    expect(camelToSnakeCase('')).toBe('');
  });
});
