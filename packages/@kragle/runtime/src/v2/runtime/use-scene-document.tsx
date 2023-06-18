import { useCallback, useSyncExternalStore } from "react";
import { NodeData, SceneDocument } from "../scene-data/index.js";

export function useNode(document: SceneDocument, nodeId: string): NodeData {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document]
  );
  const getNode = useCallback(() => document.getNode(nodeId), [nodeId]);
  return useSyncExternalStore(onChange, getNode);
}

export function useRootNodeId(document: SceneDocument) {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document]
  );
  const getRootNodeId = useCallback(() => document.getRootNodeId(), []);
  return useSyncExternalStore(onChange, getRootNodeId);
}