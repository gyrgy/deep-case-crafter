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

const smallObject = {
  user_id: 1,
  first_name: 'a',
  is_active: true,
  created_at: 'x',
  updated_at: 'y',
};

const wideObject: Record<string, number> = {};
for (let i = 0; i < 50; i++) wideObject[`field_name_${i}`] = i;

const arrayOfObjects = Array.from({ length: 50 }, (_, i) => ({
  post_id: i,
  post_title: 't',
  author_name: 'n',
}));

// A typical API list response: many records repeating the same keys
const apiList = Array.from({ length: 1000 }, (_, i) => ({
  user_id: i,
  first_name: 'a',
  last_name: 'b',
  email_address: 'e',
  is_active: true,
  created_at: 'x',
  updated_at: 'y',
  avatar_url: 'u',
  phone_number: 'p',
  postal_code: 'c',
  home_address: { street_name: 's', house_number: 1, city_name: 'c' },
  role_ids: [1, 2],
}));

const opts = { targetCase: 'camel' } as const;

// Benchmark a spread of realistic input shapes
suite
  .add('Deep object (depth 5, width 10)', () => {
    transform(deepObject, opts);
  })
  .add('Small flat object (5 keys)', () => {
    transform(smallObject, opts);
  })
  .add('Wide flat object (50 keys)', () => {
    transform(wideObject, opts);
  })
  .add('Array of 50 objects', () => {
    transform(arrayOfObjects, opts);
  })
  .add('API list (1000 records, 12 keys and a nested address each)', () => {
    transform(apiList, opts);
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
