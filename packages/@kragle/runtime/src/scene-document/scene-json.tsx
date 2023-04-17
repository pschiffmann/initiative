import { NodeDefinitions } from "../node-definition.js";
import { NodeJson } from "./node-json.js";
import { SceneDocument } from "./scene-document.js";

export interface SceneJson {
  readonly rootNode: string;
  readonly nodes: Readonly<Record<string, NodeJson>>;
}

export interface ParseSceneJsonResult {
  readonly sceneDocument: SceneDocument;
  readonly errors: readonly string[];
}

export function parseSceneJson(
  nodeDefinitions: NodeDefinitions,
  sceneJson: SceneJson
): ParseSceneJsonResult {
  const sceneDocument = new SceneDocument(nodeDefinitions);
  const errors: string[] = [];

  const queue = new Set<string>();

  function processNode(nodeId: string) {
    const nodeJson = sceneJson.nodes[nodeId];
    for (const [slotName, children] of Object.entries(nodeJson.slots)) {
      if (Array.isArray(children)) {
        for (const [index, child] of children.entries()) {
          const childJson = sceneJson.nodes[child];
          if (!childJson) {
            errors.push(
              `Node '${nodeId}', slot '${slotName}/${index}': ` +
                `Can't find node ${child}`
            );
            continue;
          }

          try {
            // sceneDocument.applyPatch({
            //   type: "create-node",
            //   nodeType: nodeJson.type,
            // });
          } catch (e) {
            errors.push(``);
          }
        }
      }
    }
  }

  return { sceneDocument, errors };
}
