import { NodeDefinitions, Scene, SceneRuntime } from "@kragle/runtime";
import { useEffect, useState } from "react";
import { useIdeConnection } from "../stage-connection.js";

export interface StageProps {
  nodeDefinitions: NodeDefinitions;
}

export function Stage({ nodeDefinitions }: StageProps) {
  const document = useIdeConnection(nodeDefinitions);

  const [runtime, setRuntime] = useState<SceneRuntime>();
  useEffect(() => {
    if (document) setRuntime(new SceneRuntime(document));
  }, [document]);

  if (!runtime) return <div>Initializing ...</div>;
  return <Scene runtime={runtime} />;
}
