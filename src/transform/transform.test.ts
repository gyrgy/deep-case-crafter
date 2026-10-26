import { runInNewContext } from 'node:vm';
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

  it('should default to unlimited depth when none is provided', () => {
    const input = { a_key: { b_key: { c_key: { d_key: 'value' } } } };
    const result = transform(input, { targetCase: 'camel' });
    expect(result).toEqual({ aKey: { bKey: { cKey: { dKey: 'value' } } } });
  });

  it('should apply default targetCase when undefined is explicitly passed', () => {
    const input = { user_id: 1, first_name: 'John' };
    const expected = { userId: 1, firstName: 'John' };
    const result = transform(input, { targetCase: undefined });
    expect(result).toEqual(expected);
  });

  it('should apply unlimited default depth when undefined is explicitly passed', () => {
    const input = { a_key: { b_key: { c_key: { d_key: 'value' } } } };
    const result = transform(input, { targetCase: 'camel', depth: undefined });
    expect(result).toEqual({ aKey: { bKey: { cKey: { dKey: 'value' } } } });
  });

  it('should use defaults when options are explicitly undefined', () => {
    const input = { user_id: 1, first_name: 'John' };
    const expected = { userId: 1, firstName: 'John' };
    const result = transform(input, undefined);
    expect(result).toEqual(expected);
  });

  it('should accept the return type', () => {
    type Input = {
      user_id: number;
      first_name: string;
    };

    const obj = {
      user_id: 1,
      first_name: 'John',
    };

    type Output = {
      userId: number;
      firstName: string;
    };

    const result = transform<Input, Output>(obj, { targetCase: 'camel' });
    const typedResult: Output = result;

    expect(typedResult).toEqual({ userId: 1, firstName: 'John' });
  });

  it('should reject unsupported target cases from plain JavaScript callers', () => {
    for (const targetCase of [
      'title',
      'toString',
      '__proto__',
      'constructor',
    ]) {
      expect(() =>
        transform({ user_id: 1 }, { targetCase: targetCase as 'camel' }),
      ).toThrow(
        new TypeError(
          `Unsupported targetCase "${targetCase}". Use one of: camel, snake, pascal, kebab.`,
        ),
      );
    }
  });

  it('should default to camelCase for an empty targetCase from plain JavaScript callers', () => {
    for (const targetCase of ['', null, undefined]) {
      expect(
        transform(
          { user_id: 1 },
          { targetCase: targetCase as unknown as 'camel' },
        ),
      ).toEqual({ userId: 1 });
    }
  });

  it('should reject a depth that is not a number', () => {
    const cases = [
      [NaN, 'NaN'],
      ['3', '"3"'],
      ['Infinity', '"Infinity"'],
      [{}, '[object Object]'],
    ] as const;
    for (const [depth, description] of cases) {
      expect(() =>
        transform({ user_id: 1 }, { depth: depth as unknown as number }),
      ).toThrow(
        new TypeError(
          `Unsupported depth ${description}. Use a number, or omit depth to transform every level.`,
        ),
      );
    }
  });

  it('should treat a null depth like an omitted one', () => {
    expect(
      transform({ a_b: { c_d: 1 } }, { depth: null as unknown as number }),
    ).toEqual({ aB: { cD: 1 } });
  });

  describe('depth levels', () => {
    it('should transform nothing with depth 0', () => {
      const input = { user_id: 1 };
      expect(transform(input, { depth: 0 })).toBe(input);
    });

    it('should keep array items on the level of their array', () => {
      expect(
        transform([{ user_id: 1, user_info: { first_name: 'x' } }], {
          depth: 1,
        }),
      ).toEqual([{ userId: 1, userInfo: { first_name: 'x' } }]);
      expect(
        transform({ user_list: [[{ user_id: 1 }]] }, { depth: 2 }),
      ).toEqual({ userList: [[{ userId: 1 }]] });
    });

    it('should put the values of Maps and Sets one level deeper', () => {
      const map = new Map([['user_info', { first_name: 'x' }]]);
      const set = new Set([{ first_name: 'x' }]);
      expect(transform(map, { depth: 1 })).toEqual(
        new Map([['userInfo', { first_name: 'x' }]]),
      );
      expect(transform(set, { depth: 1 })).toEqual(
        new Set([{ first_name: 'x' }]),
      );
      expect(transform(set, { depth: 2 })).toEqual(
        new Set([{ firstName: 'x' }]),
      );
    });
  });

  it('should keep Dates intact when building an API payload', () => {
    const input = {
      userId: 1,
      createdAt: new Date('2024-01-02T03:04:05Z'),
    };

    const result = transform(input, { targetCase: 'snake' });

    expect(JSON.stringify(result)).toBe(
      '{"user_id":1,"created_at":"2024-01-02T03:04:05.000Z"}',
    );
  });

  it('should convert class instances to plain objects with transformed keys', () => {
    class User {
      user_id = 1;
      first_name = 'John';
    }

    const result = transform(new User(), { targetCase: 'camel' });

    expect(result).toEqual({ userId: 1, firstName: 'John' });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });

  it('should transform a Map and a Set from another realm', () => {
    const foreignMap = runInNewContext(
      "new Map([['user_id', { first_name: 1 }]])",
    );
    const foreignSet = runInNewContext('new Set([{ first_name: 1 }])');

    const result = transform(
      { the_map: foreignMap, the_set: foreignSet },
      { targetCase: 'camel' },
    ) as { theMap: Map<string, unknown>; theSet: Set<unknown> };

    expect(result.theMap.get('userId')).toEqual({ firstName: 1 });
    expect([...result.theSet]).toEqual([{ firstName: 1 }]);
  });

  it('should preserve a __proto__ key without dropping it or polluting the prototype', () => {
    const input: Record<string, unknown> = { real_key: 2 };
    // define via descriptor so the input itself has a genuine own __proto__ key
    Object.defineProperty(input, '__proto__', {
      value: 1,
      enumerable: true,
      writable: true,
      configurable: true,
    });

    const result = transform(input, {
      sourceCase: 'snake',
      targetCase: 'camel',
    }) as Record<string, unknown>;

    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(
      true,
    );
    expect(result['__proto__']).toBe(1);
    expect(result.realKey).toBe(2);
    // the result's prototype must be untouched, and Object.prototype unpolluted
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('should leave data keys written only in capitals unchanged', () => {
    const input = {
      exchange_rates: { USD: 1, EUR: 0.9 },
      route_map: { GET: '/users', POST: '/users' },
    };
    expect(transform(input, { targetCase: 'kebab' })).toEqual({
      'exchange-rates': { USD: 1, EUR: 0.9 },
      'route-map': { GET: '/users', POST: '/users' },
    });
  });

  it('should leave UUID keys unchanged, in objects and Maps', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const input = {
      users_by_id: { [id]: { first_name: 'John' } },
      sessions_by_user: new Map([[id, { last_seen: 1 }]]),
    };
    expect(transform(input, { targetCase: 'pascal' })).toEqual({
      UsersById: { [id]: { FirstName: 'John' } },
      SessionsByUser: new Map([[id, { LastSeen: 1 }]]),
    });
  });

  it('should round-trip camelCase keys through PascalCase', () => {
    const input = { xAxis: 1, eTag: 2, iPhone: 3, httpResponse: 4 };
    const pascal = transform(input, { targetCase: 'pascal' });
    expect(pascal).toEqual({ XAxis: 1, ETag: 2, IPhone: 3, HttpResponse: 4 });
    expect(transform(pascal, { targetCase: 'camel' })).toEqual(input);
  });

  it('should round-trip camelCase keys with one-letter words through snake_case', () => {
    const input = { isAValidUser: 1, threeDSecure: 2, xAxis: 3 };
    const snake = transform(input, { targetCase: 'snake' });
    expect(snake).toEqual({ is_a_valid_user: 1, three_d_secure: 2, x_axis: 3 });
    expect(transform(snake, { targetCase: 'camel' })).toEqual(input);
  });

  it('should keep a plural s with an acronym, also before a two-letter word', () => {
    expect(
      transform({ allowedURLs: 1, APIsList: 2 }, { targetCase: 'snake' }),
    ).toEqual({ allowed_urls: 1, apis_list: 2 });
    // Ambiguous, and kept as a plural: 'Is' cannot be told apart from 'APIs'
    expect(transform({ SSLIsEnabled: 1 }, { targetCase: 'snake' })).toEqual({
      sslis_enabled: 1,
    });
  });

  describe('exclude', () => {
    it('should leave the keys at the paths unchanged, and transform the values under them', () => {
      const response = {
        users_by_id: { abc_1: { first_name: 'Ann' } },
        metadata: { order_ref: 'A1' },
      };
      const result = transform(response, {
        exclude: ['users_by_id.*', 'metadata.*'],
      });
      expect(result).toEqual({
        usersById: { abc_1: { firstName: 'Ann' } },
        metadata: { order_ref: 'A1' },
      });
      expect(result.usersById.abc_1.firstName).toBe('Ann');
    });

    it('should apply the paths to the source keys, whatever the target case', () => {
      const input = { locale_map: { en_gb: { greeting_text: 'Hi' } } };
      expect(
        transform(input, {
          targetCase: 'kebab',
          exclude: ['locale_map.*'],
        }),
      ).toEqual({ 'locale-map': { en_gb: { 'greeting-text': 'Hi' } } });
      expect(
        transform(input, { targetCase: 'pascal', exclude: ['*'] }),
      ).toEqual({ locale_map: { EnGb: { GreetingText: 'Hi' } } });
    });

    it('should treat an empty or null exclude like an omitted one', () => {
      expect(transform({ a_b: { c_d: 1 } }, { exclude: [] })).toEqual({
        aB: { cD: 1 },
      });
      expect(
        transform(
          { a_b: { c_d: 1 } },
          { exclude: null as unknown as string[] },
        ),
      ).toEqual({ aB: { cD: 1 } });
    });

    it('should reject an exclude that is not an array of paths', () => {
      const cases = [
        ['metadata.*', 'exclude "metadata.*"'],
        [{}, 'exclude [object Object]'],
        [[1], 'exclude path 1'],
        [['metadata..order_ref'], 'exclude path "metadata..order_ref"'],
        [[''], 'exclude path ""'],
      ] as const;
      for (const [exclude, description] of cases) {
        expect(() =>
          transform(
            { user_id: 1 },
            {
              exclude: exclude as unknown as string[],
            },
          ),
        ).toThrow(TypeError);
        expect(() =>
          transform(
            { user_id: 1 },
            {
              exclude: exclude as unknown as string[],
            },
          ),
        ).toThrow(`Unsupported ${description}. `);
      }
    });

    it('should reject an invalid exclude even when there is nothing to transform', () => {
      expect(() =>
        transform(1, { exclude: 'metadata.*' as unknown as string[] }),
      ).toThrow(TypeError);
    });
  });
});
