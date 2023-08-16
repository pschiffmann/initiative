import { Definitions, NodeSchema } from "@initiativejs/schema";
import {
  Expression,
  ExpressionJson,
  ExpressionValidationContext,
} from "./expression.js";
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
  constructor(
    readonly name: string,
    readonly definitions: Definitions,
  ) {}

  #rootNodeId: string | null = null;
  #nodes = new Map<string, NodeData>();
  #version = 0;

  getRootNodeId(): string | null {
    return this.#rootNodeId;
  }

  hasNode(nodeId: string): boolean {
    return this.#nodes.has(nodeId);
  }

  getVersion(): number {
    return this.#version;
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
   * Returns all node ids in this document, in breadth-first iteration order.
   */
  keys(): string[] {
    if (!this.#rootNodeId) return [];

    const result = [this.#rootNodeId];
    for (const nodeId of result) {
      this.#nodes.get(nodeId)!.forEachSlot((childId) => {
        if (childId) result.push(childId);
      });
    }
    return result;
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
        this.#renameNode(patch);
        break;
      case "set-node-input":
        this.#setNodeInput(patch);
        break;
    }
    this.#version++;
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
    { nodeId: parentId, slotName }: Omit<NodeParent, "index">,
  ): void {
    const { schema } = this.definitions.getNode(nodeType);
    childId ??= this.#generateNodeId(schema);
    if (this.#nodes.has(childId)) {
      throw new Error(`A node with id '${childId}' already exists.`);
    }

    const [parentNode, movedChildren] = this.getNode(parentId).addChild(
      childId,
      slotName,
    );
    const newChild = NodeData.empty(schema, childId, movedChildren[childId]);
    this.#nodes.set(parentId, parentNode);
    for (const [childId, nodeParent] of Object.entries(movedChildren)) {
      this.#nodes.set(
        childId,
        this.#nodes.get(childId)?.move(nodeParent) ?? newChild,
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
      this.#nodes.get(nodeId)!.forEachSlot((childId) => {
        if (childId) deletedNodeIds.push(childId);
      });
      this.#nodes.delete(nodeId);
    }

    this.#changeListeners.notify(changedIds);
  }

  #renameNode({ nodeId: oldId, newId }: RenameNodePatch): void {
    if (this.#nodes.has(newId)) {
      throw new Error(`A node with id '${newId}' already exists.`);
    }
    const oldNode = this.getNode(oldId);
    const [newNode, movedChildren] = oldNode.rename(newId);
    this.#nodes.delete(oldId);
    this.#nodes.set(newId, newNode);

    const changedIds = [oldId, newId];

    if (oldNode.parent) {
      const { nodeId, slotName, index } = oldNode.parent;
      changedIds.push(nodeId);
      this.#nodes.set(
        nodeId,
        this.#nodes.get(nodeId)!.renameChild(newId, slotName, index),
      );
    } else {
      this.#rootNodeId = newId;
    }

    for (const [childId, parent] of Object.entries(movedChildren)) {
      this.#nodes.set(childId, this.#nodes.get(childId)!.move(parent));
      this.#updateNodeAfterAncestorRename(oldId, newId, childId, changedIds);
      if (!changedIds.includes(childId)) changedIds.push(childId);
    }

    this.#changeListeners.notify(changedIds);
  }

  /**
   * Replaces all references to `oldAncestorId` with `newAncestorId` in
   * `"node-output"` inputs of `node`, then updates `node` in `#nodes`.
   *
   * Adds `node` to `changedIds` in-place. Recurses into the children of `node`.
   */
  #updateNodeAfterAncestorRename(
    oldAncestorId: string,
    newAncestorId: string,
    nodeId: string,
    changedIds: string[],
  ): void {
    const oldNode = this.#nodes.get(nodeId)!;
    let newNode = oldNode;
    const ctx = this.#createExpressionValidationContext(oldNode);
    oldNode.forEachInput((oldExpression, type, inputName, index) => {
      if (!oldExpression) return;

      const newExpression = oldExpression.map((expr) =>
        expr.type === "node-output" && expr.nodeId === oldAncestorId
          ? { ...expr, nodeId: newAncestorId }
          : expr,
      );
      if (oldExpression.json === newExpression) return;

      newNode = newNode.setInput(
        newExpression && new Expression(newExpression, type, ctx),
        inputName,
        index,
      );
    });

    if (oldNode !== newNode) {
      this.#nodes.set(nodeId, newNode);
      changedIds.push(nodeId);
    }

    oldNode.forEachSlot((childId) => {
      if (!childId) return;
      this.#updateNodeAfterAncestorRename(
        oldAncestorId,
        newAncestorId,
        childId,
        changedIds,
      );
    });
  }

  #setNodeInput({
    nodeId,
    expression,
    inputName,
    index,
  }: SetNodeInputPatch): void {
    const oldNode = this.getNode(nodeId);
    const newNode = oldNode.setInput(
      expression &&
        new Expression(
          expression,
          oldNode.schema.inputTypes[inputName],
          this.#createExpressionValidationContext(oldNode),
        ),
      inputName,
      index,
    );
    this.#nodes.set(nodeId, newNode);

    this.#changeListeners.notify([nodeId]);
  }

  #createExpressionValidationContext(
    node: Pick<NodeData, "parent">,
    // newNodes?: ReadonlyMap<string, NodeData>
  ): ExpressionValidationContext {
    return {
      getEntity: (entityName) => {
        return this.definitions.entities.get(entityName) ?? null;
      },
      getLibraryMemberType: (libraryName, memberName) => {
        return (
          this.definitions.libraries.get(libraryName)?.schema.members[
            memberName
          ] ?? null
        );
      },
      getNodeOutputType: (nodeId, outputName) => {
        let { parent } = node;
        while (parent) {
          const parentNode = this.#nodes.get(parent.nodeId)!;
          if (parent.nodeId !== nodeId) {
            parent = parentNode.parent;
            continue;
          }

          const slotName = parentNode.schema.getScopedOutputSlot(outputName);
          if (slotName !== null && slotName !== parent.slotName) {
            throw new Error(
              `Output '${nodeId}::${outputName}' is not exposed to this node.`,
            );
          }
          return parentNode.schema.outputTypes[outputName];
        }
        throw new Error(`Node '${nodeId}' is not an ancestor of this node.`);
      },
      getSceneInputType: (inputName) => {
        throw new Error("Unimplemented");
      },
    };
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
        return this.#patchListeners.add(listener);
      default:
        throw new Error(`Invalid type '${type}'.`);
    }
  }
}
