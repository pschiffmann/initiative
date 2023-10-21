import { SceneDocument, sceneDocumentFromJson } from "#shared";
import { Definitions } from "@initiative.dev/schema";
import * as $Promise from "@pschiffmann/std/promise";
import { useEffect, useState } from "react";
import {
  ConnectToEditorRequest,
  StageConnectionCommand,
} from "../shared/stage-connection-command.js";
import { SceneRuntime } from "./runtime/index.js";

export function useEditorConnection(definitions: Definitions) {
  const [runtime, setRuntime] = useState<SceneRuntime>();
  const [locale, setLocale] = useState("");

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
          type: "@initiative.dev/ide.ConnectToEditorRequest",
          port: port1,
        } satisfies ConnectToEditorRequest,
        { transfer: [port1] },
      );

      let document: SceneDocument | undefined;
      port2.addEventListener(
        "message",
        ({ data }: MessageEvent<StageConnectionCommand>) => {
          switch (data.type) {
            case "initialize-stage":
              ({ document } = sceneDocumentFromJson(
                definitions,
                data.projectConfig,
                data.sceneName,
                data.sceneJson,
              ));
              setRuntime(new SceneRuntime(document!));
              setLocale(data.projectConfig.locales?.[0] ?? "");
              break;
            case "set-locale":
              setLocale(data.locale);
              break;
            default:
              document!.applyPatch(data);
              break;
          }
        },
        { signal },
      );
      port2.start();
    })();

    return () => {
      controller.abort();
      setRuntime(undefined);
    };
  }, []);

  return { runtime, locale };
}
