import {
  AlertDialogContent,
  Button,
  ButtonControl,
  Dialog,
  DialogCommand,
  bemClasses,
} from "#design-system";
import { MemberAccessExpression } from "#shared";
import { CommandController } from "@initiativejs/react-command";
import { useState } from "react";
import {
  ExpressionControl,
  ExpressionControlProps,
  generateHelpText,
} from "./expression-control.js";

const cls = bemClasses("initiative-node-inputs-member-access-control");

export function MemberAccessControl({
  parent,
  name,
  expectedType,
  optional,
  doc,
  expression,
  onChange,
}: ExpressionControlProps<MemberAccessExpression>) {
  const [controller] = useState(() => new CommandController<DialogCommand>());
  return (
    <>
      <ButtonControl
        label={name}
        helpText={generateHelpText(name, expectedType, optional, doc)}
        errorText={
          expression.isComplete
            ? undefined
            : "Required function arguments are missing."
        }
        adornmentIcon="function"
        value={expression.toString()}
        onPress={() => controller.send("open")}
        onClear={() => onChange(null)}
      />
      <Dialog commandStream={controller}>
        <AlertDialogContent
          className={cls.block()}
          title={`Configure input '${name}'`}
          actions={
            <Button label="Close" onPress={() => controller.send("close")} />
          }
        >
          <MemberAccessControlInternal
            parent={parent}
            name={name}
            expectedType={expectedType}
            optional={optional}
            doc={doc}
            expression={expression}
            onChange={onChange}
          />
        </AlertDialogContent>
      </Dialog>
    </>
  );
}

function MemberAccessControlInternal({
  parent,
  name,
  expectedType,
  optional,
  doc,
  expression,
  onChange,
}: ExpressionControlProps<MemberAccessExpression>) {
  return (
    <>
      <ButtonControl
        className={cls.element(
          "selectors",
          null,
          parent !== "member-access-expression" && "root",
        )}
        label={name}
        helpText={generateHelpText(name, expectedType, optional, doc)}
        dense={parent === "member-access-expression"}
        value={expression.toString("truncated")}
        adornmentIcon="function"
        onClear={
          parent === "member-access-expression"
            ? () => onChange(null)
            : undefined
        }
      />
      {expression.args.length !== 0 && (
        <div className={cls.element("args")}>
          {expression.args.map((arg, i) => {
            const [argExpectedType, argIsOptional] =
              expression.getExpectedTypeForArg(i);
            return arg instanceof MemberAccessExpression ? (
              <MemberAccessControlInternal
                key={i}
                parent="member-access-expression"
                name={`${expression.parameterPrefix}${i + 1}`}
                expectedType={argExpectedType}
                optional={argIsOptional}
                // doc=???
                expression={arg}
                onChange={(value) => onChange(expression.withArg(i, value))}
              />
            ) : (
              <ExpressionControl
                key={i}
                parent="member-access-expression"
                name={`${expression.parameterPrefix}${i + 1}`}
                expectedType={argExpectedType}
                optional={argIsOptional}
                // doc=???
                expression={arg}
                onChange={(value) => onChange(expression.withArg(i, value))}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
