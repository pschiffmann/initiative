import { NodeDefinitions } from "../node-definition.js";
import { InputBindingJson, NodeJson } from "./node-json.js";
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

  const queue = new Set<string>([sceneJson.rootNode]);

  /**
   * Returns `true` if `nodeId` was sucessfully added to `SceneDocument`.
   */
  function discoverNode(
    nodeId: string,
    parent: { nodeId: string; slotName: string } | null
  ): boolean {
    const nodeJson = sceneJson.nodes[nodeId];
    if (!nodeJson) {
      errors.push(`Can't find node '${nodeId}'.`);
      return false;
    }
    try {
      const nodeType = nodeJson.type;
      sceneDocument.applyPatch(
        parent === null
          ? { type: "create-root-node", nodeType, nodeId }
          : {
              type: "create-node",
              nodeType,
              parentId: parent.nodeId,
              parentSlot: parent.slotName,
            }
      );
      return true;
    } catch (e) {
      errors.push(
        e instanceof Error
          ? e.message
          : `Error while adding node '${nodeId}' as ` +
              (parent !== null
                ? `child of node '${parent.nodeId}' in slot '${parent.slotName}'`
                : `root node`) +
              `: ${e}`
      );
      return false;
    }
  }

  /**
   * Reads the NodeJson for `nodeId` from `sceneJson`, adds all children to
   * `sceneDocument`, and binds the inputs for `nodeId`.
   */
  function processNode(nodeId: string) {
    // `nodeId` has been added to `sceneDocument` when this function is called,
    // so we know that `nodeJson` and `schema` exist.
    const nodeJson = sceneJson.nodes[nodeId];
    const { schema } = nodeDefinitions.get(nodeJson.type)!;

    function bindInput(
      inputName: string,
      binding: InputBindingJson,
      index?: number
    ) {
      try {
        sceneDocument.applyPatch({
          type: "bind-node-input",
          nodeId,
          inputName,
          index,
          binding,
        });
      } catch (e) {
        errors.push(
          e instanceof Error
            ? e.message
            : `Error while binding input '${inputName}` +
                (index !== undefined ? `/${index}` : "") +
                `' of node '${nodeId}': ${e}`
        );
      }
    }

    for (const [slotName, slotSchema] of Object.entries(schema.slots)) {
      if (schema.isCollectionSlot(slotName)) {
        const children = nodeJson.collectionSlots[slotName];
        if (!Array.isArray(children)) continue;

        let allChildrenAddedSuccessfully = true;
        for (const [index, child] of children) {
          allChildrenAddedSuccessfully &&= discoverNode(child, {
            nodeId,
            slotName,
          });
          if (!allChildrenAddedSuccessfully) continue;

          for (const inputName of Object.keys(slotSchema.inputs!)) {
            const binding = nodeJson.collectionInputs[inputName][index];
            if (binding) bindInput(inputName, binding, index);
          }
        }
      } else {
        const child = nodeJson.slots[slotName];
        if (typeof child === "string") {
          discoverNode(child, { nodeId, slotName });
        }
      }
    }

    for (const inputName of Object.keys(schema.inputs)) {
      const binding = nodeJson.inputs[inputName];
      if (binding) bindInput(inputName, binding);
    }
  }

  if (sceneJson.rootNode) {
    const nodeId = sceneJson.rootNode;
    try {
      const nodeJson = sceneJson.nodes[nodeId];
      if (!nodeJson) throw new Error(`Can't find node '${nodeId}'.`);
      sceneDocument.applyPatch({
        type: "create-root-node",
        nodeType: nodeJson.type,
        nodeId,
      });
      queue.add(sceneJson.rootNode);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : `${e}`);
    }
  }

  for (const nodeId of queue) {
    processNode(nodeId);
  }

  return { sceneDocument, errors };
}
