import {
  EnumValueExpression,
  Expression,
  ExpressionJson,
  JsonLiteralExpression,
  MemberAccessExpression,
} from "#shared";
import { t } from "@initiativejs/schema";
import { EnumValueControl } from "./enum-value-control.js";
import { MemberAccessControl } from "./member-access-control.js";

export interface ExpressionLhs {
  readonly parent: "node" | "member-access-expression";
  readonly name: string;
  readonly expectedType: t.Type;
  readonly optional?: boolean;
  readonly doc?: string;
}

export interface ExpressionControlProps<T extends Expression>
  extends ExpressionLhs {
  expression: T;
  onChange(value: ExpressionJson | null): void;
}

export function ExpressionControl({
  parent,
  name,
  expectedType,
  optional,
  doc,
  expression,
  onChange,
}: ExpressionControlProps<Expression>) {
  if (expression instanceof JsonLiteralExpression) {
    const Control = expression.schema.control;
    return (
      <Control
        label={name}
        helpText={generateHelpText(name, expectedType, optional, doc)}
        dense={parent === "member-access-expression"}
        value={expression.value}
        onChange={(value) => onChange(expression.withValue(value))}
        onClear={() => onChange(null)}
      />
    );
  }
  if (expression instanceof EnumValueExpression) {
    return (
      <EnumValueControl
        parent={parent}
        name={name}
        expectedType={expectedType}
        optional={optional}
        doc={doc}
        expression={expression}
        onChange={onChange}
      />
    );
  }
  if (expression instanceof MemberAccessExpression) {
    return (
      <MemberAccessControl
        parent={parent}
        name={name}
        expectedType={expectedType}
        optional={optional}
        doc={doc}
        expression={expression}
        onChange={onChange}
      />
    );
  }
  throw new Error("Unreachable");
}

export function generateHelpText(
  name: string,
  expectedType: t.Type,
  optional: boolean | undefined,
  doc: string | undefined,
): string {
  const typeStr = optional
    ? `${name}?: ${expectedType}`
    : `${name}: ${expectedType}`;
  return doc ? `${typeStr}\n\n${doc}` : typeStr;
}
