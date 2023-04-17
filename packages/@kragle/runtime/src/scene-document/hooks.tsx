import { useCallback, useSyncExternalStore } from "react";
import { NodeErrors, SceneDocument } from "./scene-document.js";
import { NodeJson } from "./scene-json.js";

export function useRootNodeId(sceneDocument: SceneDocument): string | null {
  return useSyncExternalStore(
    sceneDocument.subscribe,
    sceneDocument.getRootNodeId
  );
}

export function useNode(
  sceneDocument: SceneDocument,
  nodeId: string
): NodeJson | null {
  return useSyncExternalStore(
    sceneDocument.subscribe,
    useCallback(() => sceneDocument.getNode(nodeId), [nodeId])
  );
}

export function useNodeErrors(
  sceneDocument: SceneDocument,
  nodeId: string
): NodeErrors | null {
  return useSyncExternalStore(
    sceneDocument.subscribe,
    useCallback(() => sceneDocument.getNodeErrors(nodeId), [nodeId])
  );
}
