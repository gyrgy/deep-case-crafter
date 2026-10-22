import evaluateKeyTypes from '../__test-utils__/evaluateKeyTypes';
import generateKeys from '../__test-utils__/generateKeys';
import { KEY_CORPUS } from '../__test-utils__/keyCorpus';
import { STRING_CASES } from '../constants/stringCases';
import transform from './transform';

const KEYS = [
  ...new Set([
    ...KEY_CORPUS,
    // Word boundaries, acronyms and plurals: lowercase, the letter s, uppercase, digit
    ...generateKeys(['a', 's', 'A', '1'], 5),
    // Separators and preserved keys
    ...generateKeys(['a', 'A', '1', '_', '-'], 4),
  ]),
];

describe('type/runtime parity', () => {
  it('should type every transformed key exactly as the runtime transforms it', () => {
    const cases = STRING_CASES.flatMap((targetCase) =>
      KEYS.map((key) => ({ key, targetCase })),
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
