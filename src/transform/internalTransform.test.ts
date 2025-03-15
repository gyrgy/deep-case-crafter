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

  it('should handle maps and recursively transform values', () => {
    const map = new Map([['key_value', { nested_key: 'value' }]]);
    const result = internalTransform(map, options);
    expect(result).toEqual(new Map([['keyValue', { nestedKey: 'value' }]]));
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
