import { StringCase } from '../types/stringCaseTypes';
import camelToKebabCase from '../utils/stringFormatters/camelToKebabCase';
import camelToPascalCase from '../utils/stringFormatters/camelToPascalCase';
import camelToSnakeCase from '../utils/stringFormatters/camelToSnakeCase';
import kebabToCamelCase from '../utils/stringFormatters/kebabToCamelCase';
import kebabToPascalCase from '../utils/stringFormatters/kebabToPascalCase';
import kebabToSnakeCase from '../utils/stringFormatters/kebabToSnakeCase';
import pascalToCamelCase from '../utils/stringFormatters/pascalToCamelCase';
import pascalToKebabCase from '../utils/stringFormatters/pascalToKebabCase';
import pascalToSnakeCase from '../utils/stringFormatters/pascalToSnakeCase';
import snakeToCamelCase from '../utils/stringFormatters/snakeToCamelCase';
import snakeToKebabCase from '../utils/stringFormatters/snakeToKebabCase';
import snakeToPascalCase from '../utils/stringFormatters/snakeToPascalCase';

/**
 * A mapping of transformation functions for converting strings between different case formats.
 *
 * Each key of this mapping represents the detected source case (e.g., 'snake', 'camel', 'pascal', 'kebab').
 * The corresponding value is an object that maps target case formats to the appropriate transformation function.
 *
 * Each transformation function accepts a string (`str`) that is to be transformed.
 *
 * For instance:
 * - `formatterMap.snake.camel` converts a snake_case string to camelCase.
 * - If the source and target cases are the same (e.g., `formatterMap.snake.snake`), an identity function is provided.
 *
 * @type {Record<StringCase, Record<StringCase, (str: string) => string>>}
 */
const formatterMap: {
  [source in StringCase]: {
    [target in StringCase]: (str: string) => string;
  };
} = {
  snake: {
    camel: snakeToCamelCase,
    pascal: snakeToPascalCase,
    kebab: snakeToKebabCase,
    snake: (s) => s,
  },
  camel: {
    snake: camelToSnakeCase,
    pascal: camelToPascalCase,
    kebab: camelToKebabCase,
    camel: (s) => s,
  },
  pascal: {
    snake: pascalToSnakeCase,
    camel: pascalToCamelCase,
    kebab: pascalToKebabCase,
    pascal: (s) => s,
  },
  kebab: {
    snake: kebabToSnakeCase,
    camel: kebabToCamelCase,
    pascal: kebabToPascalCase,
    kebab: (s) => s,
  },
};

export default formatterMap;
