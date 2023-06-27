import {
  BaseFormControlProps,
  ButtonControl,
  SelectControl,
  TextFieldControl,
  bemClasses,
} from "@kragle/design-system";
import {
  Expression,
  NodeData,
  NodeOutputExpressionJson,
  SceneDocument,
  SceneInputExpressionJson,
  StringLiteralExpressionJson,
} from "@kragle/runtime/v2";
import { AncestorOutput } from "./use-ancestor-outputs.js";

const cls = bemClasses("kragle-node-input-control");

export interface NodeInputControlProps {
  document: SceneDocument;
  ancestorOutputs: readonly AncestorOutput[];
  nodeData: NodeData;
  inputName: string;
  index?: number;
}

export function NodeInputControl({
  document,
  ancestorOutputs,
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

  if (!expression) {
    return (
      <EmptyInputControl
        document={document}
        ancestorOutputs={ancestorOutputs}
        nodeData={nodeData}
        inputKey={inputKey}
        inputName={inputName}
        index={index}
        helpText={helpText}
        errorText={errorText}
      />
    );
  }

  switch (expression.json.type) {
    case "string-literal":
      return (
        <StringLiteralControl
          document={document}
          ancestorOutputs={ancestorOutputs}
          nodeData={nodeData}
          inputKey={inputKey}
          inputName={inputName}
          index={index}
          helpText={helpText}
          errorText={errorText}
          onClear={clearNodeInput}
        />
      );
    case "scene-input":
      return (
        <SceneInputControl
          document={document}
          ancestorOutputs={ancestorOutputs}
          nodeData={nodeData}
          inputKey={inputKey}
          inputName={inputName}
          index={index}
          helpText={helpText}
          errorText={errorText}
          onClear={clearNodeInput}
        />
      );
    case "node-output":
      return (
        <NodeOutputControl
          document={document}
          ancestorOutputs={ancestorOutputs}
          nodeData={nodeData}
          inputKey={inputKey}
          inputName={inputName}
          index={index}
          helpText={helpText}
          errorText={errorText}
          onClear={clearNodeInput}
        />
      );
    case "function-call":
      return (
        <FunctionCallControl
          document={document}
          ancestorOutputs={ancestorOutputs}
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

  return <div>TODO</div>;
}

export interface InputControlProps
  extends Pick<BaseFormControlProps, "helpText" | "errorText" | "onClear"> {
  document: SceneDocument;
  ancestorOutputs: readonly AncestorOutput[];
  nodeData: NodeData;
  inputKey: string;
  inputName: string;
  index?: number;
}

function EmptyInputControl({
  document,
  ancestorOutputs,
  nodeData,
  inputKey,
  inputName,
  index,
  ...props
}: InputControlProps) {
  const inputType = nodeData.schema.inputTypes[inputName];

  function setNodeInput(value: AncestorOutput) {
    document.applyPatch({
      type: "set-node-input",
      nodeId: nodeData.id,
      inputName,
      index,
      expression: value.expression,
    });
  }

  return (
    <SelectControl
      label={inputName}
      adornmentIcon="add"
      options={ancestorOutputs.filter((ancestorOutput) =>
        ancestorOutput.type.isAssignableTo(inputType)
      )}
      getOptionLabel={(o) =>
        `${o.expression.nodeId}::${o.expression.outputName}`
      }
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
    <TextFieldControl
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
    <TextFieldControl
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

function getFieldIcon(expression: Expression): string {
  switch (expression.json.type) {
    case "string-literal":
    case "number-literal":
      return "text_fields";
    case "boolean-literal":
      return expression.json.value ? "check_box_outline_blank" : "check_box";
    case "entity-literal":
      return "build";
    case "library-member":
      return "list_alt";
    case "scene-input":
    case "node-output":
      return "link";
    case "function-call":
      return "calculate";
  }
}
