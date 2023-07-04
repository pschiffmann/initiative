import {
  Definitions,
  SceneDocument,
  SceneRuntime,
  sceneDocumentFromJson,
} from "@kragle/runtime/v2";
import * as $Promise from "@pschiffmann/std/promise";
import { useEffect, useState } from "react";
import {
  ConnectToEditorRequest,
  StageConnectionCommand,
} from "../shared/stage-connection-command.js";

export function useEditorConnection(definitions: Definitions) {
  const [runtime, setRuntime] = useState<SceneRuntime>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      // Don't run this effect twice in React dev mode.
      await $Promise.wait(100);
      if (signal.aborted) return;

      const { port1, port2 } = new MessageChannel();
      window.parent.postMessage(
        {
          type: "@kragle/editor.ConnectToEditorRequest",
          port: port1,
        } satisfies ConnectToEditorRequest,
        { transfer: [port1] }
      );

      let document: SceneDocument | undefined;
      port2.addEventListener(
        "message",
        ({ data }: MessageEvent<StageConnectionCommand>) => {
          if (data.type === "initialize-stage") {
            ({ document } = sceneDocumentFromJson(
              definitions,
              data.sceneName,
              data.sceneJson
            ));
            setRuntime(new SceneRuntime(document!));
          } else {
            document!.applyPatch(data);
          }
        },
        { signal }
      );
      port2.start();
    })();

    return () => {
      controller.abort();
      setRuntime(undefined);
    };
  }, []);

  return runtime;
}
