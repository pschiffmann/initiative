import { NodeData, SceneDocument } from "../scene-data/index.js";

export function generateNodeAdapter(nodeData: NodeData): string {
  return ``;
}

export function generateNodeOutputProvider(
  document: SceneDocument,
  nodeId: string
): string {
  return ``;
}

export function generateNodeScopedOutputProvider(
  nodeId: string,
  slotName: string,
  index?: number
): string {
  return ``;
}
