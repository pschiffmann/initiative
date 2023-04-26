import { SceneDocument } from "@kragle/runtime";
import { NodeBox } from "./node-box.js";

interface NodeBindingsEditorProps {
  document: SceneDocument;
}

export function NodeBindingsEditor({ document }: NodeBindingsEditorProps) {
  return (
    <div className="bindings-editor">
      <NodeBox
        schema={
          document.nodeDefinitions.get("@pschiffmann/kragle-demo/Table")!.schema
        }
        nodeId="ArticlesTable"
        nodeJson={{
          type: "@pschiffmann/kragle-demo/Table",
          inputs: {
            title: { type: "constant", value: "Dialog title" },
          },
          collectionInputs: {},
          slots: {},
          collectionSlots: {
            column: ["NameColumn", "PriceColumn", "QuantityColumn"],
          },
        }}
      />
    </div>
  );
}
