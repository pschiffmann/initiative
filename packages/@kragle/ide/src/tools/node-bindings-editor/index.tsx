import { SceneDocument } from "@kragle/runtime";
import { useEffect, useRef, useState } from "react";
import { bemClasses } from "../../bem-classes.js";
import { NodeBindingsCanvas } from "./canvas.js";

const cls = bemClasses("bindings-editor");

interface NodeBindingsEditorProps {
  document: SceneDocument;
}

export function NodeBindingsEditor({ document }: NodeBindingsEditorProps) {
  const [zoom, setZoom] = useState(1);

  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    rootRef.current!.addEventListener(
      "wheel",
      (e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        setZoom((zoom) => {
          if (e.deltaY > 0 && zoom > 0.1) {
            return zoom - 0.025;
          } else if (e.deltaY < 0 && zoom < 1) {
            return zoom + 0.025;
          }
          return zoom;
        });
      },
      { passive: false, signal: controller.signal }
    );

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div ref={rootRef} className={cls.block()}>
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
