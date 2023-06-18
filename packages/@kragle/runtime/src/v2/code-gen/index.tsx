import { SceneDocument } from "../scene-data/index.js";
import { resolveUsedImports as resolveImports } from "./imports.js";
import { generateNodeRuntime } from "./node.js";
import { generateEmptyScene, generateScene } from "./scene.js";

export function generateCodeForScene(
  name: string,
  document: SceneDocument
): string {
  if (!document.getRootNodeId()) {
    return generateEmptyScene(name);
  }

  const { importStatements, importNames } = resolveImports(document);
  return [
    importStatements,
    generateScene(name, document),
    document
      .keys()
      .map((nodeId) => generateNodeRuntime(document, importNames, nodeId)),
  ].join("\n\n");
}
