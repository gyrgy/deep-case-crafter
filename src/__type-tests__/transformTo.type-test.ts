/**
 * Compile-time type tests for `transformTo` and the `TransformTo` type: the functions it
 * makes give the result types `transform` gives for the same options, also where they
 * are passed by name as callbacks. These calls are type-checked, never executed.
 */
import transform from '../transform/transform';
import transformTo from '../transform/transformTo';
import type { StringCase } from '../types/stringCaseTypes';
import type { TransformToOptions } from '../types/transformOptionTypes';
import type { TransformTo } from '../types/transformTypes';
import type { Equal, Expect } from './typeAssertions';

type Row = { user_id: number; created_at: Date; tag_list: readonly string[] };
type CamelRow = { userId: number; createdAt: Date; tagList: readonly string[] };

declare const row: Row;
declare const rows: Row[];
declare const fetchRow: () => Promise<Row>;

// Each target case, as transform gives it
const _snakeResult = transformTo('snake')({
  userID: 1,
  HTTPCode: { zipCode: 2 },
});
export type _snake = Expect<
  Equal<
    typeof _snakeResult,
    { user_id: number; http_code: { zip_code: number } }
  >
>;

const _constantResult = transformTo('constant')(row);
const _constantTransform = transform(row, { targetCase: 'constant' });
export type _constant = Expect<
  Equal<typeof _constantResult, typeof _constantTransform>
>;

// Passed by name, the data type is inferred where the function is called
const _mappedResult = rows.map(transformTo('camel'));
export type _mapped = Expect<Equal<typeof _mappedResult, CamelRow[]>>;

const _thenResult = fetchRow().then(transformTo('camel'));
export type _then = Expect<Equal<typeof _thenResult, Promise<CamelRow>>>;

const _fromResult = Array.from(new Set(rows), transformTo('camel'));
export type _from = Expect<Equal<typeof _fromResult, CamelRow[]>>;

const _flatResult = rows.flatMap(transformTo('camel'));
export type _flat = Expect<Equal<typeof _flatResult, CamelRow[]>>;

declare const tagged: Promise<{ tag_id: 1 }>;
const _allResult = Promise.all([fetchRow(), tagged]).then(transformTo('camel'));
export type _all = Expect<
  Equal<typeof _allResult, Promise<[CamelRow, { tagId: 1 }]>>
>;

// A callback that passes more arguments, such as lodash's mapValues
declare function mapValues<V, R>(
  object: Record<string, V>,
  iteratee: (value: V, key: string, object: Record<string, V>) => R,
): Record<string, R>;
const _mapValuesResult = mapValues({ a: row }, transformTo('camel'));
export type _mapValues = Expect<
  Equal<typeof _mapValuesResult, Record<string, CamelRow>>
>;

// An operator made before the data type is known, as in RxJS: `pipe(map(...))`
interface Stream<T> {
  pipe<R>(operator: (source: Stream<T>) => Stream<R>): Stream<R>;
}
declare function map<T, R>(
  project: (value: T, index: number) => R,
): (source: Stream<T>) => Stream<R>;
declare const stream: Stream<Row>;
const _pipeResult = stream.pipe(map(transformTo('camel')));
export type _pipe = Expect<Equal<typeof _pipeResult, Stream<CamelRow>>>;

// The options give the result types transform gives them
const nested = {
  user_info: { first_name: 'a', address_info: { zip_code: 'z' } },
};

const _depthResult = transformTo('kebab', { depth: 1 })(nested);
const _depthTransform = transform(nested, { targetCase: 'kebab', depth: 1 });
export type _depth = Expect<Equal<typeof _depthResult, typeof _depthTransform>>;
export type _depthShape = Expect<
  Equal<
    typeof _depthResult,
    { 'user-info': { first_name: string; address_info: { zip_code: string } } }
  >
>;

const _excludeResult = transformTo('camel', {
  exclude: ['user_info.first_name'],
  depth: 2,
  keepReferences: false,
})(nested);
export type _exclude = Expect<
  Equal<
    typeof _excludeResult,
    { userInfo: { first_name: string; addressInfo: { zip_code: string } } }
  >
>;

const paths = ['user_info.*'] as const;
const _storedPathsResult = transformTo('snake', { exclude: paths })(nested);
const _storedPathsTransform = transform(nested, {
  targetCase: 'snake',
  exclude: paths,
});
export type _storedPaths = Expect<
  Equal<typeof _storedPathsResult, typeof _storedPathsTransform>
>;

// What transform cannot know, transformTo cannot either: `unknown`
declare const someDepth: number;
const _numberDepthResult = transformTo('snake', { depth: someDepth })(nested);
export type _numberDepth = Expect<Equal<typeof _numberDepthResult, unknown>>;

declare const somePaths: string[];
const _stringPathsResult = transformTo('snake', { exclude: somePaths })(nested);
export type _stringPaths = Expect<Equal<typeof _stringPathsResult, unknown>>;

declare const maybeOptions: { depth: 1 } | undefined;
const _maybeOptionsResult = transformTo('snake', maybeOptions)(nested);
export type _maybeOptions = Expect<Equal<typeof _maybeOptionsResult, unknown>>;

declare const wideOptions: TransformToOptions;
const _wideOptionsResult = transformTo('snake', wideOptions)(nested);
export type _wideOptions = Expect<Equal<typeof _wideOptionsResult, unknown>>;

// A path with an empty key makes the function throw when it is made
const _emptyPathResult = transformTo('camel', { exclude: [''] })(nested);
export type _emptyPath = Expect<Equal<typeof _emptyPathResult, never>>;

