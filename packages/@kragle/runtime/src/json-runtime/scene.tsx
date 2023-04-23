import { useRootNodeId } from "../scene-document/index.js";
import { SceneRuntime } from "./scene-runtime.js";

export interface SceneProps {
  runtime: SceneRuntime;
}

export function Scene({ runtime }: SceneProps) {
  const rootNode = useRootNodeId(runtime.sceneDocument);
  if (!rootNode) return <div>Error: The scene is empty.</div>;
  const NodeComponent = runtime.getNodeComponent(rootNode);
  return <NodeComponent />;
}
