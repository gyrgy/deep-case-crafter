import camelToSnakeCase from './camelToSnakeCase';

describe('camelToSnakeCase', () => {
  it('should convert a simple camelCase string to snake_case', () => {
    expect(camelToSnakeCase('helloWorld')).toBe('hello_world');
  });

  it('should handle multiple capital letters', () => {
    expect(camelToSnakeCase('helloWorldAgain')).toBe('hello_world_again');
  });

  it('should handle consecutive capital letters', () => {
    expect(camelToSnakeCase('getHTTPResponse')).toBe('get_h_t_t_p_response');
  });

  it('should handle camelCase strings with numbers', () => {
    expect(camelToSnakeCase('hello123World')).toBe('hello123_world');
  });

  it('should return empty string for empty input', () => {
    expect(camelToSnakeCase('')).toBe('');
  });
});
