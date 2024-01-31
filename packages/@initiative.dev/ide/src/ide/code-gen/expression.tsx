import { dedent } from "@pschiffmann/std/dedent";

import {
  EnumValueExpression,
  Expression,
  FluentMessageExpression,
  JsonLiteralExpression,
  MemberAccessExpression,
} from "#shared";
import {
  getNodeOutputContextName,
  getSceneInputContextName,
} from "./context.js";
import { NameResolver } from "./name-resolver.js";

export function generateExpression(
  nodeId: string,
  fluentExpressionKey: string,
  expression: Expression,
  nameResolver: NameResolver,
): string {
  if (
    expression instanceof JsonLiteralExpression ||
    expression instanceof EnumValueExpression
  ) {
    return JSON.stringify(expression.value);
  }
  if (expression instanceof FluentMessageExpression) {
    const useContext = nameResolver.importBinding({
      moduleName: "react",
      exportName: "useContext",
    });
    const translateMessage = nameResolver.declareName("translateMessage");
    const FluentBundleContext = nameResolver.declareName("FluentBundleContext");
    return dedent`
      ${translateMessage}(
        ${useContext}(${FluentBundleContext}),
        "${nodeId}",
        "${fluentExpressionKey}",
        {
          ${Object.entries(expression.args)
            .map(([argName, expr]) => {
              const value = generateExpression(
                nodeId,
                `${fluentExpressionKey}-${argName}`,
                expr!,
                nameResolver,
              );
              return `"${argName}": ${value},`;
            })
            .join("\n")}
        }
      )
      `;
  }
  if (expression instanceof MemberAccessExpression) {
    const useContext = nameResolver.importBinding({
      moduleName: "react",
      exportName: "useContext",
    });
    let head: string;
    switch (expression.head.type) {
      case "scene-input": {
        const contextName = getSceneInputContextName(
          nameResolver,
          expression.head.inputName,
        );
        head = `${useContext}(${contextName})`;
        break;
      }
      case "node-output": {
        const contextName = getNodeOutputContextName(
          nameResolver,
          expression.head.nodeId,
          expression.head.outputName,
        );
        head = `${useContext}(${contextName})`;
        break;
      }
      case "debug-value":
        throw new Error("Unreachable");
    }

    let i = 0;
    return expression.selectors.reduce((target, selector) => {
      if (selector.type === "property") {
        return `${target}.${selector.propertyName}`;
      }

      const args = expression.args
        .slice(i, i + selector.memberType.parameters.length)
        .map((arg, j) =>
          arg
            ? generateExpression(
                nodeId,
                fluentExpressionKey +
                  `-${expression.parameterPrefix}${i + j + 1}`,
                arg,
                nameResolver,
              )
            : "undefined",
        );
      i += args.length;
      switch (selector.type) {
        case "method":
          return `${target}.${selector.methodName}(${args})`;
        case "call":
          return `${target}(${args})`;
        case "extension-method": {
          const extensionMethod = nameResolver.importBinding(
            selector.definition,
          );
          return `${extensionMethod}(${target}, ${args})`;
        }
      }
    }, head);
  }
  throw new Error("Unreachable");
}
