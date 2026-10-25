import { runInNewContext } from 'node:vm';
import internalTransform from './internalTransform';
import transformKey from './transformKey';
import { TransformOptionsInternal } from '../types/transformOptionTypes';

jest.mock('./transformKey', () => {
  const actual = jest.requireActual('./transformKey');
  return { __esModule: true, default: jest.fn(actual.default) };
});

const transformKeyMock = transformKey as jest.MockedFunction<
  typeof transformKey
>;

type CircularObject = {
  selfRef?: CircularObject;
};

describe('internalTransform', () => {
  const options: TransformOptionsInternal = {
    targetCase: 'camel',
    depth: Infinity,
  };

  describe('collections', () => {
    it('should keep the order of array items and Set members', () => {
      expect(internalTransform([3, 1, 2], options)).toEqual([3, 1, 2]);
      expect([
        ...(internalTransform(new Set([3, 1, 2]), options) as Set<number>),
      ]).toEqual([3, 1, 2]);
    });

    it('should return new empty collections for empty input', () => {
      const array: unknown[] = [];
      const map = new Map();
      const set = new Set();
      expect(internalTransform(array, options)).toEqual([]);
      expect(internalTransform(array, options)).not.toBe(array);
      expect(internalTransform(map, options)).toEqual(new Map());
      expect(internalTransform(map, options)).not.toBe(map);
      expect(internalTransform(set, options)).toEqual(new Set());
      expect(internalTransform(set, options)).not.toBe(set);
    });

    it('should transform string Map keys and keep other keys as they are', () => {
      const objectKey = { id: 1 };
      const input = new Map<unknown, string>([
        ['snake_case', 'string key'],
        ['$user_id', 'special key'],
        [123, 'number key'],
        [objectKey, 'object key'],
      ]);
      const result = internalTransform(input, {
        ...options,
        targetCase: 'pascal',
      }) as Map<unknown, string>;
      expect([...result]).toEqual([
        ['SnakeCase', 'string key'],
        ['$user_id', 'special key'],
        [123, 'number key'],
        [objectKey, 'object key'],
      ]);
    });

    it('should convert Map keys without the key cache, and object keys with it', () => {
      transformKeyMock.mockClear();
      internalTransform(new Map([['user_id', 1]]), options);
      expect(transformKeyMock).not.toHaveBeenCalled();

      internalTransform({ user_id: 1 }, options);
      expect(transformKeyMock).toHaveBeenCalledWith('user_id', 'camel');
    });
  });

  it('should return primitive values as is', () => {
    expect(internalTransform(123, options)).toBe(123);
    expect(internalTransform('string', options)).toBe('string');
    expect(internalTransform(null, options)).toBeNull();
    expect(internalTransform(undefined, options)).toBeUndefined();
  });

  it('should handle arrays and recursively transform items', () => {
    const input = [{ key_value: 'value' }];
    const result = internalTransform(input, options);
    expect(result).toEqual([{ keyValue: 'value' }]);
  });

  it('should dispatch each array item by type (objects, Maps, Sets, primitives, nested arrays)', () => {
    const input = [
      { user_id: 1 },
      new Map<string, number>([['user_id', 2]]),
      new Set(['user_id', 'first_name']),
      'str',
      123,
      null,
      [{ a_b: 3 }],
    ];
    const result = internalTransform(input, options) as unknown[];

    expect(result[0]).toEqual({ userId: 1 });
    expect((result[1] as Map<string, number>).get('userId')).toBe(2);
    // Sets are copied and their primitive members left unchanged
    expect(result[2]).toBeInstanceOf(Set);
    expect([...(result[2] as Set<string>)]).toEqual(['user_id', 'first_name']);
    expect(result[3]).toBe('str');
    expect(result[4]).toBe(123);
    expect(result[5]).toBeNull();
    expect(result[6]).toEqual([{ aB: 3 }]);
  });

  it('should handle a self-referencing array without infinite recursion', () => {
    const arr: unknown[] = [{ key_value: 'v' }];
    arr.push(arr);
    const result = internalTransform(arr, options) as unknown[];
    expect(result[0]).toEqual({ keyValue: 'v' });
    expect(result[1]).toBe(result); // circular ref resolves to the result array
  });

  it('should handle maps and recursively transform values', () => {
    const map = new Map([['key_value', { nested_key: 'value' }]]);
    const result = internalTransform(map, options);
    expect(result).toEqual(new Map([['keyValue', { nestedKey: 'value' }]]));
  });

  it('should transform map keys but leave primitive values unchanged', () => {
    const map = new Map<string, unknown>([
      ['user_id', 1],
      ['first_name', 'John'],
      ['maybe_null', null],
    ]);
    const result = internalTransform(map, options);
    expect(result).toEqual(
      new Map<string, unknown>([
        ['userId', 1],
        ['firstName', 'John'],
        ['maybeNull', null],
      ]),
    );
  });

  it('should handle sets and recursively transform items', () => {
    const set = new Set([{ key_value: 'value' }, 123, 'string']);
    const result = internalTransform(set, options);
    expect(result).toEqual(new Set([{ keyValue: 'value' }, 123, 'string']));
  });

  it('should handle plain objects and recursively transform nested objects', () => {
    const input = { key_value: { nested_key: 'value' } };
    const result = internalTransform(input, options);
    expect(result).toEqual({ keyValue: { nestedKey: 'value' } });
  });

  describe('key/value objects', () => {
    it('should keep numeric keys and keys with special characters unchanged', () => {
      const input = { user_id: 1, 123: 'numeric', '&user_id': 2 };
      const result = internalTransform(input, {
        ...options,
        targetCase: 'pascal',
      });
      expect(result).toEqual({ UserId: 1, 123: 'numeric', '&user_id': 2 });
    });

    it('should copy symbol-keyed properties without transforming their values', () => {
      const sym = Symbol('meta');
      const meta = { meta_key: 1 };
      const result = internalTransform(
        { user_id: 1, [sym]: meta },
        options,
      ) as Record<PropertyKey, unknown>;
      expect(result.userId).toBe(1);
      expect(result[sym]).toBe(meta);
    });

    it('should transform own properties only, not inherited ones', () => {
      const input = Object.create({ proto_prop: 1 });
      input.own_prop = 2;
      expect(internalTransform(input, options)).toEqual({ ownProp: 2 });
    });

    it('should rebuild class instances and objects from another realm as plain objects', () => {
      class User {
        user_id = 1;
        greet() {
          return 'hi';
        }
      }
      const user = internalTransform(new User(), options);
      expect(user).toEqual({ userId: 1 });
      expect(Object.getPrototypeOf(user)).toBe(Object.prototype);

      const foreign = runInNewContext('({ user_id: 1 })');
      expect(internalTransform(foreign, options)).toEqual({ userId: 1 });
      expect(internalTransform(Object.create(null), options)).toEqual({});
    });

    it('should return objects that declare a Symbol.toStringTag untouched', () => {
      const money = { amount_cents: 1, [Symbol.toStringTag]: 'Money' };
      expect(internalTransform(money, options)).toBe(money);
    });

    it('should transform an object whose Symbol.toStringTag cannot be read', () => {
      // A "strict" proxy, which throws for unknown keys such as Symbol.toStringTag
      const strict = new Proxy(
        { user_id: 1 },
        {
          get(target, key) {
            if (!(key in target)) throw new Error(`Unknown key ${String(key)}`);
            return target[key as keyof typeof target];
          },
        },
      );
      expect(internalTransform(strict, options)).toEqual({ userId: 1 });
    });
  });

  it('should return objects that only inherit from Map.prototype or Set.prototype untouched', () => {
    const proxiedMap = new Proxy(new Map([['user_id', 1]]), {});
    const slotlessSet = Object.create(Set.prototype);
    expect(internalTransform(proxiedMap, options)).toBe(proxiedMap);
    expect(internalTransform(slotlessSet, options)).toBe(slotlessSet);
  });

  it('should return Dates, RegExps, typed arrays and other built-ins untouched', () => {
    const date = new Date('2024-01-02T03:04:05Z');
    const pattern = /ab+c/i;
    const bytes = new Uint8Array([1, 2, 3]);
    const error = new Error('boom');

    const result = internalTransform(
      {
        created_at: date,
        name_pattern: pattern,
        raw_bytes: bytes,
        last_error: error,
      },
      options,
    ) as Record<string, unknown>;

    expect(result.createdAt).toBe(date);
    expect(result.namePattern).toBe(pattern);
    expect(result.rawBytes).toBe(bytes);
    expect(result.lastError).toBe(error);
    expect(internalTransform(date, options)).toBe(date);
  });

  it('should respect the maximum depth limit', () => {
    const deepObject = { a_key: { b_key: { c_key: { d_key: 'value' } } } };
    const optionsWithDepth = { ...options, depth: 2 };

    const result = internalTransform(deepObject, optionsWithDepth);
    expect(result).toEqual({ aKey: { bKey: { c_key: { d_key: 'value' } } } });
  });

  it('should not copy enumerable properties added to Object.prototype into the result', () => {
    Object.defineProperty(Object.prototype, 'polluted_prop', {
      value: { nested_key: 1 },
      enumerable: true,
      configurable: true,
      writable: true,
    });

    try {
      const result = internalTransform({ own_prop: 1 }, options) as object;
      expect(Object.keys(result)).toEqual(['ownProp']);
    } finally {
      delete (Object.prototype as Record<string, unknown>).polluted_prop;
    }
  });

  it('should apply the depth limit to an object referenced from several levels', () => {
    type Result = { userInfo: { workAddr: unknown } };
    const addr = { street_name: 'x' };
    const limited = { ...options, depth: 2 };

    const first = internalTransform(
      { home_addr: addr, user_info: { work_addr: addr } },
      limited,
    ) as Result;
    const swapped = internalTransform(
      { user_info: { work_addr: addr }, home_addr: addr },
      limited,
    );

    const expected = {
      homeAddr: { streetName: 'x' },
      userInfo: { workAddr: { street_name: 'x' } },
    };
    expect(first).toEqual(expected);
    expect(swapped).toEqual(expected); // the key order does not matter
    expect(first.userInfo.workAddr).toBe(addr); // below the limit: shared, not copied
  });

  it('should transform an object reached at two levels once per level', () => {
    const shared = { a_b: { c_d: 1 } };
    const result = internalTransform(
      { x_x: shared, y_y: { z_z: shared } },
      { ...options, depth: 3 },
    );
    expect(result).toEqual({
      xX: { aB: { cD: 1 } },
      yY: { zZ: { aB: { c_d: 1 } } },
    });
  });

  it('should stop a circular reference at the depth limit', () => {
    type Node = { nodeName: string; selfRef: Node };
    const node: Record<string, unknown> = { node_name: 'n' };
    node.self_ref = node;

    const result = internalTransform(node, { ...options, depth: 2 }) as Node;

    expect(result.nodeName).toBe('n');
    expect(result.selfRef.nodeName).toBe('n');
    expect(result.selfRef.selfRef).toBe(node);
  });

  it('should reuse the transformed object for shared references without a depth limit', () => {
    type Result = { aA: unknown; bB: { cC: unknown } };
    const addr = { street_name: 'x' };
    const result = internalTransform(
      { a_a: addr, b_b: { c_c: addr } },
      options,
    ) as Result;
    expect(result.aA).toEqual({ streetName: 'x' });
    expect(result.bB.cC).toBe(result.aA);
  });

  it('should handle circular references in Maps and Sets', () => {
    const map = new Map<string, unknown>([['user_id', 1]]);
    map.set('self_ref', map);
    const set = new Set<unknown>([{ key_value: 1 }]);
    set.add(set);

    const mapResult = internalTransform(map, options) as Map<string, unknown>;
    const setResult = internalTransform(set, options) as Set<unknown>;

    expect(mapResult.get('selfRef')).toBe(mapResult);
    expect(setResult.has(setResult)).toBe(true);
  });

  it('should handle circular references', () => {
    const obj: CircularObject = {};
    obj.selfRef = obj;

    const result = internalTransform(obj, options) as CircularObject;
    expect(result).toEqual({ selfRef: expect.any(Object) });
    expect(result.selfRef).toBe(result);
  });
});
