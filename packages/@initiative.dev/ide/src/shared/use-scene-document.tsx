import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import {
  ComponentNodeData,
  SceneDocument,
  SlotNodeData,
} from "./scene-data/index.js";

const SceneDocumentContext = createContext<SceneDocument>(null!);

export interface SceneDocumentProviderProps {
  document: SceneDocument;
  children: ReactNode;
}

export function SceneDocumentProvider({
  document,
  children,
}: SceneDocumentProviderProps) {
  return (
    <SceneDocumentContext.Provider value={document}>
      {children}
    </SceneDocumentContext.Provider>
  );
}

export function useSceneDocument() {
  return useContext(SceneDocumentContext);
}

export function useSceneInputs(document: SceneDocument) {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document],
  );
  const getSceneInputs = useCallback(() => document.sceneInputs, []);
  return useSyncExternalStore(onChange, getSceneInputs);
}

export function useNode(
  document: SceneDocument,
  nodeId: string,
  assertExists?: true,
): ComponentNodeData | SlotNodeData;
export function useNode(
  document: SceneDocument,
  nodeId: string | null,
  assertExists: false,
): ComponentNodeData | SlotNodeData | null;
export function useNode(
  document: SceneDocument,
  nodeId: string | null,
  assertExists = false,
): ComponentNodeData | SlotNodeData | null {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document],
  );
  const getNode = useCallback(() => {
    if (!assertExists && (!nodeId || !document.hasNode(nodeId))) return null;
    return document.getNode(nodeId!);
  }, [document, nodeId, assertExists]);
  return useSyncExternalStore(onChange, getNode);
}

export function useComponentNode(
  document: SceneDocument,
  nodeId: string,
  assertExists?: true,
): ComponentNodeData;
export function useComponentNode(
  document: SceneDocument,
  nodeId: string | null,
  assertExists: false,
): ComponentNodeData | null;
export function useComponentNode(
  document: SceneDocument,
  nodeId: string | null,
  assertExists = false,
): ComponentNodeData | null {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document],
  );
  const getNode = useCallback(() => {
    if (!assertExists && (!nodeId || !document.hasNode(nodeId))) return null;
    return document.getComponentNode(nodeId!);
  }, [document, nodeId, assertExists]);
  return useSyncExternalStore(onChange, getNode);
}

export function useSlotNode(
  document: SceneDocument,
  nodeId: string,
  assertExists?: true,
): SlotNodeData;
export function useSlotNode(
  document: SceneDocument,
  nodeId: string | null,
  assertExists: true,
): SlotNodeData | null;
export function useSlotNode(
  document: SceneDocument,
  nodeId: string | null,
  assertExists = false,
): SlotNodeData | null {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document],
  );
  const getNode = useCallback(() => {
    if (!assertExists && (!nodeId || !document.hasNode(nodeId))) return null;
    return document.getSlotNode(nodeId!);
  }, [document, nodeId, assertExists]);
  return useSyncExternalStore(onChange, getNode);
}

export function useRootNodeId(document: SceneDocument) {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document],
  );
  const getRootNodeId = useCallback(() => document.getRootNodeId(), []);
  return useSyncExternalStore(onChange, getRootNodeId);
}

export function useSceneDocumentVersion(document: SceneDocument) {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document],
  );
  const getVersion = useCallback(() => document.getVersion(), []);
  return useSyncExternalStore(onChange, getVersion);
}
