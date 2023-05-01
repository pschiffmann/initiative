import { NodeDefinitions, SceneDocument } from "@kragle/runtime";
import * as $Promise from "@pschiffmann/std/promise";
import {
  DependencyList,
  EffectCallback,
  RefObject,
  useEffect,
  useState,
} from "react";

/**
 * Connects to the IDE running in the parent window. Returns a SceneDocument
 * that is controlled by the IDE.
 */
export function useIdeConnection(
  nodeDefinitions: NodeDefinitions
): SceneDocument | null {
  const [document, setDocument] = useState<SceneDocument | null>(null);

  useStrictModeEffect(
    () => {
      const { port1: stagePort, port2: idePort } = new MessageChannel();
      const message: InitializeStageConnectionMessage = {
        type: "@kragle/ide/InitializeStageSceneDocument",
        port: idePort,
      };
      window.postMessage(message, "/", [idePort]);

      const document = new SceneDocument(nodeDefinitions);
      stagePort.onmessage = (e) => document.applyPatch(e.data);

      // TODO: Workaround for some weird race condition
      $Promise.wait(500).then(() => setDocument(document));

      return () => {
        setDocument(null);
      };
    },
    [nodeDefinitions],
    100
  );

  return document;
}

/**
 * Connects to the stage running in the `stageViewRef` iframe. Installs a
 * `sceneDocument.patchListener` that forwards all patches to the stage.
 */
export function useStageConnection(
  stageViewRef: RefObject<HTMLIFrameElement>,
  sceneDocument: SceneDocument
) {
  useStrictModeEffect(
    () => {
      const controller = new AbortController();
      const { signal } = controller;
      stageViewRef.current!.contentWindow!.addEventListener(
        "message",
        ({ data }) => {
          if (!isInitializeStageConnectionMessage(data)) return;
          controller.abort();
          const { port } = data;
          sceneDocument.patchListener = (patch) => port.postMessage(patch);
        },
        { signal }
      );

      return () => {
        controller.abort();
      };
    },
    [sceneDocument],
    50
  );
}

interface InitializeStageConnectionMessage {
  readonly type: "@kragle/ide/InitializeStageSceneDocument";
  readonly port: MessagePort;
}

function isInitializeStageConnectionMessage(
  message: any
): message is InitializeStageConnectionMessage {
  return message?.type === "@kragle/ide/InitializeStageSceneDocument";
}

/**
 * Same as `useEffect()`, but delay the effect execution by `delay`
 * milliseconds. `effect` will only run once, even in strict mode.
 */
function useStrictModeEffect(
  effect: EffectCallback,
  deps: DependencyList,
  delay: number
): void {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | void;

    (async () => {
      await $Promise.wait(delay);
      if (!cancelled) cleanup = effect();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, deps);
}
