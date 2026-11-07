import rejectStringOptions from './rejectStringOptions';

describe('rejectStringOptions', () => {
  it('should reject a target case, naming the options object to use instead', () => {
    expect(() => rejectStringOptions('snake')).toThrow(
      new TypeError(
        'Unsupported options "snake". Use an options object: { targetCase: "snake" }.',
      ),
    );
  });

  it('should reject any other string, such as a key a callback passes', () => {
    for (const options of ['first_user', 'SNAKE', '']) {
      expect(() => rejectStringOptions(options)).toThrow(
        new TypeError(
          `Unsupported options ${JSON.stringify(options)}. Use an options object, such as { targetCase: "snake" }. To pass the function as a callback, wrap it so that it gets only its first argument.`,
        ),
      );
    }
  });

  it('should accept options objects and ignore other values', () => {
    for (const options of [
      undefined,
      null,
      {},
      { targetCase: 'snake' },
      0,
      3,
      true,
      [],
    ]) {
      expect(() => rejectStringOptions(options)).not.toThrow();
    }
  });
});
