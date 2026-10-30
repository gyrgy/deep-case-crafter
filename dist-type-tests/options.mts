/**
 * Result types for options that are not plain literals: enum members, branded values,
 * unions of options objects and stored options objects.
 * Run with `npm run test:dist-types` after `npm run build`.
 */
import {
  transform,
  transformKey,
  type TransformOptions,
} from 'deep-case-crafter';
import type { Equal, Expect } from './typeAssertions.js';

enum KeyCase {
  Camel = 'camel',
  Snake = 'snake',
  Kebab = 'kebab',
  Pascal = 'pascal',
  Constant = 'constant',
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
type Constant = {
  USER_ID: number;
  LAST_NAME: string;
  HOME_ADDR: { ZIP_CODE: string; POST_BOX: number };
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

const _enumConstantValue = transform(input, { targetCase: KeyCase.Constant });
export type _enumConstant = Expect<Equal<typeof _enumConstantValue, Constant>>;

// A stored enum member widens to the whole enum: any of its results
const enumOptions = { targetCase: KeyCase.Snake };
const _enumWideValue = transform(input, enumOptions);
export type _enumWide = Expect<
  Equal<typeof _enumWideValue, Camel | Snake | Kebab | Pascal | Constant>
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

// Each member of a union of options objects keeps its own exclude paths
declare const excludeOptions:
  | { exclude: readonly ['homeAddr.*'] }
  | { targetCase: 'snake'; exclude: readonly ['user_id', 'homeAddr.post_box'] }
  | { depth: 1 };
const _excludeUnionValue = transform(input, excludeOptions);
export type _excludeUnion = Expect<
  Equal<
    typeof _excludeUnionValue,
    | {
        userId: number;
        lastName: string;
        homeAddr: { zipCode: string; post_box: number };
      }
    | {
        user_id: number;
        last_name: string;
        home_addr: { zip_code: string; post_box: number };
      }
    | CamelDepth1
  >
>;

// Stored paths are known `as const`, and unknown as a string[]
const storedExclude = { exclude: ['homeAddr.*'] } as const;
const _storedExcludeValue = transform(input, storedExclude);
export type _storedExclude = Expect<
  Equal<
    typeof _storedExcludeValue,
    {
      userId: number;
      lastName: string;
      homeAddr: { zipCode: string; post_box: number };
    }
  >
>;

declare const somePaths: string[];
const _somePathsValue = transform(input, { exclude: somePaths });
export type _somePaths = Expect<Equal<typeof _somePathsValue, unknown>>;

// The 2.x form with explicit type arguments does not accept exclude either
transform<typeof input, 'snake', 'camel'>(input, {
  sourceCase: 'snake',
  targetCase: 'camel',
  // @ts-expect-error exclude needs the inferred form (no type arguments)
  exclude: ['homeAddr.*'],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const someAnyTarget: { targetCase: any } | { depth: 1 };
const _someAnyTargetValue = transform(input, someAnyTarget);
export type _someAnyTarget = Expect<Equal<typeof _someAnyTargetValue, unknown>>;

// transformKey takes the same kinds of options
const _keyEnumValue = transformKey('userId', { targetCase: KeyCase.Snake });
export type _keyEnum = Expect<Equal<typeof _keyEnumValue, 'user_id'>>;

const _keyBrandedValue = transformKey('userId', { targetCase: brandedCase });
export type _keyBranded = Expect<Equal<typeof _keyBrandedValue, 'user_id'>>;

const _keyEnumWideValue = transformKey('userId', enumOptions);
export type _keyEnumWide = Expect<
  Equal<
    typeof _keyEnumWideValue,
    'userId' | 'user_id' | 'user-id' | 'UserId' | 'USER_ID'
  >
>;

const keyPresets = { api: { targetCase: 'snake' }, ui: {} } as const;
declare const keyPreset: keyof typeof keyPresets;
const _keyPresetValue = transformKey('userId', keyPresets[keyPreset]);
export type _keyPreset = Expect<
  Equal<typeof _keyPresetValue, 'user_id' | 'userId'>
>;

// The presets of transform above include one with only a depth, which transformKey
// does not take
// @ts-expect-error { depth: 1 } shares no option with transformKey
transformKey('userId', presets[preset]);

declare const keyUnionOptions:
  | { targetCase: 'snake' }
  | { targetCase: 'kebab' };
const _keyUnionOptionsValue = transformKey('userId', keyUnionOptions);
export type _keyUnionOptions = Expect<
  Equal<typeof _keyUnionOptionsValue, 'user_id' | 'user-id'>
>;
