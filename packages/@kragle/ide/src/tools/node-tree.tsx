// import { jsonRuntime } from "@kragle/runtime";

export function NodeTree() {
  return (
    <div className="tool node-tree">
      <div className="tool__header">Node tree</div>
    </div>
  );
}

interface TreeNodeProps {
  sceneJson: any;
  nodeId: string;
  // x: jsonRuntime.SceneRuntime;
}

function TreeNode({ sceneJson, nodeId }: TreeNodeProps) {
  const nodeJson = sceneJson.nodes[nodeId];
  return (
    <div className="node-tree__item">
      <div className="node-tree__row">
        <div className="node-tree__type">{nodeJson.type}</div>
        <button className="node-tree__delete">×</button>
      </div>
    </div>
  );
}
