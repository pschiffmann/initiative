import { SceneDocument, useRootNodeId } from "@kragle/runtime";
import { TreeElement } from "./tree-element.js";

export interface NodeTreeProps {
  document: SceneDocument;
}

export function NodeTree({ document }: NodeTreeProps) {
  const rootNode = useRootNodeId(document);
  return rootNode ? (
    <div className="node-tree">
      <TreeElement document={document} nodeId={rootNode} />
    </div>
  ) : (
    <div>Error: Tree is empty.</div>
  );
}