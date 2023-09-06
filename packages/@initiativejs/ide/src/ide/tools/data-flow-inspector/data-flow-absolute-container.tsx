import { SceneDocument } from "../../../shared/index.js";
import { Layout, useLayout } from "./layout-algorithm.js";
import { NodeBox } from "./node-box.js";

export interface DFACProps {
  document: SceneDocument;
  selectedNode: string | null;
}

export function DataFlowAbsoluteContainer({
  document,
  selectedNode,
}: DFACProps) {
  const canvas: Layout = useLayout(document);
  return (
    <div style={{ position: "relative" }}>
      {document.keys().map((key) => (
        <NodeBox
          data={document.getNode(key)}
          focus={selectedNode}
          positioning={canvas.nodeBoxPositions[key]}
        />
      ))}
    </div>
  );
}
