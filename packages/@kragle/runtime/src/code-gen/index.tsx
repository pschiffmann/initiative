import { NodeDefinition } from "../node-definition.js";
import { SceneDocument } from "../scene-document/index.js";

export function generateCodeForScene(scene: SceneDocument): string {
  const rootNode = scene.getRootNodeId();
  if (!rootNode) {
    return generateEmptySceneComponent("The scene is empty.");
  } else if (scene.hasErrors) {
    return generateEmptySceneComponent(
      "Some nodes miss required slots or inputs."
    );
  }

  const usedNodeTypes = new Set<NodeDefinition>();
  const parts: string[] = [];
  const queue = [rootNode];
  function visitNode(nodeId: string) {
    const nodeJson = scene.getNode(nodeId)!;
    const nodeDefinition = scene.nodeDefinitions.get(nodeJson.type)!;
    usedNodeTypes.add(nodeDefinition);

    parts.push(generateNodeComponent(scene, nodeId));
    for (const slotName of Object.keys(nodeDefinition.schema.slots)) {
      if (nodeDefinition.schema.isCollectionSlot(slotName)) {
        queue.push(...nodeJson.collectionSlots[slotName]);
      } else {
        queue.push(nodeJson.slots[slotName] as string);
      }
    }
  }

  parts.push(generateSceneComponent(scene));
  for (let current = queue.shift(); !!current; current = queue.shift()) {
    visitNode(current);
  }

  return parts.join("\n\n");
}

function generateEmptySceneComponent(reason: string) {
  return `export function Scene() {
  return <div>Error: ${reason}</div>;
}`;
}

function generateImports(usedNodeTypes: ReadonlySet<NodeDefinition>): string {
  const importNames = [...usedNodeTypes]
    .map(({ importName }) => `  ${importName},`)
    .sort()
    .join("\n");
  return `import { memo } from "react";
import {
${importNames}
} from "../nodes.tsx";`;
}

function generateSceneComponent(scene: SceneDocument): string {
  return `export function Scene() {
  return <${scene.getRootNodeId()} />;
}`;
}

function generateNodeComponent(scene: SceneDocument, nodeId: string): string {
  const nodeJson = scene.getNode(nodeId)!;
  const nodeDefinition = scene.nodeDefinitions.get(nodeJson.type)!;

  return `function ${nodeId}() {
  const input_a = useContext();
  return <${nodeDefinition.importName} a={input_a} />
}`;
}
