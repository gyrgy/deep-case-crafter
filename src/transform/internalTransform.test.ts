import internalTransform from './internalTransform';
import { TransformOptionsInternal } from '../types/transformOptionTypes';

type CircularObject = {
  selfRef?: CircularObject;
};

describe('internalTransform', () => {
  const options: TransformOptionsInternal = { targetCase: 'camel' };

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

  it('should respect the maximum depth limit', () => {
    const deepObject = { a_key: { b_key: { c_key: { d_key: 'value' } } } };
    const optionsWithDepth = { ...options, depth: 2 };

    const result = internalTransform(deepObject, optionsWithDepth);
    expect(result).toEqual({ aKey: { bKey: { c_key: { d_key: 'value' } } } });
  });

  it('should handle circular references', () => {
    const obj: CircularObject = {};
    obj.selfRef = obj;

    const result = internalTransform(obj, options) as CircularObject;
    expect(result).toEqual({ selfRef: expect.any(Object) });
    expect(result.selfRef).toBe(result);
  });
});
