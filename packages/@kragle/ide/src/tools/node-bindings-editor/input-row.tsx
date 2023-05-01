import { InputBindingJson, SceneDocument, t } from "@kragle/runtime";
import { ReactElement } from "react";
import { bemClasses } from "../../bem-classes.js";

const cls = bemClasses("input-row");

export interface InputRowProps {
  document: SceneDocument;
  nodeId: string;
  inputName: string;
  type: t.KragleType;
  binding: InputBindingJson | null;
}

export function InputRow({
  document,
  nodeId,
  inputName,
  type,
  binding,
}: InputRowProps) {
  const valueEditor = resolveBindingEditor(
    document,
    nodeId,
    inputName,
    type,
    binding
  );
  return (
    <div className={cls.block()}>
      <div className={cls.element("connector")} />
      <div className={cls.element("name")}>{inputName}</div>
      <div className={cls.element("type")}>{type.toString()}</div>
      {valueEditor}
    </div>
  );
}

function resolveBindingEditor(
  document: SceneDocument,
  nodeId: string,
  inputName: string,
  type: t.KragleType,
  binding: InputBindingJson | null
): ReactElement {
  if (binding?.type === "node-output") {
    return (
      <NodeOutputBindingEditor
        document={document}
        nodeId={nodeId}
        inputName={inputName}
        binding={binding}
      />
    );
  }
  if (binding?.type === "constant") {
    if (t.string().isAssignableTo(type)) {
      return (
        <StringBindingEditor
          document={document}
          nodeId={nodeId}
          inputName={inputName}
          binding={binding}
        />
      );
    }
    return (
      <EnumBindingEditor
        document={document}
        nodeId={nodeId}
        inputName={inputName}
        binding={binding}
      />
    );
  }
  return (
    <UnboundConnector
      document={document}
      nodeId={nodeId}
      inputName={inputName}
      type={type}
    />
  );
}

interface UnboundConnectorProps {
  document: SceneDocument;
  nodeId: string;
  inputName: string;
  type: t.KragleType;
}

function UnboundConnector({
  document,
  nodeId,
  inputName,
  type,
}: UnboundConnectorProps) {
  const options: { label: string; binding: InputBindingJson }[] = [];
  if (t.string().isAssignableTo(type)) {
    options.push({
      label: "Static text",
      binding: { type: "constant", value: "" },
    });
  }
  if (t.number().isAssignableTo(type)) {
    options.push({
      label: "Static number",
      binding: { type: "constant", value: 0 },
    });
  }
  if (t.string().isAssignableTo(type)) {
    options.push({
      label: "Static boolean",
      binding: { type: "constant", value: false },
    });
  }
  if (t.Union.is(type)) {
    for (const element of type.elements) {
      if (t.String.is(element) && element.value !== undefined) {
        options.push({
          label: `"${element.value}"`,
          binding: { type: "constant", value: element.value },
        });
      } else if (
        (t.Number.is(element) || t.Boolean.is(element)) &&
        element.value !== undefined
      ) {
        options.push({
          label: `${element.value}`,
          binding: { type: "constant", value: element.value },
        });
      }
    }
  }
  for (const ancestorId of document.getAncestors(nodeId)) {
    const nodeJson = document.getNode(ancestorId)!;
    const { schema } = document.nodeDefinitions.get(nodeJson.type)!;
    for (const [outputName, outputType] of Object.entries(schema.outputs)) {
      if (outputType.isAssignableTo(type)) {
        options.push({
          label: `🔗 ${ancestorId}/${outputName}`,
          binding: { type: "node-output", nodeId: ancestorId, outputName },
        });
      }
    }
  }

  function selectOption(optionIndex: number) {
    document.applyPatch({
      type: "bind-node-input",
      nodeId,
      inputName,
      binding: options[optionIndex].binding,
    });
  }

  return (
    <div className={cls.element("value-group")}>
      <select
        className={cls.element("select")}
        value="%%NO_VALUE%%"
        onChange={(e) => selectOption(Number.parseInt(e.currentTarget.value))}
      >
        <option value="%%NO_VALUE%%" disabled>
          -- No value --
        </option>
        {options.map((o, i) => (
          <option key={i} value={i}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface NodeOutputBindingEditorProps {
  document: SceneDocument;
  nodeId: string;
  inputName: string;
  binding: InputBindingJson;
}

function NodeOutputBindingEditor({
  document,
  nodeId,
  inputName,
  binding,
}: NodeOutputBindingEditorProps) {
  if (binding.type !== "node-output") {
    throw new Error("Unreachable");
  }

  function unbind() {
    document.applyPatch({
      type: "bind-node-input",
      nodeId,
      inputName,
      // index,
      binding: null,
    });
  }

  return (
    <div className={cls.element("value-group")}>
      <div
        className={cls.element("value-link")}
        title={`${binding.nodeId}/${binding.outputName}`}
      >
        🔗 {binding.nodeId}/{binding.outputName}
      </div>
      <button className={cls.element("unbind")} onClick={unbind}>
        ❌
      </button>
    </div>
  );
}

interface EnumBindingEditorProps {
  document: SceneDocument;
  nodeId: string;
  inputName: string;
  binding: InputBindingJson;
}

function EnumBindingEditor({
  document,
  nodeId,
  inputName,
  binding,
}: EnumBindingEditorProps) {
  if (binding.type !== "constant") {
    throw new Error("Unreachable");
  }

  function unbind() {
    document.applyPatch({
      type: "bind-node-input",
      nodeId,
      inputName,
      // index,
      binding: null,
    });
  }

  return (
    <div className={cls.element("value-group")}>
      <div className={cls.element("value-link")}>
        {typeof binding.value === "string"
          ? `"${binding.value}"`
          : binding.value}
      </div>
      <button className={cls.element("unbind")} onClick={unbind}>
        ❌
      </button>
    </div>
  );
}

interface StringBindingEditorProps {
  document: SceneDocument;
  nodeId: string;
  inputName: string;
  binding: InputBindingJson;
}

function StringBindingEditor({
  document,
  nodeId,
  inputName,
  binding,
}: StringBindingEditorProps) {
  if (binding.type !== "constant" || typeof binding.value !== "string") {
    throw new Error("Unreachable");
  }

  function updateText(value: string) {
    document.applyPatch({
      type: "bind-node-input",
      nodeId,
      inputName,
      // index,
      binding: { ...(binding as any), value },
    });
  }

  function unbind() {
    document.applyPatch({
      type: "bind-node-input",
      nodeId,
      inputName,
      // index,
      binding: null,
    });
  }

  return (
    <div className={cls.element("value-group")}>
      <input
        type="text"
        className={cls.element("textfield")}
        value={binding.value}
        onChange={(e) => updateText(e.currentTarget.value)}
      />
      <button className={cls.element("unbind")} onClick={unbind}>
        ❌
      </button>
    </div>
  );
}
