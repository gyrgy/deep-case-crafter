import transformMap from './transformMap';

describe('transformMap', () => {
  it('should transform string keys in a Map', () => {
    type KeyType = 'user_id' | 'first_name';

    const input = new Map<KeyType, number>([
      ['user_id', 1],
      ['first_name', 2],
    ]);

    const result = transformMap(input, {
      targetCase: 'camel',
      sourceCase: 'snake',
    });

    expect(result.get('userId')).toBe(1);
    expect(result.get('firstName')).toBe(2);
    expect(result.size).toBe(2);
  });

  it('should not transform non-string keys', () => {
    const numKey = 123;
    const objKey = { id: 1 };

    const input = new Map<string | number | object, string>([
      ['snake_case', 'string key'],
      [numKey, 'number key'],
      [objKey, 'object key'],
    ]);

    const result = transformMap(input, { targetCase: 'camel' });

    expect(result.get('snakeCase')).toBe('string key');
    expect(result.get(numKey)).toBe('number key');
    expect(result.get(objKey)).toBe('object key');
    expect(result.size).toBe(3);
  });

  it('should handle empty Maps', () => {
    const emptyMap = new Map<string, unknown>();
    const result = transformMap(emptyMap, { targetCase: 'camel' });

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it('should return the input if not a Map', () => {
    // @ts-expect-error Testing with non-Map input
    const result = transformMap('not_a_map', { targetCase: 'camel' });
    expect(result).toBe('not_a_map');
  });

  it('should apply different case transformations', () => {
    const input = new Map<string, number>([
      ['user_id', 1],
      ['first_name', 2],
    ]);

    // Snake to kebab
    const kebabResult = transformMap(input, { targetCase: 'kebab' });
    expect(kebabResult.get('user-id')).toBe(1);
    expect(kebabResult.get('first-name')).toBe(2);

    // Snake to pascal
    const pascalResult = transformMap(input, { targetCase: 'pascal' });
    expect(pascalResult.get('UserId')).toBe(1);
    expect(pascalResult.get('FirstName')).toBe(2);
  });

  it('should maintain type compatibility with transformed Maps', () => {
    type MapKeysSnake = 'user_id' | 'first_name';

    const input = new Map<MapKeysSnake, number>([
      ['user_id', 1],
      ['first_name', 2],
    ]);

    // Without specifying sourceCase
    const result = transformMap(input, {
      targetCase: 'camel',
      sourceCase: 'snake',
    });

    // Should still transform correctly
    expect(result.get('userId')).toBe(1);
    expect(result.get('firstName')).toBe(2);
    expect(result.size).toBe(2);

    // We could also verify it works with other case patterns
    type MapKeysCamel = 'userId' | 'firstName';

    const camelMap = new Map<MapKeysCamel, number>([
      ['userId', 1],
      ['firstName', 2],
    ]);

    const snakeResult = transformMap(camelMap, {
      targetCase: 'snake',
      sourceCase: 'camel',
    });

    expect(snakeResult.get('user_id')).toBe(1);
    expect(snakeResult.get('first_name')).toBe(2);
  });

  it('should apply different case transformations', () => {
    const input = new Map<string, number>([
      ['user_id', 1],
      ['first_name', 2],
    ]);

    // Snake to kebab
    const kebabResult = transformMap(input, { targetCase: 'kebab' });
    expect(kebabResult.get('user-id')).toBe(1);
    expect(kebabResult.get('first-name')).toBe(2);

    // Snake to pascal
    const pascalResult = transformMap(input, { targetCase: 'pascal' });
    expect(pascalResult.get('UserId')).toBe(1);
    expect(pascalResult.get('FirstName')).toBe(2);
  });

  it('type test', () => {
    type MapKeysSnake = '$user_id' | 'first_name';

    const input = new Map<MapKeysSnake, number>([
      ['$user_id', 1],
      ['first_name', 2],
    ]);

    // Without specifying sourceCase
    const result = transformMap(input, {
      targetCase: 'camel',
      sourceCase: 'snake',
    });

    // Should still transform correctly
    expect(result.get('$user_id')).toBe(1);
    expect(result.get('firstName')).toBe(2);
    expect(result.get('firstName')).toBe(2);
  });
});
