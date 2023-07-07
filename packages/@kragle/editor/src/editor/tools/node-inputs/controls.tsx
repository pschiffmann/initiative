import {
  BaseFormControlProps,
  ButtonControl,
  CheckboxControl,
  Dialog,
  DialogCommand,
  NumberFieldControl,
  SelectControl,
  TextFieldControl,
  bemClasses,
} from "@kragle/design-system";
import { CommandController } from "@kragle/react-command";
import {
  BooleanLiteralExpressionJson,
  EntityLiteralExpressionJson,
  Expression,
  ExpressionJson,
  NodeData,
  NumberLiteralExpressionJson,
  SceneDocument,
  StringLiteralExpressionJson,
  t,
} from "@kragle/runtime";
import { ComponentType, useState } from "react";
import { useInputOptions } from "./use-input-options.js";

const cls = bemClasses("kragle-node-input-control");

export interface NodeInputControlProps {
  document: SceneDocument;
  nodeData: NodeData;
  inputName: string;
  index?: number;
}

export function NodeInputControl({
  document,
  nodeData,
  inputName,
  index,
}: NodeInputControlProps) {
  const inputKey = index !== undefined ? `${inputName}::${index}` : inputName;
  const expression = nodeData.inputs[inputKey];
  const helpText =
    `Expected type: ` + nodeData.schema.inputTypes[inputName].toString();
  const errorText = !nodeData.errors?.invalidInputs.has(inputKey)
    ? undefined
    : !expression
    ? "This input is required."
    : expression.errors.size === 1 && expression.errors.has("/")
    ? expression.errors.get("/")!
    : [...expression.errors.values()].join("\n");

  function setNodeInput(expression: ExpressionJson | null) {
    document.applyPatch({
      type: "set-node-input",
      nodeId: nodeData.id,
      expression,
      inputName,
      index,
    });
  }

  if (!expression) {
    return (
      <EmptyInputControl
        label={inputName}
        helpText={helpText}
        errorText={errorText}
        inputType={nodeData.schema.inputTypes[inputName]}
        onChange={setNodeInput}
      />
    );
  }

  const InputControl = controlComponents[expression.json.type];
  return (
    <InputControl
      label={inputName}
      helpText={helpText}
      errorText={errorText}
      expression={expression}
      onChange={setNodeInput}
      onClear={() => setNodeInput(null)}
    />
  );
}

interface EmptyInputControlProps
  extends Pick<BaseFormControlProps, "label" | "helpText" | "errorText"> {
  inputType: t.KragleType;
  onChange(json: ExpressionJson): void;
}

function EmptyInputControl({
  inputType,
  onChange,
  ...props
}: EmptyInputControlProps) {
  const options = useInputOptions(inputType);

  return (
    <SelectControl
      adornmentIcon="add"
      options={options}
      getOptionLabel={(o) => o.label}
      noOptionSelectedLabel="Bind input ..."
      value={null}
      onChange={(o) => onChange(o.expression)}
      {...props}
    />
  );
}

interface InputControlProps
  extends Pick<
    BaseFormControlProps,
    "label" | "helpText" | "errorText" | "onClear"
  > {
  expression: Expression;
  onChange(json: ExpressionJson): void;
}

function StringLiteralControl({
  expression,
  onChange,
  ...props
}: InputControlProps) {
  const json = expression.json as StringLiteralExpressionJson;
  return (
    <TextFieldControl
      value={json.value}
      onChange={(value) => onChange({ ...json, value })}
      {...props}
    />
  );
}

function NumberLiteralControl({
  expression,
  onChange,
  ...props
}: InputControlProps) {
  const json = expression.json as NumberLiteralExpressionJson;
  return (
    <NumberFieldControl
      value={json.value}
      onChange={(value) => onChange({ ...json, value })}
      {...props}
    />
  );
}

function BooleanLiteralControl({
  expression,
  onChange,
  ...props
}: InputControlProps) {
  const json = expression.json as BooleanLiteralExpressionJson;
  return (
    <CheckboxControl
      value={json.value}
      onChange={(value) => onChange({ ...json, value })}
      {...props}
    />
  );
}

function EntityLiteralControl({
  expression,
  onChange,
  ...props
}: InputControlProps) {
  const json = expression.json as EntityLiteralExpressionJson;
  const entityType = expression.types.get("/") as t.Entity;
  return (
    <ButtonControl
      adornmentIcon="build"
      value={entityType.literal!.format(json.value)}
      onPress={() => alert("TODO: Open entity editor dialog")}
      {...props}
    />
  );
}

function LibraryMemberControl({ expression, ...props }: InputControlProps) {
  return (
    <ButtonControl
      adornmentIcon="link"
      value={expression.format()}
      {...props}
    />
  );
}

function SceneInputControl({ expression, ...props }: InputControlProps) {
  return (
    <ButtonControl
      adornmentIcon="link"
      value={expression.format()}
      {...props}
    />
  );
}

function NodeOutputControl({ expression, ...props }: InputControlProps) {
  return (
    <ButtonControl
      adornmentIcon="link"
      value={expression.format()}
      {...props}
    />
  );
}

function FunctionCallControl({
  label,
  helpText,
  expression,
  onChange,
  ...props
}: InputControlProps) {
  const [controller] = useState(() => new CommandController<DialogCommand>());
  return (
    <>
      <ButtonControl
        label={label}
        helpText={helpText}
        adornmentIcon="calculate"
        value={expression.format()}
        onPress={() => controller.send("open")}
        {...props}
      />
    </>
  );
}

const controlComponents: Record<
  ExpressionJson["type"],
  ComponentType<InputControlProps>
> = {
  "string-literal": StringLiteralControl,
  "number-literal": NumberLiteralControl,
  "boolean-literal": BooleanLiteralControl,
  "entity-literal": EntityLiteralControl,
  "library-member": LibraryMemberControl,
  "scene-input": SceneInputControl,
  "node-output": NodeOutputControl,
  "function-call": FunctionCallControl,
};
