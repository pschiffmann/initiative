import { Definitions, NodeSchema, t } from "@initiativejs/schema";
import { ProjectConfig } from "../project-config.js";
import {
  Expression,
  ExpressionJson,
  MemberAccessExpression,
  ValidateExpressionContext,
} from "./expression.js";
import { Listener, Listeners, Unsubscribe } from "./listeners.js";
import { NodeData, NodeParent } from "./node-data.js";
import { SceneInputJson } from "./serialization.js";

export type SceneDocumentPatch =
  | SetSceneInputPatch
  | CreateNodePatch
  | DeleteNodePatch
  | RenameNodePatch
  | SetNodeInputPatch;

export interface SetSceneInputPatch {
  readonly type: "set-scene-input";
  readonly inputName: string;
  readonly inputJson: SceneInputJson | null;
}

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

/**
 * Contains the scene input names and node ids that were changed by a patch.
 *
 * If a node was renamed, `nodeIds` contains both the old and new node id. If a
 * node was deleted, contains all subtree node ids.
 */
export interface SceneDocumentChangeSet {
  readonly sceneInputs?: readonly string[];
  readonly nodeIds?: readonly string[];
}

export interface SceneInputData {
  readonly type: t.Type;
  readonly doc: string;
  readonly debugValue: Expression | null;
}

export class SceneDocument {
  constructor(
    readonly name: string,
    readonly definitions: Definitions,
    readonly projectConfig: ProjectConfig,
  ) {}

  #sceneInputs: ReadonlyMap<string, SceneInputData> = new Map();
  #rootNodeId: string | null = null;
  #nodes = new Map<string, NodeData>();
  #version = 0;

  get sceneInputs(): ReadonlyMap<string, SceneInputData> {
    return this.#sceneInputs;
  }

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
   * Returns the ancestors of `nodeId`, excluding `nodeId` itself, with the root
   * node at index 0.
   */
  getAncestors(nodeId: string): NodeParent[] {
    const result: NodeParent[] = [];
    for (let current = this.getNode(nodeId).parent; current; ) {
      result.push(current);
      current = this.getNode(current.nodeId).parent;
    }
    return result.reverse();
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
      case "set-scene-input":
        this.#setSceneInput(patch);
        break;
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

  #setSceneInput({ inputName, inputJson }: SetSceneInputPatch): void {
    const oldData = this.#sceneInputs.get(inputName);
    if (inputJson) {
      const type = t.fromJson(inputJson.type, this.definitions);
      if (oldData && oldData.type !== type) {
        throw new Error(`Can't change type of scene input '${inputName}'.`);
      }

      const ctx: ValidateExpressionContext = {
        locales: this.projectConfig.locales,
        getJsonLiteralSchema: (schemaName) => {
          return this.definitions.getJsonLiteral(schemaName);
        },
        getExtensionMethodDefinition: (schemaName) => {
          return this.definitions.getExtensionMethod(schemaName);
        },
        getNodeOutputType() {
          throw new Error(
            `Debug value for scene input '${inputName}' can't be connected ` +
              `to node outputs.`,
          );
        },
        getSceneInputType() {
          throw new Error(
            `Debug value for scene input '${inputName}' can't be connected ` +
              `to scene inputs.`,
          );
        },
        getDebugValueType: (debugValueName) => {
          return this.definitions.getDebugValue(debugValueName).type;
        },
      };
      const newData: SceneInputData = {
        type,
        doc: inputJson.doc,
        debugValue:
          inputJson.debugValue &&
          Expression.fromJson(inputJson.debugValue, type, ctx),
      };
      const sceneInputs = new Map(this.#sceneInputs);
      sceneInputs.set(inputName, newData);
      this.#sceneInputs = sceneInputs;
    } else {
      throw new Error(`Scene inputs can't be deleted.`);
    }
    this.#changeListeners.notify({ sceneInputs: [inputName] });
  }

  #createRootNode({ nodeType, nodeId }: CreateNodePatch): void {
    if (this.#rootNodeId !== null) {
      throw new Error("SceneDocument is not empty.");
    }
    const { schema } = this.definitions.getNode(nodeType);
    nodeId ??= this.#generateNodeId(schema);

    this.#nodes.set(nodeId, NodeData.empty(schema, nodeId, null));
    this.#rootNodeId = nodeId;

    this.#changeListeners.notify({ nodeIds: [nodeId] });
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

    this.#changeListeners.notify({ nodeIds: [parentId, childId] });
  }

  #deleteRootNode(): void {
    const nodeIds = [...this.#nodes.keys()];
    this.#rootNodeId = null;
    this.#nodes.clear();

    this.#changeListeners.notify({ nodeIds });
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

    this.#changeListeners.notify({ nodeIds: changedIds });
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

    this.#changeListeners.notify({ nodeIds: changedIds });
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
    const ctx = this.#createValidateExpressionContext(oldNode);
    oldNode.forEachInput((oldExpression, { type }, inputName, index) => {
      if (!(oldExpression instanceof MemberAccessExpression)) return;
      const newExpression = oldExpression.replaceNodeOutput(
        oldAncestorId,
        newAncestorId,
      );
      if (!newExpression) return;

      newNode = newNode.setInput(
        Expression.fromJson(newExpression, type, ctx),
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
        Expression.fromJson(
          expression,
          oldNode.schema.getInputAttributes(inputName).type,
          this.#createValidateExpressionContext(oldNode),
        ),
      inputName,
      index,
    );
    this.#nodes.set(nodeId, newNode);

    this.#changeListeners.notify({ nodeIds: [nodeId] });
  }

  #createValidateExpressionContext(
    node: Pick<NodeData, "parent">,
    // newNodes?: ReadonlyMap<string, NodeData>
  ): ValidateExpressionContext {
    return {
      locales: this.projectConfig.locales,
      getJsonLiteralSchema: (schemaName) => {
        return this.definitions.getJsonLiteral(schemaName);
      },
      getExtensionMethodDefinition: (schemaName) => {
        return this.definitions.getExtensionMethod(schemaName);
      },
      getNodeOutputType: (nodeId, outputName) => {
        let { parent } = node;
        while (parent) {
          const parentNode = this.#nodes.get(parent.nodeId)!;
          if (parent.nodeId !== nodeId) {
            parent = parentNode.parent;
            continue;
          }

          const { type, slot } =
            parentNode.schema.getOutputAttributes(outputName);
          if (slot && slot !== parent.slotName) {
            throw new Error(
              `Output '${nodeId}::${outputName}' is not exposed to this node.`,
            );
          }
          return type;
        }
        throw new Error(`Node '${nodeId}' is not an ancestor of this node.`);
      },
      getSceneInputType: (inputName) => {
        const inputData = this.#sceneInputs.get(inputName);
        if (!inputData) {
          throw new Error(`Scene input '${inputName}' doesn't exist.`);
        }
        return inputData.type;
      },
      getDebugValueType() {
        throw new Error(
          `Expressions of type 'debug-value' are not assignable to node inputs.`,
        );
      },
    };
  }

  //
  // Listeners
  //

  #changeListeners = new Listeners<SceneDocumentChangeSet>();
  #patchListeners = new Listeners<SceneDocumentPatch>();

  listen(
    type: "change",
    listener: Listener<SceneDocumentChangeSet>,
  ): Unsubscribe;
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
