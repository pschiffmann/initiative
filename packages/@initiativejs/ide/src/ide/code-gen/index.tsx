import { SceneDocument } from "#shared";
import { ImportNames } from "./imports.js";
import { generateNodeRuntime } from "./node.js";
import { generateEmptyScene, generateScene } from "./scene.js";

export function generateCodeForScene(document: SceneDocument): string {
  if (!document.getRootNodeId()) return generateEmptyScene(document.name);

  const importNames = new ImportNames();
  const content = [
    generateScene(document),
    ...document
      .keys()
      .map((nodeId) => generateNodeRuntime(document, importNames, nodeId)),
  ].join("\n\n");
  return importNames.generateImportStatements() + "\n\n" + content;
}
