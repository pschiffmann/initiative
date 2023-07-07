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
  FunctionCallExpressionJson,
  LibraryMemberExpressionJson,
  NodeData,
  NodeOutputExpressionJson,
  NumberLiteralExpressionJson,
  SceneDocument,
  SceneInputExpressionJson,
  StringLiteralExpressionJson,
  t,
} from "@kragle/runtime";
import { ComponentType, useState } from "react";
import { FunctionExpressionBuilder } from "./function-expression-builder.js";
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
  const inputType = nodeData.schema.inputTypes[inputName];
  const expression = nodeData.inputs[inputKey];
  const helpText = `Expected type: ${inputType}`;
  const errorText = !nodeData.errors?.invalidInputs.has(inputKey)
    ? undefined
    : !expression
    ? "This input is required."
    : expression.errors.size === 1 && expression.errors.has("/")
    ? expression.errors.get("/")!
    : [...expression.errors]
        .map(([expressionPath, error]) => `${expressionPath}: ${error}`)
        .join("\n");

  function setNodeInput(expression: ExpressionJson | null) {
    document.applyPatch({
      type: "set-node-input",
      nodeId: nodeData.id,
      expression,
      inputName,
      index,
    });
  }

  const rootExpressionType = expression?.json.type ?? "empty";
  switch (rootExpressionType) {
    case "function-call": {
      return (
        <FunctionCallControl
          label={inputName}
          helpText={helpText}
          errorText={errorText}
          inputType={inputType}
          expression={expression}
          onChange={setNodeInput}
          onClear={() => setNodeInput(null)}
        />
      );
    }
    default: {
      const InputControl = controlComponents[rootExpressionType];
      return (
        <InputControl
          label={inputName}
          helpText={helpText}
          errorText={errorText}
          inputType={inputType}
          json={expression?.json ?? null}
          onChange={setNodeInput}
          onClear={() => setNodeInput(null)}
        />
      );
    }
  }
}

interface InputControlProps<T extends ExpressionJson | null>
  extends Pick<
    BaseFormControlProps,
    "label" | "helpText" | "errorText" | "onClear"
  > {
  inputType: t.KragleType;
  json: T;
  onChange(json: ExpressionJson | null): void;
}

function EmptyInputControl({
  inputType,
  onChange,
  onClear,
  ...props
}: InputControlProps<null>) {
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

function StringLiteralControl({
  json,
  onChange,
  ...props
}: InputControlProps<StringLiteralExpressionJson>) {
  return (
    <TextFieldControl
      value={json.value}
      onChange={(value) => onChange({ ...json, value })}
      {...props}
    />
  );
}

function NumberLiteralControl({
  json,
  onChange,
  ...props
}: InputControlProps<NumberLiteralExpressionJson>) {
  return (
    <NumberFieldControl
      value={json.value}
      onChange={(value) => onChange({ ...json, value })}
      {...props}
    />
  );
}

function BooleanLiteralControl({
  json,
  onChange,
  ...props
}: InputControlProps<BooleanLiteralExpressionJson>) {
  return (
    <CheckboxControl
      value={json.value}
      onChange={(value) => onChange({ ...json, value })}
      {...props}
    />
  );
}

function EntityLiteralControl({
  inputType,
  json,
  onChange,
  ...props
}: InputControlProps<EntityLiteralExpressionJson>) {
  return (
    <ButtonControl
      adornmentIcon="build"
      value={(inputType as t.Entity).literal!.format(json.value)}
      onPress={() => alert("TODO: Open entity editor dialog")}
      {...props}
    />
  );
}

function LibraryMemberControl({
  json,
  ...props
}: InputControlProps<LibraryMemberExpressionJson>) {
  return (
    <ButtonControl
      adornmentIcon="link"
      value={`import("${json.libraryName}").${json.memberName}`}
      {...props}
    />
  );
}

function SceneInputControl({
  json,
  ...props
}: InputControlProps<SceneInputExpressionJson>) {
  return (
    <ButtonControl
      adornmentIcon="link"
      value={`Scene.${json.inputName}`}
      {...props}
    />
  );
}

function NodeOutputControl({
  json,
  ...props
}: InputControlProps<NodeOutputExpressionJson>) {
  return (
    <ButtonControl
      adornmentIcon="link"
      value={`<${json.nodeId}>.${json.outputName}`}
      {...props}
    />
  );
}

interface FunctionCallControlProps
  extends Omit<InputControlProps<FunctionCallExpressionJson>, "json"> {
  expression: Expression;
}

function FunctionCallControl({
  label,
  helpText,
  inputType,
  expression,
  onChange,
  ...props
}: FunctionCallControlProps) {
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
      <Dialog commandStream={controller}>
        <FunctionExpressionBuilder
          label={label}
          helpText={helpText!}
          inputType={inputType}
          expression={expression}
          onChange={onChange}
          onClose={() => controller.send("close")}
        />
      </Dialog>
    </>
  );
}

export const controlComponents = {
  empty: EmptyInputControl,
  "string-literal": StringLiteralControl,
  "number-literal": NumberLiteralControl,
  "boolean-literal": BooleanLiteralControl,
  "entity-literal": EntityLiteralControl,
  "library-member": LibraryMemberControl,
  "scene-input": SceneInputControl,
  "node-output": NodeOutputControl,
} as Record<
  Exclude<ExpressionJson["type"], "function-call"> | "empty",
  ComponentType<InputControlProps<ExpressionJson | null>>
>;
