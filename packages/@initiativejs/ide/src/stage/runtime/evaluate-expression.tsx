import {
  EnumValueExpression,
  Expression,
  JsonLiteralExpression,
  MemberAccessExpression,
} from "#shared";
import { Definitions } from "@initiativejs/schema";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { AncestorOutputs } from "./ancestor-outputs.js";

export function evaluateExpression(
  expr: Expression,
  definitions: Definitions,
  debugValues: ObjectMap<any> | null,
  ancestorOutputs: AncestorOutputs | null,
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
              ? evaluateExpression(
                  arg,
                  definitions,
                  debugValues,
                  ancestorOutputs,
                )
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
        ? ancestorOutputs!.getSceneInput(expr.head.inputName)
        : expr.head.type === "node-output"
        ? ancestorOutputs!.getNodeOutput(expr.head.nodeId, expr.head.outputName)
        : debugValues![expr.head.debugValueName],
    );
  }
  throw new Error("Unreachable");
}
