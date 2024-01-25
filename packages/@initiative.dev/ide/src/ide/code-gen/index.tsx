import { ComponentNodeData, SceneDocument } from "#shared";
import { generateComponentNodeRuntime } from "./component-node.js";
import { generateFtlSceneSupport } from "./fluent.js";
import { NameResolver } from "./name-resolver.js";
import { generateEmptyScene, generateScene } from "./scene.js";
import { generateSlotNodeRuntime } from "./slot-node.js";

export function generateCodeForScene(document: SceneDocument): string {
  const nameResolver = new NameResolver();
  if (!document.getRootNodeId()) {
    return generateEmptyScene(document.name, nameResolver);
  }

  const content = [
    generateScene(document, nameResolver),
    ...document
      .keys()
      .reverse()
      .map((nodeId) =>
        document.getNode(nodeId) instanceof ComponentNodeData
          ? generateComponentNodeRuntime(document, nameResolver, nodeId)
          : generateSlotNodeRuntime(document, nameResolver, nodeId),
      ),
    document.projectConfig.locales
      ? generateFtlSceneSupport(document.projectConfig.locales, nameResolver)
      : "",
  ].join("\n\n");
  return nameResolver.generateImportStatements() + "\n\n" + content;
}
