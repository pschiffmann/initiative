import { bemClasses } from "#design-system";
import { SceneDocument, sceneDocumentToJson } from "@kragle/runtime";
import { useEffect } from "react";
import {
  ConnectToEditorRequest,
  StageConnectionCommand,
} from "../../shared/stage-connection-command.js";

const cls = bemClasses("kragle-stage-view");

export interface StageViewProps {
  document: SceneDocument;
  className?: string;
}

export function StageView({ document, className }: StageViewProps) {
  useStageConnection(document);

  return (
    <div className={cls.block(className)}>
      <iframe className={cls.element("iframe")} src="./stage.html" />
    </div>
  );
}

function useStageConnection(document: SceneDocument) {
  useEffect(() => {
    const controller = new AbortController();
    const ports: MessagePort[] = [];

    window.addEventListener(
      "message",
      ({ data }: MessageEvent<ConnectToEditorRequest>) => {
        if (data.type !== "@kragle/editor.ConnectToEditorRequest") return;
        data.port.postMessage({
          type: "initialize-stage",
          sceneName: document.name,
          sceneJson: sceneDocumentToJson(document),
        } satisfies StageConnectionCommand);
        ports.push(data.port);
      },
      { signal: controller.signal }
    );

    const unsubscribeFromDocument = document.listen("patch", (patch) => {
      for (const port of ports) {
        port.postMessage(patch satisfies StageConnectionCommand);
      }
    });

    return () => {
      controller.abort();
      unsubscribeFromDocument();
    };
  }, []);
}
