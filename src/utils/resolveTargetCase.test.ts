import resolveTargetCase from './resolveTargetCase';

describe('resolveTargetCase', () => {
  it('should return a supported case', () => {
    expect(resolveTargetCase('camel')).toBe('camel');
    expect(resolveTargetCase('snake')).toBe('snake');
    expect(resolveTargetCase('pascal')).toBe('pascal');
    expect(resolveTargetCase('kebab')).toBe('kebab');
    expect(resolveTargetCase('constant')).toBe('constant');
  });

  it('should use camel for an omitted or falsy target case', () => {
    for (const targetCase of [undefined, null, '', 0, false]) {
      expect(resolveTargetCase(targetCase)).toBe('camel');
    }
  });

  it('should reject any other value', () => {
    expect(() => resolveTargetCase('SNAKE')).toThrow(
      new TypeError(
        'Unsupported targetCase "SNAKE". Use one of: camel, snake, pascal, kebab, constant.',
      ),
    );
    expect(() => resolveTargetCase('toString')).toThrow(TypeError);
    expect(() => resolveTargetCase({})).toThrow(
      'Unsupported targetCase [object Object].',
    );
  });
});
