import { ReactElement } from "react";
import { OutputValuesProvider } from "./bindings.js";
import { SceneRuntime } from "./scene-runtime.js";

export interface SlotElement {
  readonly nodeId: string;
  readonly element: (o: {
    key: string;
    [outputName: string]: unknown;
  }) => ReactElement;
}

export function slotElement(
  sceneRuntime: SceneRuntime,
  childNodeId: string,
  key: string = childNodeId
) {
  const ChildComponent = sceneRuntime.getNodeComponent(childNodeId);
  return <ChildComponent key={key} />;
}

export function slotElementWithOutputs(
  sceneRuntime: SceneRuntime,
  parentNodeId: string,
  childNodeId: string,
  key: string = childNodeId,
  outputs: Record<string, unknown>
) {
  const ChildComponent = sceneRuntime.getNodeComponent(childNodeId);
  // TODO: Set `displayName` of this component to `<parentNodeId><slotName>OutputsProvider`.
  return (
    <OutputValuesProvider key={key} nodeId={parentNodeId} outputs={outputs}>
      <ChildComponent />
    </OutputValuesProvider>
  );
}
