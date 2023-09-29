import { SceneDocument, useSceneInputs } from "#shared";
import { createContext } from "react";
import { evaluateExpression } from "./evaluate-expression.js";

export type SceneInputs = { readonly [inputName: string]: any };

export const SceneInputsContext = createContext<SceneInputs>({});

export function useDebugValues(document: SceneDocument): SceneInputs | string {
  const sceneInputs = useSceneInputs(document);
  const missingDebugValues: string[] = [];
  const result: { [inputName: string]: any } = {};
  for (const [inputName, { debugValue }] of sceneInputs) {
    if (debugValue) {
      result[inputName] = evaluateExpression(
        debugValue,
        document.definitions,
        {},
        {},
      );
    } else {
      missingDebugValues.push(inputName);
    }
  }

  return missingDebugValues.length !== 0
    ? `Missing scene input debug values: ${missingDebugValues.join(", ")}`
    : result;
}
