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
} from "./index.js";

const cls = bemClasses("initiative-member-access-expression-control");

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
          expression.hasErrors
            ? "Required function arguments are missing or contain errors."
            : undefined
        }
        dense={parent !== "node"}
        adornmentIcon="function"
        value={expression.toString()}
        onPress={() => controller.send("open")}
        onClear={() => onChange(null)}
      />
      <Dialog commandStream={controller}>
        <AlertDialogContent
          className={cls.block()}
          title={`Configure '${name}'`}
          actions={
            <Button label="Close" onPress={() => controller.send("close")} />
          }
        >
          <MemberAccessControlInternal
            root
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

interface MemberAccessControlInternalProps
  extends Omit<ExpressionControlProps<MemberAccessExpression>, "parent"> {
  root?: boolean;
}

function MemberAccessControlInternal({
  root,
  name,
  expectedType,
  optional,
  doc,
  expression,
  onChange,
}: MemberAccessControlInternalProps) {
  return (
    <>
      <ButtonControl
        className={cls.element("selectors", null, root && "root")}
        label={name}
        helpText={generateHelpText(name, expectedType, optional, doc)}
        dense={!root}
        value={expression.toString("truncated")}
        adornmentIcon="function"
        onClear={!root ? () => onChange(null) : undefined}
      />
      {expression.args.length !== 0 && (
        <div className={cls.element("args")}>
          {expression.args.map((arg, i) => {
            const [argExpectedType, argIsOptional] =
              expression.getExpectedTypeForArg(i);
            return arg instanceof MemberAccessExpression ? (
              <MemberAccessControlInternal
                key={i}
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
