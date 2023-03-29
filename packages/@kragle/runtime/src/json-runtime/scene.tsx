import { SceneRuntime, useRootNode } from "./scene-runtime.js";

export interface SceneProps {
  runtime: SceneRuntime;
}

export function Scene({ runtime }: SceneProps) {
  const rootNode = useRootNode(runtime);
  const NodeAdapter = runtime.getAdapterComponent(rootNode);
  return <NodeAdapter />;
}
