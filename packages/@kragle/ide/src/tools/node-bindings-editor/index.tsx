import { SceneDocument } from "@kragle/runtime";
import { NodeBox } from "./node-box.js";
import { useLayout } from "./use-layout.js";

interface NodeBindingsEditorProps {
  document: SceneDocument;
}

export function NodeBindingsEditor({ document }: NodeBindingsEditorProps) {
  const layout = useLayout(document);
  return (
    <div className="bindings-editor">
      <div style={{ width: layout.canvasWidth, height: layout.canvasHeight }}>
        {Object.entries(layout.nodeBoxPositions).map(([nodeId, position]) => {
          const nodeJson = document.getNode(nodeId)!;
          const { schema } = document.nodeDefinitions.get(nodeJson.type)!;
          return (
            <NodeBox
              key={nodeId}
              position={position}
              nodeId={nodeId}
              nodeJson={nodeJson}
              schema={schema}
            />
          );
        })}
      </div>
    </div>
  );
}
