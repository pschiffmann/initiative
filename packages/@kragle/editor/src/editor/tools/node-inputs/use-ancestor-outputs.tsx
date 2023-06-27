import { t } from "@kragle/runtime";
import {
  NodeData,
  NodeOutputExpressionJson,
  SceneDocument,
  useSceneDocumentVersion,
} from "@kragle/runtime/v2";

export interface AncestorOutput {
  readonly expression: NodeOutputExpressionJson;
  readonly type: t.KragleType;
}

export function useAncestorOutputs(
  document: SceneDocument,
  nodeData: NodeData
): readonly AncestorOutput[] {
  useSceneDocumentVersion(document);

  const result: AncestorOutput[] = [];

  let current = nodeData.parent;
  while (current) {
    const { nodeId, slotName } = current;
    const parentNodeData = document.getNode(nodeId);
    parentNodeData.schema.forEachOutput((type, outputName, outputScope) => {
      if (!outputScope || slotName === outputScope) {
        result.push({
          expression: { type: "node-output", nodeId, outputName },
          type,
        });
      }
    });
    current = parentNodeData.parent;
  }

  return result.reverse();
}
