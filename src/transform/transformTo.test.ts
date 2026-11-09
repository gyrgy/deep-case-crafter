import transform from './transform';
import transformTo from './transformTo';
import { StringCase } from '../types/stringCaseTypes';
import { TransformToOptions } from '../types/transformOptionTypes';

/** `transformTo` as plain JavaScript callers see it: any arguments */
const transformToAny = transformTo as unknown as (
  ...args: unknown[]
) => (...args: unknown[]) => unknown;

describe('transformTo', () => {
  const input = {
    user_id: 1,
    firstName: 'Ann',
    user_info: {
      last_name: 'Lee',
      tag_list: [{ tag_id: 2 }],
      address_info: { zip_code: 'Z1' },
    },
    meta_map: new Map([['key_one', { value_one: 1 }]]),
    created_at: new Date(0),
  };

  it('should make a function that transforms as transform does with the same options', () => {
    const cases: [StringCase, TransformToOptions | undefined][] = [
      ['camel', undefined],
      ['snake', { depth: 1 }],
      ['kebab', { depth: 2, exclude: ['user_info.*'] }],
      ['pascal', { keepReferences: false }],
      ['constant', { exclude: ['meta_map.*', 'user_info.tag_list.tag_id'] }],
    ];
    for (const [targetCase, options] of cases) {
      expect(transformTo(targetCase, options)(input)).toEqual(
        transform(input, { targetCase, ...options }),
      );
    }
  });

  it('should use only its first argument, so that it can be passed as a callback', async () => {
    const toCamel = transformTo('camel');
    expect([{ user_id: 1 }, { first_name: 'a' }].map(toCamel)).toEqual([
      { userId: 1 },
      { firstName: 'a' },
    ]);
    // What lodash's mapValues passes: the value, its key and the object
    expect(transformToAny('snake')({ userId: 1 }, 'kebab', {})).toEqual({
      user_id: 1,
    });
    await expect(
      Promise.resolve({ user_id: 1 }).then(transformTo('kebab')),
    ).resolves.toEqual({ 'user-id': 1 });
  });

  it('should give every call a result of its own', () => {
    const toSnake = transformTo('snake');
    const data = { userId: 1, userInfo: { firstName: 'a' } };
    const first = toSnake(data);
    const second = toSnake(data);
    expect(second).toEqual({ user_id: 1, user_info: { first_name: 'a' } });
    expect(second).not.toBe(first);
    expect(second.user_info).not.toBe(first.user_info);
  });

  it('should keep shared references within a call, not across calls', () => {
    const toCamel = transformTo('camel');
    const shared = { first_name: 'a' };
    const result = toCamel({ a_a: shared, b_b: shared });
    expect(result.aA).toBe(result.bB);
    expect(toCamel({ a_a: shared }).aA).not.toBe(result.aA);
  });

  it('should read the options once, when the function is made', () => {
    const exclude = ['user_info.first_name'];
    const options: Record<string, unknown> = {
      depth: 3,
      exclude,
      keepReferences: false,
    };
    const toCamel = transformToAny('camel', options);
    exclude.push('user_id');
    Object.assign(options, {
      targetCase: 'kebab',
      depth: 'x',
      exclude: 'x',
      keepReferences: true,
    });
    const shared = { zip_code: 'z' };
    const result = toCamel({
      user_id: 1,
      user_info: { first_name: 'a', address_info: shared, home_info: shared },
    }) as { userInfo: { addressInfo: unknown; homeInfo: unknown } };
    expect(result).toEqual({
      userId: 1,
      userInfo: {
        first_name: 'a',
        addressInfo: { zipCode: 'z' },
        homeInfo: { zipCode: 'z' },
      },
    });
    expect(result.userInfo.addressInfo).not.toBe(result.userInfo.homeInfo);
  });

  it('should check the options when the function is made', () => {
    expect(() => transformToAny('SNAKE')).toThrow(
      new TypeError(
        'Unsupported targetCase "SNAKE". Use one of: camel, snake, pascal, kebab, constant.',
      ),
    );
    expect(() => transformToAny('snake', { depth: '1' })).toThrow(
      'Unsupported depth "1".',
    );
    expect(() => transformToAny('snake', { keepReferences: 'no' })).toThrow(
      'Unsupported keepReferences "no".',
    );
    expect(() => transformToAny('snake', { exclude: 'metadata.*' })).toThrow(
      'Unsupported exclude "metadata.*".',
    );
    expect(() => transformToAny('snake', { exclude: ['a.*', ''] })).toThrow(
      'Unsupported exclude path "".',
    );
    expect(() => transformToAny('snake', 'kebab')).toThrow(
      'Unsupported options "kebab".',
    );
    expect(() => transformToAny('snake', { targetCase: 'kebab' })).toThrow(
      'Unsupported option targetCase "kebab".',
    );
    expect(() => transformToAny({ targetCase: 'snake', depth: 1 })).toThrow(
      'Unsupported targetCase [object Object]. Pass the target case first, then the options',
    );
  });

  it('should check the arguments in order, and report the first problem', () => {
    expect(() => transformToAny('SNAKE', 'kebab')).toThrow(
      'Unsupported options "kebab".',
    );
    expect(() => transformToAny('SNAKE', { depth: '2' })).toThrow(
      'Unsupported targetCase "SNAKE".',
    );
    expect(() =>
      transformToAny('snake', { depth: '2', keepReferences: 'no' }),
    ).toThrow('Unsupported depth "2".');
    expect(() =>
      transformToAny('snake', { keepReferences: 'no', exclude: 'x' }),
    ).toThrow('Unsupported keepReferences "no".');
  });

  it('should take no options from the index that map passes when it is the callback itself', () => {
    const [toCamel, toSnake] = (['camel', 'snake'] as const).map(transformTo);
    expect(toCamel({ user_id: 1 })).toEqual({ userId: 1 });
    expect(toSnake({ userId: 1 })).toEqual({ user_id: 1 });
  });

  it('should use camelCase for an omitted or falsy target case, as transform does', () => {
    for (const targetCase of [undefined, null, '']) {
      expect(transformToAny(targetCase)({ user_id: 1 })).toEqual({
        userId: 1,
      });
    }
    expect(transformToAny()({ user_id: 1 })).toEqual({ userId: 1 });
  });

  it('should treat null options and null option values like omitted ones', () => {
    const shared = { k_k: 1 };
    const data = { a_a: shared, b_b: { c_c: shared } };
    const all = transformToAny('snake', {
      targetCase: null,
      depth: null,
      exclude: null,
      keepReferences: null,
    })(data) as { a_a: unknown; b_b: { c_c: unknown } };
    expect(all).toEqual(transform(data, { targetCase: 'snake' }));
    expect(all.b_b.c_c).toBe(all.a_a);
    expect(transformToAny('snake', null)(data)).toEqual(all);
  });

  it('should copy shared objects with keepReferences: false', () => {
    const shared = { k_k: 1 };
    const result = transformTo('camel', { keepReferences: false })({
      a_a: shared,
      b_b: shared,
    });
    expect(result.aA).toEqual({ kK: 1 });
    expect(result.aA).not.toBe(result.bB);
  });

  it('should start over with exclude paths and keepReferences: false', () => {
    const node: Record<string, unknown> = {
      node_id: 1,
      meta_data: { keep_me: 1 },
    };
    node.self_ref = node;
    const tracked = transform(node, { exclude: ['meta_data.*'] }) as Record<
      string,
      unknown
    >;
    const result = transformTo('camel', {
      exclude: ['meta_data.*'],
      keepReferences: false,
    })(node) as Record<string, unknown>;
    expect(result).toEqual(tracked);
    // Reached through self_ref, which no path continues into, the node gets the result
    // of the values no path reaches: one of its own, which points back to itself
    const plain = result.selfRef as Record<string, unknown>;
    expect(plain).toEqual({
      nodeId: 1,
      metaData: { keepMe: 1 },
      selfRef: plain,
    });
    expect(plain.selfRef).toBe(plain);
  });

  it('should start over with reference tables for circular data on every call with keepReferences: false', () => {
    const toCamel = transformTo('camel', { keepReferences: false });
    for (let i = 0; i < 2; i++) {
      const node: Record<string, unknown> = { node_id: i };
      node.self_ref = node;
      const result = toCamel(node) as Record<string, unknown>;
      expect(result).toMatchObject({ nodeId: i });
      expect(result.selfRef).toBe(result);
    }
  });

  it('should give every call exclude states of its own', () => {
    const toCamel = transformTo('camel', { exclude: ['meta_data.*'] });
    const shared = { k_k: 1 };
    const first = toCamel({ meta_data: { a_a: shared } });
    const second = toCamel({ meta_data: { a_a: shared, b_b: shared } });
    expect(first.metaData.a_a).toEqual({ kK: 1 });
    expect(second.metaData.a_a).toBe(second.metaData.b_b);
    expect(second.metaData.a_a).not.toBe(first.metaData.a_a);
  });

  it('should allow a call inside another one, from a getter', () => {
    const toSnake = transformTo('snake');
    const data = {
      get innerValue() {
        return toSnake({ innerKey: 1 });
      },
      outerKey: 2,
    };
    expect(toSnake(data)).toEqual({
      inner_value: { inner_key: 1 },
      outer_key: 2,
    });
  });

  it('should pass on errors thrown while transforming, without starting over', () => {
    for (const keepReferences of [true, false]) {
      let reads = 0;
      const data = {
        get flaky_value(): number {
          reads++;
          if (reads === 1) throw new Error('first read failed');
          return 1;
        },
      };
      expect(() => transformTo('snake', { keepReferences })(data)).toThrow(
        'first read failed',
      );
      expect(reads).toBe(1);
    }
  });
});
