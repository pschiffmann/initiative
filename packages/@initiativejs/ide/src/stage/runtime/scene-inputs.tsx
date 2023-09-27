import { CSSProperties, ReactNode, createContext, useContext } from "react";
import { useSceneDocumentVersion } from "../../shared/use-scene-document.js";
import { SceneDocument } from "#shared";
import { evaluateExpression } from "./evaluate-expression.js";

export type SceneInputs = { readonly [inputName: string]: any };

const SceneInputsContext = createContext<SceneInputs>({});

const rootStyle: CSSProperties = {
  padding: 8,
  backgroundColor: "darkred",
  color: "white",
  fontFamily: "monospace",
};

export interface SceneInputsProviderProps {
  document: SceneDocument;
  children: ReactNode;
}

export function SceneInputsProvider({
  document,
  children,
}: SceneInputsProviderProps) {
  useSceneDocumentVersion(document);
  const sceneInputsWithMissingDebugValues: string[] = [];
  const sceneInputs: { [inputName: string]: any } = {};
  for (const [inputName, { debugValue }] of document.sceneInputs) {
    if (debugValue) {
      sceneInputs[inputName] = evaluateExpression(
        debugValue,
        document.definitions,
        {},
        {},
      );
    } else {
      sceneInputsWithMissingDebugValues.push(inputName);
    }
  }

  return sceneInputsWithMissingDebugValues.length !== 0 ? (
    <div style={rootStyle}>
      Missing scene input debug values:{" "}
      {sceneInputsWithMissingDebugValues.join(", ")}
    </div>
  ) : (
    <SceneInputsContext.Provider value={sceneInputs}>
      {children}
    </SceneInputsContext.Provider>
  );
}

export function useSceneInputs() {
  return useContext(SceneInputsContext);
}
