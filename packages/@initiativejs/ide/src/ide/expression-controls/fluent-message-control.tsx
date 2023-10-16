import {
  AlertDialogContent,
  Button,
  ButtonControl,
  Dialog,
  DialogCommand,
  TextAreaControl,
  Typography,
  bemClasses,
} from "#design-system";
import { ExpressionJson, FluentMessageExpression } from "#shared";
import { CommandController } from "@initiativejs/react-command";
import { t } from "@initiativejs/schema";
import { useState } from "react";
import {
  ExpressionControl,
  ExpressionControlProps,
  generateHelpText,
} from "./index.js";

const cls = bemClasses("initiative-fluent-message-expression-control");

export function FluentMessageControl({
  parent,
  name,
  expectedType,
  optional,
  doc,
  expression,
  onChange,
}: ExpressionControlProps<FluentMessageExpression>) {
  const [controller] = useState(() => new CommandController<DialogCommand>());
  return (
    <>
      <ButtonControl
        label={name}
        helpText={generateHelpText(name, expectedType, optional, doc)}
        errorText={
          expression.hasErrors ? "Locales or arguments are missing." : undefined
        }
        dense={parent === "member-access-expression"}
        adornmentIcon="translate"
        value={expression.toString()}
        onPress={() => controller.send("open")}
        onClear={() => onChange(null)}
      />
      <Dialog commandStream={controller}>
        <AlertDialogContent
          className={cls.block()}
          title={`Translate '${name}'`}
          actions={
            <Button label="Close" onPress={() => controller.send("close")} />
          }
        >
          <DialogContent expression={expression} onChange={onChange} />
        </AlertDialogContent>
      </Dialog>
    </>
  );
}

interface DialogContentProps {
  expression: FluentMessageExpression;
  onChange(value: ExpressionJson): void;
}

function DialogContent({ expression, onChange }: DialogContentProps) {
  return (
    <div className={cls.element("dialog-content")}>
      <Typography
        className={cls.element("section-title")}
        variant="title-medium"
      >
        Translations
      </Typography>
      {Object.entries(expression.messages).map(([locale, message]) => (
        <TextAreaControl
          key={locale}
          label={locale}
          dense
          value={message}
          onChange={(message) =>
            onChange(expression.withMessage(locale, message))
          }
        />
      ))}
      <Typography
        className={cls.element("section-title")}
        variant="title-medium"
      >
        Variables
      </Typography>
      {Object.entries(expression.args).map(([variable, expr]) => (
        <ExpressionControl
          key={variable}
          parent="member-access-expression"
          name={variable}
          expectedType={t.union(t.string(), t.number())}
          // doc
          expression={expr}
          onChange={(json) => onChange(expression.withArg(variable, json))}
        />
      ))}
    </div>
  );
}
