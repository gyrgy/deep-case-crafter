import Benchmark, { Suite } from 'benchmark';
import transform from '../src/transform/transform';

const suite = new Benchmark.Suite();

// Generate deeply nested data
const generateNestedObject = (depth: number, width: number): object => {
  if (depth === 0) return { key: 'value' };

  return Array.from({ length: width }).reduce<Record<string, number>>(
    (acc, _, index) => {
      acc[`key${index}`] = index;
      return acc;
    },
    {}, // Initial value explicitly typed as an empty object
  );
};

const deepObject = generateNestedObject(5, 10); // 5 levels deep, 10 keys at each level

// Benchmark transform with different depths
suite
  .add('Transform Deep Object (Depth 5, Width 10)', () => {
    transform(deepObject, {
      targetCase: 'camel',
      sourceCase: 'snake',
      depth: Infinity,
    });
  })
  .on('cycle', (event: Benchmark.Event) => {
    // eslint-disable-next-line no-console
    console.log(String(event.target));
  })
  .on('complete', function (this: Suite) {
    // eslint-disable-next-line no-console
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