// A union of target cases or of options objects: each gives its own result
declare const snakeOrKebab: 'snake' | 'kebab';
const _caseUnionResult = transformTo(snakeOrKebab)({ userId: 1 });
export type _caseUnion = Expect<
  Equal<typeof _caseUnionResult, { user_id: number } | { 'user-id': number }>
>;

declare const maybeSnake: 'snake' | undefined;
const _maybeCaseResult = transformTo(maybeSnake)({ userId: 1 });
export type _maybeCase = Expect<
  Equal<typeof _maybeCaseResult, { user_id: number } | { userId: number }>
>;

declare const someCase: StringCase;
const _someCaseResult = transformTo(someCase)({ userId: 1 });
const _someCaseTransform = transform({ userId: 1 }, { targetCase: someCase });
export type _someCase = Expect<
  Equal<typeof _someCaseResult, typeof _someCaseTransform>
>;

declare const unionOptions: { depth: 1 } | { exclude: ['user_info.*'] };
const _unionOptionsResult = transformTo('camel', unionOptions)(nested);
export type _unionOptions = Expect<
  Equal<
    typeof _unionOptionsResult,
    | { userInfo: { first_name: string; address_info: { zip_code: string } } }
    | { userInfo: { first_name: string; address_info: { zipCode: string } } }
  >
>;

// A member of a union whose targetCase is undefined keeps its result, as for transform
declare const undefinedCaseOptions:
  | { depth: 1 }
  | { targetCase: undefined; exclude: ['user_info.*'] };
const _undefinedCaseResult = transformTo('camel', undefinedCaseOptions)(nested);
export type _undefinedCase = Expect<
  Equal<
    typeof _undefinedCaseResult,
    | { userInfo: { first_name: string; address_info: { zip_code: string } } }
    | { userInfo: { first_name: string; address_info: { zipCode: string } } }
  >
>;

// Options typed any say nothing about the result
declare const anyOptions: any; // eslint-disable-line @typescript-eslint/no-explicit-any
const _anyOptionsResult = transformTo('snake', anyOptions)(nested);
export type _anyOptions = Expect<Equal<typeof _anyOptionsResult, unknown>>;

// `any` data stays `any`; `unknown` stays `unknown`
declare const anyData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
const _anyResult = transformTo('camel')(anyData);
export type _any = Expect<Equal<typeof _anyResult, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

declare const unknownData: unknown;
const _unknownResult = transformTo('camel')(unknownData);
export type _unknown = Expect<Equal<typeof _unknownResult, unknown>>;

// Generic code gets the result type transform gives it
export function snakeOf<T>(data: T) {
  return transformTo('snake')(data);
}
export function snakeOfTransform<T>(data: T) {
  return transform(data, { targetCase: 'snake' });
}
export type _generic = Expect<
  Equal<
    ReturnType<typeof snakeOf<Row>>,
    ReturnType<typeof snakeOfTransform<Row>>
  >
>;

export function converterTo<C extends StringCase>(targetCase: C) {
  return transformTo(targetCase);
}
const _converterResult = converterTo('pascal')({ user_id: 1 });
export type _converter = Expect<
  Equal<typeof _converterResult, { UserId: number }>
>;

// A parameter that takes any function made by transformTo
export function convertRow(convert: <T>(data: T) => unknown) {
  return convert(row);
}
convertRow(transformTo('snake'));
convertRow(transformTo('camel', { depth: 1 }));

export function convertRowTo<C extends StringCase>(convert: TransformTo<C>) {
  return convert(row);
}
const _convertRowToResult = convertRowTo(transformTo('kebab'));
const _convertRowToTransform = transform(row, { targetCase: 'kebab' });
export type _convertRowTo = Expect<
  Equal<typeof _convertRowToResult, typeof _convertRowToTransform>
>;

const madeForSnake = transformTo('snake');
export const anyCase: TransformTo<StringCase> = madeForSnake;
export const anyConverter: ReturnType<typeof transformTo> = transformTo(
  'kebab',
  {
    depth: 1,
  },
);
export function convertWithAny(convert: TransformTo<StringCase>) {
  return convert(row);
}
convertWithAny(madeForSnake);

// The type of the function, written out
export const toSnake: TransformTo<'snake'> = transformTo('snake');
export const toShallowCamel: TransformTo<'camel', { depth: 1 }> = transformTo(
  'camel',
  { depth: 1 },
);
const _annotatedResult = toShallowCamel(nested);
export type _annotated = Expect<
  Equal<
    typeof _annotatedResult,
    { userInfo: { first_name: string; address_info: { zip_code: string } } }
  >
>;

// Rejected: the target case in the options, unknown options, and what is not an options
// object or a target case
// @ts-expect-error The target case is the first argument
transformTo('snake', { targetCase: 'kebab' });
const storedOptions = { targetCase: 'kebab' as const, depth: 1 };
// @ts-expect-error Also in a stored options object
transformTo('snake', storedOptions);
// @ts-expect-error Unknown option name
transformTo('snake', { depht: 1 });
// @ts-expect-error The deprecated sourceCase has no place here
transformTo('snake', { sourceCase: 'camel' });
// @ts-expect-error Not an options object
transformTo('snake', 'kebab');
// @ts-expect-error The exclude paths go in an options object: { exclude: [...] }
transformTo('snake', ['metadata.*']);
// @ts-expect-error Not an options object either
transformTo('snake', () => ({ depth: 1 }));
declare const presets: { depth: 1 } | { targetCase: 'kebab'; depth: 2 };
// @ts-expect-error The target case is the first argument, in every member of a union too
transformTo('snake', presets);
// @ts-expect-error Not a target case
transformTo('SNAKE');
// @ts-expect-error The options object in place of the target case
transformTo({ targetCase: 'snake' });
// @ts-expect-error The target case is required
transformTo();
