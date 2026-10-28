import type * as ReferenceTables from './referenceTables';

/**
 * A fresh copy of the module (no table has filled up yet) whose tables hold at most
 * `limit` entries
 */
function load(limit: number): typeof ReferenceTables {
  let loaded: typeof ReferenceTables | undefined;
  jest.isolateModules(() => {
    jest.doMock('../constants/referenceTables', () => ({
      ...jest.requireActual('../constants/referenceTables'),
      REFERENCE_TABLE_LIMIT: limit,
    }));
    loaded = jest.requireActual<typeof ReferenceTables>('./referenceTables');
  });
  return loaded as typeof ReferenceTables;
}

describe('referenceTables', () => {
  it('should find the results recorded in a table', () => {
    const { findReference, recordReference } = load(10);
    const tables: ReferenceTables.ReferenceTable[] = [new Map()];
    const source = {};
    const result = {};

    expect(findReference(tables[0], source)).toBeUndefined();
    recordReference(tables, 0, source, result);
    expect(findReference(tables[0], source)).toBe(result);
    expect(findReference(tables[0], {})).toBeUndefined();
  });

  it('should chain a full table behind a new one, and find results in all of them', () => {
    const { findReference, recordReference } = load(2);
    const tables: ReferenceTables.ReferenceTable[] = [new Map(), new Map()];
    const sources = Array.from({ length: 6 }, () => ({}));
    const results = sources.map(() => ({}));
    sources.forEach((source, i) =>
      recordReference(tables, 1, source, results[i]),
    );

    // The first table is replaced, not filled further; the other level is untouched
    expect(tables[1].size).toBeLessThanOrEqual(2);
    expect(tables[0].size).toBe(0);
    sources.forEach((source, i) => {
      expect(findReference(tables[1], source)).toBe(results[i]);
    });
    expect(findReference(tables[1], {})).toBeUndefined();
    expect(findReference(tables[0], sources[0])).toBeUndefined();
  });
});
