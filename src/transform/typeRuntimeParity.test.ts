import evaluateKeyTypes from '../__test-utils__/evaluateKeyTypes';
import { PARITY_KEYS } from '../__test-utils__/keyCorpus';
import { STRING_CASES } from '../constants/stringCases';
import transform from './transform';

describe('type/runtime parity', () => {
  it('should type every transformed key exactly as the runtime transforms it', () => {
    const cases = STRING_CASES.flatMap((targetCase) =>
      PARITY_KEYS.map((key) => ({ key, targetCase })),
    );
    const typedKeys = evaluateKeyTypes(cases);

    const mismatches = cases
      .map(({ key, targetCase }, i) => ({
        key,
        targetCase,
        runtime: Object.keys(transform({ [key]: 0 }, { targetCase }))[0],
        type: typedKeys[i],
      }))
      .filter(({ runtime, type }) => runtime !== type);

    expect(cases.length).toBeGreaterThan(8000);
    expect(mismatches).toEqual([]);
  }, 120_000);
});
