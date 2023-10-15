import { Expression, NamedArgument, Pattern } from "@fluent/bundle/esm/ast.js";

export function encodeFtl(id: string, message: string): string {
  const lines = message.split("\n");
  const result =
    lines.length === 1
      ? [`${id} = ${message}`]
      : [
          `${id} =`,
          ...lines
            .map((l) => l.replaceAll(escapePattern, (m) => `{"${m[0]}"}`))
            .map((l) => `  ${l}`),
        ];
  return (id.startsWith(".") ? result.map((l) => `  ${l}`) : result).join("\n");
}

const escapePattern = /(?<=^ *)[[*.]|[{}]/g;

export function resolveFluentVariables(
  pattern: Pattern,
  variables: Set<string>,
) {
  function visitPattern(pattern: Pattern) {
    if (typeof pattern === "string") return;
    for (const element of pattern) {
      if (typeof element !== "string") visitExpression(element);
    }
  }

  function visitExpression(expression: Expression | NamedArgument) {
    switch (expression.type) {
      case "func":
      case "term":
        for (const arg of expression.args) {
          visitExpression(arg);
        }
        break;
      case "select":
        visitExpression(expression.selector);
        for (const variant of expression.variants) {
          visitPattern(variant.value);
        }
        break;
      case "var":
        variables.add(expression.name);
        break;
    }
  }

  visitPattern(pattern);
}
