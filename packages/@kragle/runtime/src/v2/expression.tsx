/**
 * Expression serialization format.
 */
export type ExpressionJson =
  | StringLiteralExpressionJson
  | NumberLiteralExpressionJson
  | BooleanLiteralExpressionJson
  | EntityLiteralExpressionJson
  | NodeLinkExpressionJson
  | SceneLinkExpressionJson
  | NamespaceMemberExpressionJson
  | FunctionCallExpressionJson;

export interface StringLiteralExpressionJson {
  readonly type: "string-literal";
  readonly value: string;
}

// export interface MultilineStringLiteralExpressionJson {
//   readonly type: "multiline-string-literal";
//   readonly value: string;
// }

export interface NumberLiteralExpressionJson {
  readonly type: "number-literal";
  readonly value: number;
}

export interface BooleanLiteralExpressionJson {
  readonly type: "boolean-literal";
  readonly value: boolean;
}

export interface EntityLiteralExpressionJson {
  readonly type: "entity-literal";
  readonly entityName: string;
  readonly value: unknown;
}

export interface NodeLinkExpressionJson {
  readonly type: "node-link";
  readonly nodeId: string;
  readonly outputName: string;
}

export interface SceneLinkExpressionJson {
  readonly type: "scene-link";
  readonly inputName: string;
}

export interface NamespaceMemberExpressionJson {
  readonly type: "namespace-member";
  readonly namespaceName: string;
  readonly memberName: string;
}

export interface FunctionCallExpressionJson {
  readonly type: "function-call";
  readonly function: ExpressionJson;
  readonly parameters: readonly ExpressionJson[];
}

export function rebuild(
  root: ExpressionJson,
  newExpression: ExpressionJson,
  path: readonly number[]
): ExpressionJson {
  if (path.length === 0) {
    return newExpression;
  }
  if (root.type !== "function-call") {
    throw new Error(
      `Invalid path: Expression of type '${root.type}' has no children.`
    );
  }

  const [head, ...tail] = path;
  if (head === 0) {
    return { ...root, function: rebuild(root.function, newExpression, tail) };
  }
  const parameters = [...root.parameters];
  parameters[head] = rebuild(root.parameters[head], newExpression, tail);
  return { ...root, parameters };
}

export function toString(
  expression: ExpressionJson
  // , indent = false
): string {
  switch (expression.type) {
    case "string-literal":
      return `"${expression.value.replaceAll(/["\\]/g, (m) => `\\${m}`)}"`;
    case "number-literal":
    case "boolean-literal":
      return `${expression.value}`;
    case "entity-literal":
      return expression.entityName;
    case "node-link":
      return `${expression.nodeId}::${expression.outputName}`;
    case "scene-link":
      return `Scene::${expression.inputName}`;
    case "namespace-member":
      return `${expression.namespaceName}::${expression.memberName}`;
    case "function-call":
      const parameters = expression.parameters
        .map((p) => toString(p))
        .join(", ");
      return `${toString(expression.function)}(${parameters})`;
    default:
      throw new Error("Unimplemented");
  }
}
