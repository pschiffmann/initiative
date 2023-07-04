import {
  BaseFormControlProps,
  ButtonControl,
  CheckboxControl,
  NumberFieldControl,
  SelectControl,
  TextFieldControl,
  bemClasses,
} from "@kragle/design-system";
import {
  BooleanLiteralExpressionJson,
  EntityLiteralExpressionJson,
  ExpressionJson,
  LibraryMemberExpressionJson,
  NodeData,
  NodeOutputExpressionJson,
  NumberLiteralExpressionJson,
  SceneDocument,
  SceneInputExpressionJson,
  StringLiteralExpressionJson,
  t,
} from "@kragle/runtime";
import { ComponentType } from "react";
import { InputExpressionOption, useInputOptions } from "./use-input-options.js";

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

  function clearNodeInput() {
    document.applyPatch({
      type: "set-node-input",
      nodeId: nodeData.id,
      expression: null,
      inputName,
      index,
    });
  }

  const InputControl = expression
    ? controlComponents[expression.json.type]
    : EmptyInputControl;

  return (
    <InputControl
      document={document}
      nodeData={nodeData}
      inputKey={inputKey}
      inputName={inputName}
      index={index}
      helpText={helpText}
      errorText={errorText}
      onClear={clearNodeInput}
    />
  );
}

export interface InputControlProps
  extends Pick<BaseFormControlProps, "helpText" | "errorText" | "onClear"> {
  document: SceneDocument;
  nodeData: NodeData;
  inputKey: string;
  inputName: string;
  index?: number;
}

function EmptyInputControl({
  document,
  nodeData,
  inputKey,
  inputName,
  index,
  onClear,
  ...props
}: InputControlProps) {
  const options = useInputOptions(document, nodeData, inputName);

  function setNodeInput({ expression }: InputExpressionOption) {
    document.applyPatch({
      type: "set-node-input",
      nodeId: nodeData.id,
      inputName,
      index,
      expression,
    });
  }

  return (
    <SelectControl
      label={inputName}
      adornmentIcon="add"
      options={options}
      getOptionLabel={(o) => o.label}
      noOptionSelectedLabel="Bind input ..."
      value={null}
      onChange={setNodeInput}
      {...props}
    />
  );
}

function StringLiteralControl({
  document,
  nodeData,
  inputKey,
  inputName,
  index,
  ...props
}: InputControlProps) {
  const json = nodeData.inputs[inputKey].json as StringLiteralExpressionJson;
  function setNodeInput(value: string) {
    document.applyPatch({
      type: "set-node-input",
      nodeId: nodeData.id,
      inputName,
      index,
      expression: { ...json, value },
    });
  }

  return (
    <TextFieldControl
      label={inputName}
      value={json.value}
      onChange={setNodeInput}
      {...props}
    />
  );
}

function NumberLiteralControl({
  document,
  nodeData,
  inputKey,
  inputName,
  index,
  ...props
}: InputControlProps) {
  const json = nodeData.inputs[inputKey].json as NumberLiteralExpressionJson;
  function setNodeInput(value: number) {
    document.applyPatch({
      type: "set-node-input",
      nodeId: nodeData.id,
      inputName,
      index,
      expression: { ...json, value },
    });
  }

  return (
    <NumberFieldControl
      label={inputName}
      value={json.value}
      onChange={setNodeInput}
      {...props}
    />
  );
}

function BooleanLiteralControl({
  document,
  nodeData,
  inputKey,
  inputName,
  index,
  ...props
}: InputControlProps) {
  const json = nodeData.inputs[inputKey].json as BooleanLiteralExpressionJson;
  function setNodeInput(value: boolean) {
    document.applyPatch({
      type: "set-node-input",
      nodeId: nodeData.id,
      inputName,
      index,
      expression: { ...json, value },
    });
  }

  return (
    <CheckboxControl
      label={inputName}
      value={json.value}
      onChange={setNodeInput}
      {...props}
    />
  );
}

function EntityLiteralControl({
  document,
  nodeData,
  inputKey,
  inputName,
  index,
  ...props
}: InputControlProps) {
  const json = nodeData.inputs[inputKey].json as EntityLiteralExpressionJson;
  const entityType = nodeData.schema.inputTypes[inputName] as t.Entity;
  return (
    <ButtonControl
      label={inputName}
      adornmentIcon="build"
      value={entityType.literal!.format(json)}
      onPress={() => alert("TODO: Open entity editor dialog")}
      {...props}
    />
  );
}

function LibraryMemberControl({
  document,
  nodeData,
  inputKey,
  inputName,
  index,
  ...props
}: InputControlProps) {
  const json = nodeData.inputs[inputKey].json as LibraryMemberExpressionJson;
  return (
    <ButtonControl
      label={inputName}
      adornmentIcon="link"
      value={`${json.libraryName}::${json.memberName}`}
      {...props}
    />
  );
}

function SceneInputControl({
  document,
  nodeData,
  inputKey,
  inputName,
  index,
  ...props
}: InputControlProps) {
  const json = nodeData.inputs[inputKey].json as SceneInputExpressionJson;
  return (
    <ButtonControl
      label={inputName}
      adornmentIcon="link"
      value={`Scene::${json.inputName}`}
      {...props}
    />
  );
}

function NodeOutputControl({
  document,
  nodeData,
  inputKey,
  inputName,
  index,
  ...props
}: InputControlProps) {
  const json = nodeData.inputs[inputKey].json as NodeOutputExpressionJson;
  return (
    <ButtonControl
      label={inputName}
      adornmentIcon="link"
      value={`${json.nodeId}::${json.outputName}`}
      {...props}
    />
  );
}

function FunctionCallControl({
  document,
  nodeData,
  inputKey,
  inputName,
  index,
  ...props
}: InputControlProps) {
  return (
    <ButtonControl
      label={inputName}
      adornmentIcon="calculate"
      value={nodeData.inputs[inputKey].format()}
      onPress={() => alert("TODO: Open expression editor dialog")}
      {...props}
    />
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
