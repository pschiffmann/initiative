import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { SceneDocument } from "./scene-data/index.js";

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

export function useNode(document: SceneDocument, nodeId: string) {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document],
  );
  const getNode = useCallback(
    () => (document.hasNode(nodeId) ? document.getNode(nodeId) : null!),
    [document, nodeId],
  );
  return useSyncExternalStore(onChange, getNode);
}

export function useComponentNode(document: SceneDocument, nodeId: string) {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document],
  );
  const getNode = useCallback(
    () =>
      document.hasNode(nodeId) ? document.getComponentNode(nodeId) : null!,
    [document, nodeId],
  );
  return useSyncExternalStore(onChange, getNode);
}

export function useSlotNode(document: SceneDocument, nodeId: string) {
  const onChange = useCallback(
    (onStoreChange: () => void) => document.listen("change", onStoreChange),
    [document],
  );
  const getNode = useCallback(
    () => (document.hasNode(nodeId) ? document.getSlotNode(nodeId) : null!),
    [document, nodeId],
  );
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
