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
          document.nodeDefinitions.get("@pschiffmann/kragle-demo/Dialog")!
            .schema
        }
        nodeId="ArticlesTable"
        nodeJson={{
          type: "@pschiffmann/kragle-demo/Dialog",
          inputs: {},
          collectionInputs: {},
          slots: {},
          collectionSlots: {
            column: [
              "NameColumn",
              "WeightPerArticleColumn",
              "LogisticalUnitColumn",
              "AllowedStackSizeColumn",
              "ActionColumn",
            ],
          },
        }}
      />
    </div>
  );
}
