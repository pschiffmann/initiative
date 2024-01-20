import { StyleProps } from "@initiative.dev/schema";

import { useRootNodeId } from "#shared";
import { SceneInputsProvider } from "./ancestor-outputs.js";
import { ErrorComponent } from "./error-component.js";
import { SceneRuntime } from "./scene-runtime.js";

export interface SceneProps extends StyleProps {
  runtime: SceneRuntime;
  sceneInputs: ReadonlyMap<string, any>;
}

export function Scene({ className, style, runtime, sceneInputs }: SceneProps) {
  const rootNodeId = useRootNodeId(runtime.document);
  if (!rootNodeId) {
    return (
      <ErrorComponent
        className={className}
        style={style}
        title={`Error in scene '${runtime.document.name}':`}
        details={["The scene is empty."]}
      />
    );
  }

  const NodeAdapter = runtime.getAdapterComponent(rootNodeId);
  return (
    <SceneInputsProvider sceneInputs={sceneInputs}>
      <NodeAdapter />
    </SceneInputsProvider>
  );
}
