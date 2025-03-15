import transformArray from './transformArray';

describe('transformArray', () => {
  it('should transform objects within an array', () => {
    const input = [
      { user_id: 1, first_name: 'John' },
      { user_id: 2, first_name: 'Jane' },
    ];

    const expected = [
      { userId: 1, firstName: 'John' },
      { userId: 2, firstName: 'Jane' },
    ];

    const result = transformArray(input, { targetCase: 'camel' });
    expect(result).toEqual(expected);
  });

  it('should transform Maps within an array', () => {
    type KeyType = 'user_id' | 'first_name';

    const map1 = new Map<KeyType, number>([
      ['user_id', 1],
      ['first_name', 2],
    ]);

    const map2 = new Map<KeyType, number>([
      ['user_id', 3],
      ['first_name', 4],
    ]);

    const input = [map1, map2];
    const result = transformArray(input, {
      targetCase: 'camel',
      sourceCase: 'snake',
    });

    // Check first Map
    const resultMap1 = result[0] as Map<string, number>;
    expect(resultMap1.get('userId')).toBe(1);
    expect(resultMap1.get('firstName')).toBe(2);

    // Check second Map
    const resultMap2 = result[1] as Map<string, number>;
    expect(resultMap2.get('userId')).toBe(3);
    expect(resultMap2.get('firstName')).toBe(4);
  });

  it('should handle mixed arrays with objects, Maps and primitives', () => {
    const obj = { user_id: 1 };
    const map = new Map<string, number>([['user_id', 2]]);

    const input = [obj, map, 'string_value', 123, null, undefined, true];

    const result = transformArray(input, { targetCase: 'camel' });

    // Check object transformation
    expect(result[0]).toEqual({ userId: 1 });

    // Check Map transformation
    const resultMap = result[1] as Map<string, number>;
    expect(resultMap.get('userId')).toBe(2);

    // Check primitives remain unchanged
    expect(result[2]).toBe('string_value');
    expect(result[3]).toBe(123);
    expect(result[4]).toBe(null);
    expect(result[5]).toBe(undefined);
    expect(result[6]).toBe(true);
  });

  it('should handle Set objects without transforming their contents', () => {
    const set = new Set(['user_id', 'first_name']);
    const input = [set];

    const result = transformArray(input, { targetCase: 'camel' });

    // The Set itself should be unchanged
    expect(result[0]).toBe(set);

    // The contents should still be the original values
    expect((result[0] as Set<string>).has('user_id')).toBe(true);
    expect((result[0] as Set<string>).has('first_name')).toBe(true);
  });

  it('should not transform nested arrays', () => {
    const input = [[{ user_id: 1 }]];

    const result = transformArray(input, { targetCase: 'camel' });

    // The nested array should be unchanged
    expect(result[0]).toEqual([{ user_id: 1 }]);
  });

  it('should handle empty arrays', () => {
    expect(transformArray([], { targetCase: 'camel' })).toEqual([]);
  });

  it('should return the input if not an array', () => {
    // @ts-expect-error Testing with non-array input
    const result = transformArray('not_an_array', { targetCase: 'camel' });
    expect(result).toBe('not_an_array');
  });

  it('should provide strongly typed results with sourceCase', () => {
    interface UserSnakeCase {
      user_id: number;
      first_name: string;
    }

    // interface UserCamelCase {
    //   userId: number;
    //   firstName: string;
    // }

    const users: UserSnakeCase[] = [{ user_id: 1, first_name: 'John' }];

    const result = transformArray(users, {
      targetCase: 'camel',
      sourceCase: 'snake',
    });

    // Type should be inferred correctly
    expect(result[0].userId).toBe(1);
    expect(result[0].firstName).toBe('John');
  });
});
