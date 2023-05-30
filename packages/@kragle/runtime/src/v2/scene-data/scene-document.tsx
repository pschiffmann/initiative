import { Definitions, NodeSchema } from "../definitions/index.js";
import { Expression, ExpressionJson } from "./expression.js";
import { Listener, Listeners, Unsubscribe } from "./listeners.js";
import { NodeData, NodeParent } from "./node-data.js";

export type SceneDocumentPatch =
  | CreateNodePatch
  | DeleteNodePatch
  | RenameNodePatch
  | SetNodeInputPatch;

export interface CreateNodePatch {
  readonly type: "create-node";
  readonly nodeType: string;
  readonly parent?: Omit<NodeParent, "index">;
  readonly nodeId?: string;
}

export interface DeleteNodePatch {
  readonly type: "delete-node";
  readonly nodeId: string;
}

export interface RenameNodePatch {
  readonly type: "rename-node";
  readonly nodeId: string;
  readonly newId: string;
}

export interface SetNodeInputPatch {
  readonly type: "set-node-input";
  readonly nodeId: string;
  readonly expression: ExpressionJson | null;
  readonly inputName: string;
  readonly index?: number;
}

export class SceneDocument {
  constructor(readonly definitions: Definitions) {}

  #rootNodeId: string | null = null;
  #nodes = new Map<string, NodeData>();

  getRootNodeId(): string | null {
    return this.#rootNodeId;
  }

  /**
   * Throws an error if `nodeId` cannot be found.
   */
  getNode(nodeId: string): NodeData {
    const result = this.#nodes.get(nodeId);
    if (result) return result;
    throw new Error(`Node '${nodeId}' not found.`);
  }

  /**
   * Returns a node id that doesn't exist in this repository.
   */
  #generateNodeId(schema: NodeSchema): string {
    const [, prefix] = schema.name.split("::");
    for (let i = 1; ; i++) {
      const nodeId = `${prefix}${i}`;
      if (!this.#nodes.has(nodeId)) return nodeId;
    }
  }

  applyPatch(patch: SceneDocumentPatch): void {
    switch (patch.type) {
      case "create-node":
        patch.parent
          ? this.#createNode(patch, patch.parent)
          : this.#createRootNode(patch);
        break;
      case "delete-node":
        patch.nodeId === this.#rootNodeId
          ? this.#deleteRootNode()
          : this.#deleteNode(patch);
        break;
      case "rename-node":
        patch.nodeId === this.#rootNodeId
          ? this.#renameRootNode(patch)
          : this.#renameNode(patch);
        break;
      case "set-node-input":
        this.#setNodeInput(patch);
        break;
    }
    this.#patchListeners.notify(patch);
  }

  #createRootNode({ nodeType, nodeId }: CreateNodePatch): void {
    if (this.#rootNodeId !== null) {
      throw new Error("SceneDocument is not empty.");
    }
    const { schema } = this.definitions.getNode(nodeType);
    nodeId ??= this.#generateNodeId(schema);

    this.#nodes.set(nodeId, NodeData.empty(schema, nodeId, null));
    this.#rootNodeId = nodeId;

    this.#changeListeners.notify([nodeId]);
  }

  #createNode(
    { nodeType, nodeId: childId }: CreateNodePatch,
    { nodeId: parentId, slotName }: Omit<NodeParent, "index">
  ): void {
    const { schema } = this.definitions.getNode(nodeType);
    childId ??= this.#generateNodeId(schema);
    if (this.#nodes.has(childId)) {
      throw new Error(`A node with id '${childId}' already exists.`);
    }

    const [parentNode, movedChildren] = this.getNode(parentId).addChild(
      childId,
      slotName
    );
    const newChild = NodeData.empty(schema, childId, movedChildren[childId]);
    this.#nodes.set(parentId, parentNode);
    for (const [childId, nodeParent] of Object.entries(movedChildren)) {
      this.#nodes.set(
        childId,
        this.#nodes.get(childId)?.move(nodeParent) ?? newChild
      );
    }

    this.#changeListeners.notify([parentId, childId]);
  }

  #deleteRootNode(): void {
    const nodeIds = [...this.#nodes.keys()];
    this.#rootNodeId = null;
    this.#nodes.clear();

    this.#changeListeners.notify(nodeIds);
  }

  #deleteNode({ nodeId }: DeleteNodePatch): void {
    const node = this.getNode(nodeId);
    const [parentNode, movedChildren] = this.#nodes
      .get(node.parent!.nodeId)!
      .removeChild(node.parent!.slotName, node.parent!.index);

    const changedIds = [parentNode.id, nodeId];
    this.#nodes.set(parentNode.id, parentNode);
    for (const [childId, nodeParent] of Object.entries(movedChildren)) {
      changedIds.push(childId);
      this.#nodes.set(childId, this.#nodes.get(childId)!.move(nodeParent));
    }

    const deletedNodeIds = [node.id];
    for (const nodeId of deletedNodeIds) {
      changedIds.push(nodeId);
      this.#nodes.delete(nodeId);
      this.#nodes.get(nodeId)!.forEachSlot((childId) => {
        if (childId) deletedNodeIds.push(childId);
      });
    }

    this.#changeListeners.notify(changedIds);
  }

  #renameRootNode({ nodeId: oldId, newId }: RenameNodePatch): void {
    if (this.#nodes.has(newId)) {
      throw new Error(`A node with id '${newId}' already exists.`);
    }

    const [node, movedChildren] = this.getNode(oldId).rename(newId);

    this.#rootNodeId = newId;
    this.#nodes.set(newId, node);

    const descendants: string[] = [];
    for (const [childId, nodeParent] of Object.entries(movedChildren)) {
      descendants.push(childId);
      this.#nodes.set(childId, this.#nodes.get(childId)!.move(nodeParent));
    }

    for (const nodeId of descendants) {
      let node = this.#nodes.get(nodeId)!;
      node.forEachInput((expression, type, inputName, index) => {
        if (!expression) return;
        const newExpression = expression.map((expr) =>
          expr.type === "node-output" && expr.nodeId === oldId
            ? { ...expr, nodeId: newId }
            : expr
        );
        node = node.setInput(
          newExpression && new Expression(newExpression, type, this),
          inputName,
          index
        );
      });
    }

    this.#changeListeners.notify([oldId, newId, ...descendants]);
  }

  #renameNode({ nodeId: oldId, newId }: RenameNodePatch): void {
    throw new Error();
  }

  #setNodeInput({
    nodeId,
    expression,
    inputName,
    index,
  }: SetNodeInputPatch): void {
    throw new Error();
  }

  //
  // Listeners
  //

  #changeListeners = new Listeners<readonly string[]>();
  #patchListeners = new Listeners<SceneDocumentPatch>();

  listen(type: "change", listener: Listener<readonly string[]>): Unsubscribe;
  listen(type: "patch", listener: Listener<SceneDocumentPatch>): Unsubscribe;
  listen(type: "change" | "patch", listener: any): Unsubscribe {
    switch (type) {
      case "change":
        return this.#changeListeners.add(listener);
      case "patch":
        this.#patchListeners.add(listener);
      default:
        throw new Error(`Invalid type '${type}'.`);
    }
  }
}
