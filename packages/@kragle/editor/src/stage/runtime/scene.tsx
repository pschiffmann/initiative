import { useRootNodeId } from "#shared";
import { SceneRuntime } from "./scene-runtime.js";

export interface SceneProps {
  readonly runtime: SceneRuntime;
}

export function Scene({ runtime }: SceneProps) {
  const rootNodeId = useRootNodeId(runtime.document);
  if (!rootNodeId) return <div>Error: The scene is empty.</div>;
  const NodeAdapter = runtime.getAdapterComponent(rootNodeId);
  return <NodeAdapter />;
}
