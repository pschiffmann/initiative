import { SceneDocument, useSceneDocumentVersion } from "#shared";
import { NodeSchema } from "@initiativejs/schema";
import { ReactNode, createContext, useContext, useMemo } from "react";

export interface Ancestor {
  readonly nodeId: string;
  readonly slotName: string;
  readonly schema: NodeSchema;
}

const SelectedNodeAncestorsContext = createContext<readonly Ancestor[]>([]);

export interface SelectedNodeAncestorsProviderProps {
  document: SceneDocument;
  selectedNode: string;
  children: ReactNode;
}

export function SelectedNodeAncestorsProvider({
  document,
  selectedNode,
  children,
}: SelectedNodeAncestorsProviderProps) {
  useSceneDocumentVersion(document);
  const ancestors = useMemo(
    () =>
      document.getAncestors(selectedNode).map(({ nodeId, slotName }) => ({
        nodeId,
        slotName,
        schema: document.getNode(nodeId).schema,
      })),
    [document, selectedNode],
  );
  return (
    <SelectedNodeAncestorsContext.Provider value={ancestors}>
      {children}
    </SelectedNodeAncestorsContext.Provider>
  );
}

export function useSelectedNodeAncestors(): readonly Ancestor[] {
  return useContext(SelectedNodeAncestorsContext);
}
