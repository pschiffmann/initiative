import { NodeData, SceneDocument } from "../scene-data/index.js";
import { ImportNames } from "./imports.js";

export function generateNodeRuntime(
  document: SceneDocument,
  importNames: ImportNames,
  nodeId: string
): string {
  return `function ${nodeId}_Adapter() {
  return null; // TODO
}`;
}

function generateNodeAdapter(nodeData: NodeData): string {
  return ``;
}

function generateNodeOutputProvider(
  document: SceneDocument,
  nodeId: string
): string {
  return ``;
}

function generateNodeScopedOutputProvider(
  nodeId: string,
  slotName: string,
  index?: number
): string {
  return ``;
}
