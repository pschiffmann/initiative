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
import { EmptyControl } from "./empty-control.js";
import {
  ExpressionControl,
  ExpressionControlProps,
  generateHelpText,
} from "./expression-control.js";

const cls = bemClasses("initiative-node-inputs-member-access-control");

export function MemberAccessControl({
  name,
  expectedType,
  optional,
  doc,
  expression,
  onChange,
}: Omit<ExpressionControlProps<MemberAccessExpression>, "parent">) {
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
  name,
  expectedType,
  optional,
  doc,
  expression,
  onChange,
}: Omit<ExpressionControlProps<MemberAccessExpression>, "parent">) {
  return (
    <>
      <ButtonControl
        className={cls.element("root")}
        label={name}
        helpText={generateHelpText(name, expectedType, optional, doc)}
        dense={!!expression.parent}
        value={expression.toString("truncated")}
        adornmentIcon="function"
        onClear={
          !expression.parent
            ? undefined
            : () => onChange(expression.withDeleted())
        }
      />
      <div className={cls.element("args")}>
        {expression.args.map((arg, i) => {
          const [argExpectedType, argIsOptional] =
            expression.getExpectedTypeForArg(i);
          return !arg ? (
            <EmptyControl
              key={i}
              parent="member-access-expression"
              name={`${expression.parameterPrefix}${i + 1}`}
              expectedType={argExpectedType}
              optional={argIsOptional}
              onSelect={(value) => onChange(expression.withArg(i, value))}
            />
          ) : arg instanceof MemberAccessExpression ? (
            <MemberAccessControlInternal
              key={i}
              name={`${expression.parameterPrefix}${i + 1}`}
              expectedType={argExpectedType}
              optional={argIsOptional}
              // doc=???
              expression={arg}
              onChange={onChange}
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
              onChange={onChange}
            />
          );
        })}
      </div>
    </>
  );
}
