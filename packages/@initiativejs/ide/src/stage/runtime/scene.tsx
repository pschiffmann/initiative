import { useRootNodeId } from "#shared";
import { rootStyle } from "./error-component.js";
import { SceneInputsContext, useDebugValues } from "./scene-inputs.js";
import { SceneRuntime } from "./scene-runtime.js";

export interface SceneProps {
  readonly runtime: SceneRuntime;
}

export function Scene({ runtime }: SceneProps) {
  const debugValues = useDebugValues(runtime.document);
  const rootNodeId = useRootNodeId(runtime.document);

  if (!rootNodeId) {
    return <div style={rootStyle}>Error: The scene is empty.</div>;
  } else if (typeof debugValues === "string") {
    return <div style={rootStyle}>{debugValues}</div>;
  }

  const NodeAdapter = runtime.getAdapterComponent(rootNodeId);
  return (
    <SceneInputsContext.Provider value={debugValues}>
      <NodeAdapter />
    </SceneInputsContext.Provider>
  );
}
