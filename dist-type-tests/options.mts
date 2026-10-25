/**
 * Result types for options that are not plain literals: enum members, branded values,
 * unions of options objects and stored options objects.
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import { transform, type TransformOptions } from 'deep-case-crafter';
import type { Equal, Expect } from './typeAssertions.js';

enum KeyCase {
  Camel = 'camel',
  Snake = 'snake',
  Kebab = 'kebab',
  Pascal = 'pascal',
}

type Brand<T, B> = T & { readonly __brand: B };

const input = {
  user_id: 1,
  lastName: 'y',
  homeAddr: { zipCode: 'z', post_box: 1 },
};

type Camel = {
  userId: number;
  lastName: string;
  homeAddr: { zipCode: string; postBox: number };
};
type Snake = {
  user_id: number;
  last_name: string;
  home_addr: { zip_code: string; post_box: number };
};
type Kebab = {
  'user-id': number;
  'last-name': string;
  'home-addr': { 'zip-code': string; 'post-box': number };
};
type Pascal = {
  UserId: number;
  LastName: string;
  HomeAddr: { ZipCode: string; PostBox: number };
};
type CamelDepth1 = {
  userId: number;
  lastName: string;
  homeAddr: { zipCode: string; post_box: number };
};
type KebabDepth1 = {
  'user-id': number;
  'last-name': string;
  'home-addr': { zipCode: string; post_box: number };
};

// A string enum member is the case it stands for
const _enumSnakeValue = transform(input, { targetCase: KeyCase.Snake });
export type _enumSnake = Expect<Equal<typeof _enumSnakeValue, Snake>>;

const _enumKebabValue = transform(input, { targetCase: KeyCase.Kebab });
export type _enumKebab = Expect<Equal<typeof _enumKebabValue, Kebab>>;

// A stored enum member widens to the whole enum: any of the four results
const enumOptions = { targetCase: KeyCase.Snake };
const _enumWideValue = transform(input, enumOptions);
export type _enumWide = Expect<
  Equal<typeof _enumWideValue, Camel | Snake | Kebab | Pascal>
>;

// Each member of a union of options objects keeps its own targetCase and depth
declare const unionOptions:
  | { targetCase: 'snake' }
  | { targetCase: 'kebab'; depth: 1 };
const _unionValue = transform(input, unionOptions);
export type _union = Expect<Equal<typeof _unionValue, Snake | KebabDepth1>>;

// The same for options picked from a config map by a key that may be either one
const presets = { api: { targetCase: 'snake' }, ui: { depth: 1 } } as const;
declare const preset: keyof typeof presets;
const _presetValue = transform(input, presets[preset]);
export type _preset = Expect<Equal<typeof _presetValue, Snake | CamelDepth1>>;

// A stored options object with both targetCase and depth, like the same object inline
const storedOptions = { targetCase: 'kebab', depth: 1 } as const;
const _storedValue = transform(input, storedOptions);
export type _stored = Expect<Equal<typeof _storedValue, KebabDepth1>>;

// Branded values are the literals they brand
declare const brandedCase: Brand<'snake', 'KeyCase'>;
const _brandedCaseValue = transform(input, { targetCase: brandedCase });
export type _brandedCase = Expect<Equal<typeof _brandedCaseValue, Snake>>;

declare const brandedDepth: Brand<1, 'Depth'>;
const _brandedDepthValue = transform(input, { depth: brandedDepth });
export type _brandedDepth = Expect<
  Equal<typeof _brandedDepthValue, CamelDepth1>
>;

// The deprecated sourceCase still compiles, also from an enum
const _enumSourceValue = transform(input, {
  sourceCase: KeyCase.Snake,
  targetCase: 'camel',
});
export type _enumSource = Expect<Equal<typeof _enumSourceValue, Camel>>;

// The 2.x form with explicit <Data, SourceCase, TargetCase> type arguments
const _explicitValue = transform<typeof input, 'snake', 'camel'>(input, {
  sourceCase: 'snake',
  targetCase: 'camel',
});
export type _explicit = Expect<Equal<typeof _explicitValue, Camel>>;

// ...which does not accept depth
transform<typeof input, 'snake', 'camel'>(input, {
  sourceCase: 'snake',
  targetCase: 'camel',
  // @ts-expect-error depth needs the inferred form (no type arguments)
  depth: 1,
});

// The last overload, which Parameters<> and error messages read, is the explicit output
// type form (not the deprecated 2.x form), so its options leave out sourceCase
export type _lastOverloadOptions = Expect<
  Equal<
    Parameters<typeof transform>[1],
    Omit<TransformOptions, 'sourceCase'> | undefined
  >
>;

// An optional depth may be omitted: either result
declare const optionalDepth: { targetCase: 'kebab'; depth?: 1 };
const _optionalDepthValue = transform(input, optionalDepth);
export type _optionalDepth = Expect<
  Equal<typeof _optionalDepthValue, Kebab | KebabDepth1>
>;

// Options typed any, or a depth only known as a (branded) number, say nothing about the
// result
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const anyOptions: any;
const _anyOptionsValue = transform(input, anyOptions);
export type _anyOptions = Expect<Equal<typeof _anyOptionsValue, unknown>>;

declare const brandedNumber: Brand<number, 'Depth'>;
const _brandedNumberValue = transform(input, { depth: brandedNumber });
export type _brandedNumber = Expect<Equal<typeof _brandedNumberValue, unknown>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const someAnyTarget: { targetCase: any } | { depth: 1 };
const _someAnyTargetValue = transform(input, someAnyTarget);
export type _someAnyTarget = Expect<Equal<typeof _someAnyTargetValue, unknown>>;
