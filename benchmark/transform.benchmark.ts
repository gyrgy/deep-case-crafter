import Benchmark, { Suite } from 'benchmark';
import transform from '../src/transform/transform';

const suite = new Benchmark.Suite();

// Generate deeply nested data
const generateNestedObject = (
  depth: number,
  width: number,
): Record<string, unknown> => {
  if (depth === 0) return { leaf_value: 1 };
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < width; i++) obj[`field_name_${i}`] = i;
  obj.child_node = generateNestedObject(depth - 1, width); // the recursion that was missing
  return obj;
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
