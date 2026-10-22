import ts from 'typescript';

/**
 * Formats a key type for the type/runtime parity test: a string literal as its value,
 * and anything else (`string`, `never`, a union) as `<type>`, so a key type that is not a
 * single literal can never equal a key the runtime returns.
 *
 * @example
 * ```typescript
 * formatKeyType(checker, checker.getStringLiteralType('user_id')) // => 'user_id'
 * formatKeyType(checker, checker.getStringType()) // => '<string>'
 * ```
 */
export default function formatKeyType(
  checker: ts.TypeChecker,
  type: ts.Type,
): string {
  return type.isStringLiteral()
    ? type.value
    : `<${checker.typeToString(type)}>`;
}
