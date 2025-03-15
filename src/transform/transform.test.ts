import transform from './transform';

describe('transform (recursive)', () => {
  it('should transform a simple object', () => {
    const input = { user_id: 1, first_name: 'John' };
    const expected = { userId: 1, firstName: 'John' };

    expect(transform(input, { targetCase: 'camel' })).toEqual(expected);
  });

  it('should transform nested objects', () => {
    const input = {
      user_id: 1,
      user_info: {
        first_name: 'John',
        last_name: 'Doe',
        address_info: {
          street_name: 'Main St',
          zip_code: '12345',
        },
      },
    };

    const expected = {
      userId: 1,
      userInfo: {
        firstName: 'John',
        lastName: 'Doe',
        addressInfo: {
          streetName: 'Main St',
          zipCode: '12345',
        },
      },
    };

    const result = transform(input, {
      targetCase: 'camel',
      sourceCase: 'snake',
    });

    expect(result).toEqual(expected);
  });

  it('should transform arrays of objects - snake -> pascal', () => {
    const input = [
      { user_id: 1, first_name: 'John' },
      { user_id: 2, first_name: 'Jane' },
    ];

    const expected = [
      { UserId: 1, FirstName: 'John' },
      { UserId: 2, FirstName: 'Jane' },
    ];

    const result = transform(input, {
      targetCase: 'pascal',
      sourceCase: 'snake',
    });

    expect(result).toEqual(expected);
  });

  it('should transform arrays of objects - kebab -> pascal', () => {
    const input = [
      { 'user-id': 1, 'first-name': 'John' },
      { 'user-id': 2, 'first-name': 'Jane' },
    ];

    const expected = [
      { UserId: 1, FirstName: 'John' },
      { UserId: 2, FirstName: 'Jane' },
    ];

    const result = transform(input, {
      targetCase: 'pascal',
    });

    expect(result).toEqual(expected);
  });

  it('should transform objects with array properties', () => {
    type UserPosts = {
      post_id: number;
      post_title: string;
    };

    type InputSource = {
      user_id: number;
      user_posts: UserPosts[];
    };

    const input: InputSource = {
      user_id: 1,
      user_posts: [
        { post_id: 101, post_title: 'Hello World' },
        { post_id: 102, post_title: 'Another Post' },
      ],
    };

    const expected = {
      userId: 1,
      userPosts: [
        { postId: 101, postTitle: 'Hello World' },
        { postId: 102, postTitle: 'Another Post' },
      ],
    };

    const result = transform(input, {
      targetCase: 'camel',
      sourceCase: 'snake',
    });

    expect(result).toEqual(expected);
  });

  it('should transform Maps with object values', () => {
    const input = new Map([
      ['user_info', { first_name: 'John', last_name: 'Doe' }],
      ['post_info', { post_id: 101, post_title: 'Hello' }],
    ]);

    const result = transform(input, { targetCase: 'camel' }) as Map<
      string,
      unknown
    >;

    expect(result.get('userInfo')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.get('postInfo')).toEqual({ postId: 101, postTitle: 'Hello' });
  });

  it('should respect the depth parameter', () => {
    const input = {
      user_id: 1,
      user_info: {
        address_info: {
          street_details: {
            street_name: 'Main St',
          },
        },
      },
    };

    // With depth: 2
    const result1 = transform(input, { targetCase: 'camel', depth: 2 });
    expect(result1).toEqual({
      userId: 1,
      userInfo: {
        addressInfo: {
          street_details: {
            // This should not be transformed (depth limit)
            street_name: 'Main St',
          },
        },
      },
    });

    // With depth: 3
    const result2 = transform(input, { targetCase: 'camel', depth: 3 });
    expect(result2).toEqual({
      userId: 1,
      userInfo: {
        addressInfo: {
          streetDetails: {
            street_name: 'Main St', // This should not be transformed (depth limit)
          },
        },
      },
    });

    // With unlimited depth
    const result3 = transform(input, { targetCase: 'camel', depth: Infinity });
    expect(result3).toEqual({
      userId: 1,
      userInfo: {
        addressInfo: {
          streetDetails: {
            streetName: 'Main St', // This should be transformed (unlimited depth)
          },
        },
      },
    });
  });

  it('should handle circular references', () => {
    // Create an object with circular references
    interface CircularObject {
      user_id: number;
      self?: CircularObject;
      nested?: { parent?: CircularObject };
      [key: string]: unknown;
    }

    const circular: CircularObject = { user_id: 1 };
    circular.self = circular;
    circular.nested = { parent: circular };

    const result = transform(circular, { targetCase: 'camel' }) as Record<
      string,
      unknown
    >;

    expect(result.userId).toBe(1);
    expect(result.self).toBe(result); // Should maintain the circular reference
    expect((result.nested as Record<string, unknown>).parent).toBe(result); // Should maintain the nested circular reference
  });

  it('should transform objects within a Set', () => {
    type SetObj = {
      user_id: number;
      first_name: string;
    };

    const input = new Set<SetObj>([
      { user_id: 1, first_name: 'John' },
      { user_id: 2, first_name: 'Jane' },
    ]);

    const result = transform(input, {
      targetCase: 'camel',
      sourceCase: 'snake',
    }) as Set<unknown>;
    // const result = transform(input, {
    //   targetCase: 'camel',
    //   sourceCase: 'snake',
    // });

    // Check that the objects in the Set were transformed
    const values = Array.from(result.values());
    expect(values).toContainEqual({ userId: 1, firstName: 'John' });
    expect(values).toContainEqual({ userId: 2, firstName: 'Jane' });
  });

  it('should use default options when none are provided', () => {
    const input = { user_id: 1, first_name: 'John' };
    const expected = { userId: 1, firstName: 'John' };

    const result = transform(input, {
      targetCase: 'camel',
      sourceCase: 'snake',
    });

    expect(result).toEqual(expected);
  });

  it('should use default depth when none is provided', () => {
    const input = { a_key: { b_key: { c_key: { d_key: 'value' } } } };
    const result = transform(input, { targetCase: 'camel' });
    expect(result).toEqual({ aKey: { bKey: { cKey: { d_key: 'value' } } } });
  });

  it('should apply default targetCase when undefined is explicitly passed', () => {
    const input = { user_id: 1, first_name: 'John' };
    const expected = { userId: 1, firstName: 'John' };
    const result = transform(input, { targetCase: undefined });
    expect(result).toEqual(expected);
  });

  it('should apply default depth when undefined is explicitly passed', () => {
    const input = { a_key: { b_key: { c_key: { d_key: 'value' } } } };
    const result = transform(input, { targetCase: 'camel', depth: undefined });
    expect(result).toEqual({ aKey: { bKey: { cKey: { d_key: 'value' } } } });
  });

  it('should use defaults when options are explicitly undefined', () => {
    const input = { user_id: 1, first_name: 'John' };
    const expected = { userId: 1, firstName: 'John' };
    const result = transform(input, undefined);
    expect(result).toEqual(expected);
  });
});
