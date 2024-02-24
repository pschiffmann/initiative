import { Dialog, DialogCommand, bemClasses } from "#design-system";
import { SceneDocument } from "#shared";
import { CommandController } from "@initiative.dev/react-command";
import { useState } from "react";
import { Canvas } from "./canvas.js";

const cls = bemClasses("initiative-data-flow-inspector");

export interface DataFlowInspectorProps {
  document: SceneDocument;
  selectedNode: string | null;
  onSelectedNodeChange(nodeId: string | null): void;
  className?: string;
  hidden?: boolean;
}

export function DataFlowInspector({
  className,
  document,
  selectedNode,
  onSelectedNodeChange,
  hidden,
}: DataFlowInspectorProps) {
  const [zoom, setZoom] = useState(100);

  return (
    <div
      className={cls.block(className)}
      style={{ visibility: hidden ? "hidden" : "visible" }}
    >
      <Canvas
        className={cls.element("canvas")}
        document={document}
        selectedNode={selectedNode}
        onSelectedNodeChange={onSelectedNodeChange}
        zoom={zoom / 100}
      />
      <label className={cls.element("controls")}>
        Zoom:
        <input
          className={cls.element("input")}
          type="range"
          min={1}
          max={100}
          step={1}
          value={zoom}
          onChange={(e) => setZoom(Number.parseInt(e.target.value))}
        />
      </label>
    </div>
  );
}
