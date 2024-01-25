import { StyleProps } from "@initiative.dev/schema";
import { CSSProperties, FunctionComponent } from "react";

import { useSlotNode } from "#shared";
import { ErrorComponent } from "./error-component.js";
import { SceneRuntime } from "./scene-runtime.js";

export function createSlotNodeAdapterComponent(
  runtime: SceneRuntime,
  nodeId: string,
) {
  const document = runtime.document;
  const nodeData = document.getSlotNode(nodeId);

  const result: FunctionComponent<StyleProps> = ({ className, style }) => {
    const nodeData = useSlotNode(document, nodeId);
    return nodeData.errors ? (
      <ErrorComponent
        className={className}
        style={style}
        title={`Error in node '${nodeId}':`}
        details={[...nodeData.errors.invalidInputs].map(
          (inputKey) => `Input '${inputKey}' has invalid value.`,
        )}
      />
    ) : (
      <div
        className={className}
        style={{
          ...style,
          ...rootStyle,
          width: nodeData.debugPreview.width,
          height: nodeData.debugPreview.height,
        }}
      >
        {nodeData.debugPreview.label}
      </div>
    );
  };
  result.displayName = `${nodeId}_Adapter`;
  return result;
}

const rootStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  overflow: "auto",
  background:
    "repeating-conic-gradient(#0004 0% 25%, transparent 0% 50%) 50% / 16px 16px",
  color: "#000",
  boxShadow: "0 0 2px #000 inset",
  textShadow: "0 0 2px #fff",
  fontFamily: "monospace",
};
