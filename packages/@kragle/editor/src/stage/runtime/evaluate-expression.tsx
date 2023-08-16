import { Definitions, ExpressionJson } from "@kragle/runtime";
import { AncestorOutputs } from "./node-outputs.js";

export function evaluateExpression(
  expression: ExpressionJson,
  definitions: Definitions,
  ancestorOutputs: AncestorOutputs,
): any {
  switch (expression.type) {
    case "string-literal":
    case "number-literal":
    case "boolean-literal":
      return expression.value;
    // case 'entity-literal':
    case "library-member":
      return definitions.getLibrary(expression.libraryName).members[
        expression.memberName
      ];
    case "node-output":
      return ancestorOutputs[`${expression.nodeId}::${expression.outputName}`];
    // case "scene-input":
    case "function-call":
      return evaluateExpression(
        expression.fn,
        definitions,
        ancestorOutputs,
      )(
        ...expression.args.map((arg) =>
          arg
            ? evaluateExpression(arg, definitions, ancestorOutputs)
            : undefined,
        ),
      );
    default:
      throw new Error("Unimplemented");
  }
}
