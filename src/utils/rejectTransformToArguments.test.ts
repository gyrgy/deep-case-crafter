import rejectTransformToArguments from './rejectTransformToArguments';

describe('rejectTransformToArguments', () => {
  it('should accept a target case and an options object, or no options', () => {
    for (const options of [
      undefined,
      null,
      {},
      { depth: 1 },
      { targetCase: undefined, keepReferences: false },
      { targetCase: null },
      Object.create(null),
    ]) {
      expect(() => rejectTransformToArguments('snake', options)).not.toThrow();
    }
  });

  it('should ignore a number in place of the options, as map passes the index', () => {
    expect(() => rejectTransformToArguments('snake', 0)).not.toThrow();
    expect(() => rejectTransformToArguments('camel', 1)).not.toThrow();
  });

  it('should leave other target cases to resolveTargetCase', () => {
    for (const targetCase of [undefined, null, '', 'SNAKE', 1, () => 'snake']) {
      expect(() =>
        rejectTransformToArguments(targetCase, undefined),
      ).not.toThrow();
    }
  });

  it('should reject an options object in place of the target case', () => {
    expect(() =>
      rejectTransformToArguments({ targetCase: 'snake', depth: 1 }, undefined),
    ).toThrow(
      new TypeError(
        'Unsupported targetCase [object Object]. Pass the target case first, then the options: transformTo("snake", { depth: 1 }).',
      ),
    );
    expect(() => rejectTransformToArguments(['snake'], undefined)).toThrow(
      'Unsupported targetCase [object Array].',
    );
  });

  it('should reject anything else in place of the options, and arrays', () => {
    const cases = [
      ['kebab', '"kebab"'],
      [true, 'true'],
      [() => ({ depth: 1 }), '[object Function]'],
      [['metadata.*'], '[object Array]'],
    ] as const;
    for (const [options, description] of cases) {
      expect(() => rejectTransformToArguments('snake', options)).toThrow(
        new TypeError(
          `Unsupported options ${description}. Use an options object, such as { depth: 1 }, after the target case: transformTo("snake", { depth: 1 }).`,
        ),
      );
    }
  });

  it('should reject a target case in the options', () => {
    expect(() =>
      rejectTransformToArguments('snake', { targetCase: 'kebab', depth: 1 }),
    ).toThrow(
      new TypeError(
        'Unsupported option targetCase "kebab". Pass the target case as the first argument of transformTo instead.',
      ),
    );
    expect(() =>
      rejectTransformToArguments('snake', { targetCase: '' }),
    ).toThrow('Unsupported option targetCase "".');
  });
});
