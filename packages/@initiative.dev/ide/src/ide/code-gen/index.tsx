import { SceneDocument } from "#shared";
import { generateFtlSceneSupport } from "./fluent.js";
import { NameResolver } from "./name-resolver.js";
import { generateNodeRuntime } from "./node.js";
import { generateEmptyScene, generateSceneWithSceneInputs } from "./scene.js";

export function generateCodeForScene(document: SceneDocument): string {
  if (!document.getRootNodeId()) return generateEmptyScene(document.name);

  const nameResolver = new NameResolver();
  const content = [
    generateSceneWithSceneInputs(document, nameResolver),
    ...document
      .keys()
      .map((nodeId) => generateNodeRuntime(document, nameResolver, nodeId)),
    document.projectConfig.locales
      ? generateFtlSceneSupport(document.projectConfig.locales, nameResolver)
      : "",
  ].join("\n\n");
  return nameResolver.generateImportStatements() + "\n\n" + content;
}
