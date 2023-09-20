import {
  EnumValueExpression,
  Expression,
  JsonLiteralExpression,
  MemberAccessExpression,
} from "#shared";
import { Definitions } from "@initiativejs/schema";
import { AncestorOutputs } from "./node-outputs.js";

export function evaluateExpression(
  expr: Expression,
  definitions: Definitions,
  ancestorOutputs: AncestorOutputs,
): any {
  if (
    expr instanceof JsonLiteralExpression ||
    expr instanceof EnumValueExpression
  ) {
    return expr.value;
  }
  if (expr instanceof MemberAccessExpression) {
    let i = 0;
    return expr.selectors.reduce(
      (target, selector) => {
        if (selector.type === "property") return target[selector.propertyName];

        const args = expr.args
          .slice(i, (i += selector.memberType.parameters.length))
          .map((arg) =>
            arg
              ? evaluateExpression(arg, definitions, ancestorOutputs)
              : undefined,
          );
        switch (selector.type) {
          case "method":
            return target[selector.methodName](...args);
          case "call":
            return target(...args);
          case "extension-method":
            return selector.definition.function(target, ...args);
        }
      },
      expr.head.type === "scene-input"
        ? null!
        : ancestorOutputs[`${expr.head.nodeId}::${expr.head.outputName}`],
    );
  }
  throw new Error("Unreachable");
}
