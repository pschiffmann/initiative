import { SceneDocument } from "#shared";
import { ImportNames } from "./imports.js";
import { generateNodeRuntime } from "./node.js";
import {
  generateEmptyScene,
  generateSceneWithSceneInputs,
  generateSceneWithoutSceneInputs,
} from "./scene.js";

export function generateCodeForScene(document: SceneDocument): string {
  if (!document.getRootNodeId()) return generateEmptyScene(document.name);

  const importNames = new ImportNames();
  const content = [
    document.sceneInputs.size === 0
      ? generateSceneWithoutSceneInputs(document)
      : generateSceneWithSceneInputs(document, importNames),
    ...document
      .keys()
      .map((nodeId) => generateNodeRuntime(document, importNames, nodeId)),
  ].join("\n\n");
  return importNames.generateImportStatements() + "\n\n" + content;
}
