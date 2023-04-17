import { NodeDefinitions } from "../node-definition.js";
import { SceneDocument } from "./scene-document.js";
import { SceneJson } from "./scene-json.js";

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

  function processNode(nodeId: string) {}

  return { sceneDocument, errors };
}
