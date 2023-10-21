import {
  EnumValueExpression,
  Expression,
  FluentMessageExpression,
  JsonLiteralExpression,
  MemberAccessExpression,
  fluentHelpers,
} from "#shared";
import { FluentBundle, FluentResource } from "@fluent/bundle";
import { Definitions } from "@initiative.dev/schema";
import * as $Object from "@pschiffmann/std/object";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { AncestorOutputs } from "./ancestor-outputs.js";

export function evaluateExpression(
  expr: Expression,
  definitions: Definitions,
  locale: string,
  debugValues: ObjectMap<any> | null,
  ancestorOutputs: AncestorOutputs | null,
): any {
  if (
    expr instanceof JsonLiteralExpression ||
    expr instanceof EnumValueExpression
  ) {
    return expr.value;
  }
  if (expr instanceof FluentMessageExpression) {
    const message = expr.messages[locale];
    const bundle = new FluentBundle(locale);
    bundle.addResource(
      new FluentResource(fluentHelpers.encodeFtl("message", message)),
    );
    const errors: Error[] = [];
    const result = bundle.formatPattern(
      bundle.getMessage("message")!.value!,
      $Object.map(expr.args, (v, expr) =>
        evaluateExpression(
          expr!,
          definitions,
          locale,
          debugValues,
          ancestorOutputs,
        ),
      ),
      errors,
    );
    if (errors.length) {
      console.warn(
        `Encountered errors while translating message ` +
          `${JSON.stringify(message)}:`,
        errors,
      );
    }
    return result;
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
                  locale,
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
