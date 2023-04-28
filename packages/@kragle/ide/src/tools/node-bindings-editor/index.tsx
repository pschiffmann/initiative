import { SceneDocument } from "@kragle/runtime";
import { useState } from "react";
import { bemClasses } from "../../bem-classes.js";
import { NodeBindingsCanvas } from "./canvas.js";

const cls = bemClasses("bindings-editor");

interface NodeBindingsEditorProps {
  document: SceneDocument;
}

export function NodeBindingsEditor({ document }: NodeBindingsEditorProps) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className={cls.block()}>
      <NodeBindingsCanvas zoom={zoom} document={document} />
      <div className={cls.element("canvas-shadow")} />
      <div className={cls.element("zoom-control")}>
        zoom:
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
