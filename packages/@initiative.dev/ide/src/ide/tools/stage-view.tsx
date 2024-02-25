import { SelectControl, bemClasses } from "#design-system";
import {
  ConnectToEditorRequest,
  SceneDocument,
  StageConnectionCommand,
  sceneDocumentToJson,
} from "#shared";
import { useContext, useEffect, useRef } from "react";
import { LocaleContext } from "../context.js";

const cls = bemClasses("initiative-stage-view");

export interface StageViewProps {
  document: SceneDocument;
  className?: string;
  focus: string;
}

export function StageView({ document, className, focus }: StageViewProps) {
  const { locales } = document.projectConfig;
  const selectedLocale = useContext(LocaleContext);

  useStageConnection(document, selectedLocale.value);

  return (
    <div
      className={cls.block(className)}
      style={{ visibility: focus === "preview" ? "visible" : "hidden" }}
    >
      <iframe className={cls.element("iframe")} src="./stage.html" />
      {locales && (
        <SelectControl
          className={cls.element("locale-select")}
          label="Locale"
          adornmentIcon="translate"
          dense
          getOptionLabel={(l) => l}
          noOptionSelectedLabel="-"
          options={locales}
          {...selectedLocale}
        />
      )}
    </div>
  );
}

function useStageConnection(document: SceneDocument, selectedLocale: string) {
  const onLocaleChangeRef = useRef<(value: string) => void>();
  useEffect(
    () => onLocaleChangeRef.current?.(selectedLocale),
    [selectedLocale],
  );

  useEffect(() => {
    const controller = new AbortController();
    const ports: MessagePort[] = [];

    window.addEventListener(
      "message",
      ({ data }: MessageEvent<ConnectToEditorRequest>) => {
        if (data.type !== "@initiative.dev/ide.ConnectToEditorRequest") return;
        data.port.postMessage({
          type: "initialize-stage",
          projectConfig: document.projectConfig,
          sceneName: document.name,
          sceneJson: sceneDocumentToJson(document),
        } satisfies StageConnectionCommand);
        ports.push(data.port);
      },
      { signal: controller.signal },
    );

    const unsubscribeFromDocument = document.listen("patch", (patch) => {
      for (const port of ports) {
        port.postMessage(patch satisfies StageConnectionCommand);
      }
    });

    onLocaleChangeRef.current = (locale) => {
      for (const port of ports) {
        port.postMessage({
          type: "set-locale",
          locale,
        } satisfies StageConnectionCommand);
      }
    };

    return () => {
      controller.abort();
      unsubscribeFromDocument();
    };
  }, []);
}
