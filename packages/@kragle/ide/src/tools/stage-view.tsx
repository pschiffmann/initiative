import { SceneDocument } from "@kragle/runtime";
import { useRef } from "react";
import { useStageConnection } from "../stage-connection.js";

export interface StageViewProps {
  sceneDocument: SceneDocument;
}

export function StageView({ sceneDocument }: StageViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useStageConnection(iframeRef, sceneDocument);

  return (
    <iframe ref={iframeRef} className="scene-viewer" src="//localhost:5173/" />
  );
}
