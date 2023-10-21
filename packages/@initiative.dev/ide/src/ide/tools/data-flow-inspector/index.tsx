import { Dialog, DialogCommand, bemClasses } from "#design-system";
import { SceneDocument } from "#shared";
import { CommandController } from "@initiative.dev/react-command";
import { useState } from "react";
import { Canvas } from "./canvas.js";

const cls = bemClasses("initiative-data-flow-inspector");

export interface DataFlowInspectorProps {
  controller: CommandController<DialogCommand>;
  document: SceneDocument;
  selectedNode: string | null;
}

export function DataFlowInspector({
  controller,
  document,
  selectedNode,
}: DataFlowInspectorProps) {
  const [zoom, setZoom] = useState(100);

  return (
    <Dialog className={cls.block()} commandStream={controller}>
      <Canvas
        className={cls.element("canvas")}
        document={document}
        selectedNode={selectedNode}
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
    </Dialog>
  );
}
