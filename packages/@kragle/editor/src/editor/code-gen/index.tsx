import { SceneDocument } from "@kragle/runtime";
import { resolveUsedImports as resolveImports } from "./imports.js";
import { generateNodeRuntime } from "./node.js";
import { generateEmptyScene, generateScene } from "./scene.js";

export function generateCodeForScene(document: SceneDocument): string {
  if (!document.getRootNodeId()) {
    return generateEmptyScene(document.name);
  }

  const { importStatements, importNames } = resolveImports(document);
  return [
    importStatements,
    generateScene(document),
    ...document
      .keys()
      .map((nodeId) => generateNodeRuntime(document, importNames, nodeId)),
  ].join("\n\n");
}
