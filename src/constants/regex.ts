export const SNAKE_ONLY_REGEX = /^[a-z0-9_]+$/;
export const SNAKE_CONSECUTIVE_UNDERSCORES_REGEX = /__+/;

export const CAMEL_ONLY_REGEX = /^[a-z][a-zA-Z0-9]*$/;

export const PASCAL_CASE_FULL_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

export const KEBAB_LOWER_NUMBERS_HYPHENS_REGEX = /^[a-z0-9-]+$/;
export const KEBAB_CONSECUTIVE_HYPHENS_REGEX = /-{2,}/;

export const HAS_UPPER_CASE_REGEX = /[A-Z]/;
export const HAS_LOWER_CASE_REGEX = /[a-z]/;
export const SINGLE_WORD_REGEX = /^[a-z0-9]+$/;

/** A UUID in canonical form: 8-4-4-4-12 hexadecimal digits, in either case */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A path of the `exclude` option: non-empty keys joined with dots */
export const EXCLUDE_PATH_REGEX = /^[^.]+(?:\.[^.]+)*$/;
