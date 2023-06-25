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

  if (!expression) {
    return (
      <EmptyInputControl
        document={document}
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
  ...props
}: InputControlProps) {
  return (
    <SelectControl
      label={inputName}
      adornmentIcon="add"
      options={["a", "b"]}
      getOptionLabel={(o) => o}
      noOptionSelectedLabel="Bind input ..."
      value=""
      onChange={console.log}
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
