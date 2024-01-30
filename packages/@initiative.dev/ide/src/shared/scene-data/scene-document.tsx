import { Definitions, t } from "@initiative.dev/schema";
import { validateSceneInputName } from "@initiative.dev/schema/internals";
import { capitalize } from "@pschiffmann/std/string";
import { ProjectConfig } from "../project-config.js";
import { ComponentNodeData, NodeParent } from "./component-node.js";
import {
  Expression,
  ExpressionJson,
  ValidateExpressionContext,
} from "./expression.js";
import { Listener, Listeners, Unsubscribe } from "./listeners.js";
import { SceneInputJson } from "./serialization.js";
import { SlotNodeData, SlotNodeJson } from "./slot-node.js";

export type SceneDocumentPatch =
  | SetSceneInputPatch
  | CreateComponentNodePatch
  | CreateSlotNodePatch
  | DeleteNodePatch
  | RenameNodePatch
  | SetComponentNodeInputPatch
  | SetSlotNodeDebugPreviewPatch
  | CreateSlotNodeOutputPatch
  | DeleteSlotNodeOutputPatch
  | SetSlotNodeOutputPatch;

export interface SetSceneInputPatch {
  readonly type: "set-scene-input";
  readonly inputName: string;
  readonly inputJson: SceneInputJson | null;
}

export interface CreateComponentNodePatch {
  readonly type: "create-component-node";
  readonly nodeType: string;
  readonly parent?: Omit<NodeParent, "index">;
  readonly nodeId?: string;
}

export interface CreateSlotNodePatch {
  readonly type: "create-slot-node";
  readonly debugPreview?: SlotNodeJson["debugPreview"];
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

export interface SetComponentNodeInputPatch {
  readonly type: "set-component-node-input";
  readonly nodeId: string;
  readonly expression: ExpressionJson | null;
  readonly inputName: string;
  readonly index?: number;
}

export interface SetSlotNodeDebugPreviewPatch {
  readonly type: "set-slot-node-debug-preview";
  readonly nodeId: string;
  readonly debugPreview: SlotNodeJson["debugPreview"];
}

export interface CreateSlotNodeOutputPatch {
  readonly type: "create-slot-node-output";
  readonly nodeId: string;
  readonly outputName: string;
  readonly outputType: t.TypeJson;
  readonly expression: ExpressionJson | null;
}

export interface DeleteSlotNodeOutputPatch {
  readonly type: "delete-slot-node-output";
  readonly nodeId: string;
  readonly outputName: string;
}

export interface SetSlotNodeOutputPatch {
  readonly type: "set-slot-node-output";
  readonly nodeId: string;
  readonly outputName: string;
  readonly expression: ExpressionJson | null;
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
  #nodes = new Map<string, ComponentNodeData | SlotNodeData>();
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
  getNode(nodeId: string): ComponentNodeData | SlotNodeData {
    const result = this.#nodes.get(nodeId);
    if (result) return result;
    throw new Error(`Node '${nodeId}' not found.`);
  }

  getComponentNode(nodeId: string): ComponentNodeData {
    const result = this.getNode(nodeId);
    if (result instanceof ComponentNodeData) return result;
    throw new Error(`Node '${nodeId}' is not a component node.`);
  }

  getSlotNode(nodeId: string): SlotNodeData {
    const result = this.getNode(nodeId);
    if (result instanceof SlotNodeData) return result;
    throw new Error(`Node '${nodeId}' is not a slot node.`);
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
      const node = this.#nodes.get(nodeId);
      if (!(node instanceof ComponentNodeData)) continue;
      node.forEachSlot((childId) => {
        if (childId) result.push(childId);
      });
    }
    return result;
  }

  /**
   * Returns a node id that doesn't exist in this repository.
   */
  generateNodeId(prefix: string): string {
    for (let i = 1; ; i++) {
      const nodeId = `${prefix}${i !== 1 ? i : ""}`;
      if (!this.#nodes.has(nodeId)) return nodeId;
    }
  }

  applyPatch(patch: SceneDocumentPatch): void {
    switch (patch.type) {
      case "set-scene-input":
        this.#setSceneInput(patch);
        break;
      case "create-component-node":
        patch.parent
          ? this.#createComponentNode(patch, patch.parent)
          : this.#createRootComponentNode(patch);
        break;
      case "create-slot-node":
        patch.parent
          ? this.#createSlotNode(patch, patch.parent)
          : this.#createRootSlotNode(patch);
        break;
      case "delete-node":
        patch.nodeId === this.#rootNodeId
          ? this.#deleteRootNode()
          : this.#nodes.get(patch.nodeId) instanceof ComponentNodeData
          ? this.#deleteComponentNode(patch)
          : this.#deleteSlotNode(patch);
        break;
      case "rename-node":
        this.#nodes.get(patch.nodeId) instanceof ComponentNodeData
          ? this.#renameComponentNode(patch)
          : this.#renameSlotNode(patch);
        break;
      case "set-component-node-input":
        this.#setComponentNodeInput(patch);
        break;
      case "set-slot-node-debug-preview":
        this.#setSlotNodeDebugPreview(patch);
        break;
      case "create-slot-node-output":
        this.#createSlotNodeOutput(patch);
        break;
      case "delete-slot-node-output":
        this.#deleteSlotNodeOutput(patch);
        break;
      case "set-slot-node-output":
        this.#setSlotNodeOutput(patch);
        break;
    }
    this.#version++;
    this.#patchListeners.notify(patch);
  }

  #setSceneInput({ inputName, inputJson }: SetSceneInputPatch): void {
    validateSceneInputName(inputName);
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

  #createRootComponentNode({
    nodeType,
    nodeId,
  }: CreateComponentNodePatch): void {
    if (this.#rootNodeId !== null) {
      throw new Error("SceneDocument is not empty.");
    }
    const { schema } = this.definitions.getNode(nodeType);
    nodeId ??= this.generateNodeId(schema.name.split("::")[1]);

    this.#nodes.set(nodeId, ComponentNodeData.empty(schema, nodeId, null));
    this.#rootNodeId = nodeId;

    this.#changeListeners.notify({ nodeIds: [nodeId] });
  }

  #createComponentNode(
    { nodeType, nodeId: childId }: CreateComponentNodePatch,
    { nodeId: parentId, slotName }: Omit<NodeParent, "index">,
  ): void {
    const { schema } = this.definitions.getNode(nodeType);
    childId ??= this.generateNodeId(schema.name.split("::")[1]);
    if (this.#nodes.has(childId)) {
      throw new Error(`A node with id '${childId}' already exists.`);
    }

    const [parentNode, movedChildren] = this.getComponentNode(
      parentId,
    ).addChild(childId, slotName);
    const newChild = ComponentNodeData.empty(
      schema,
      childId,
      movedChildren[childId],
    );
    this.#nodes.set(parentId, parentNode);
    for (const [childId, nodeParent] of Object.entries(movedChildren)) {
      this.#nodes.set(
        childId,
        this.#nodes.get(childId)?.move(nodeParent) ?? newChild,
      );
    }

    this.#changeListeners.notify({ nodeIds: [parentId, childId] });
  }

  #createRootSlotNode({ nodeId, debugPreview }: CreateSlotNodePatch): void {
    if (this.#rootNodeId !== null) {
      throw new Error("SceneDocument is not empty.");
    }
    nodeId ??= this.generateNodeId("Child");

    this.#nodes.set(
      nodeId,
      SlotNodeData.empty(nodeId, debugPreview ?? null, null),
    );
    this.#rootNodeId = nodeId;

    this.#changeListeners.notify({ nodeIds: [nodeId] });
  }

  #createSlotNode(
    { nodeId: childId, debugPreview }: CreateSlotNodePatch,
    { nodeId: parentId, slotName }: Omit<NodeParent, "index">,
  ): void {
    childId ??= this.generateNodeId(capitalize(slotName) + "Slot");
    if (this.#nodes.has(childId)) {
      throw new Error(`A node with id '${childId}' already exists.`);
    }

    const [parentNode, movedChildren] = this.getComponentNode(
      parentId,
    ).addChild(childId, slotName);
    const newChild = SlotNodeData.empty(
      childId,
      debugPreview ?? null,
      movedChildren[childId],
    );
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

  #deleteComponentNode({ nodeId }: DeleteNodePatch): void {
    const node = this.getComponentNode(nodeId);
    const [parentNode, movedChildren] = (
      this.#nodes.get(node.parent!.nodeId) as ComponentNodeData
    ).removeChild(node.parent!.slotName, node.parent!.index);

    const changedIds = [parentNode.id];
    this.#nodes.set(parentNode.id, parentNode);
    for (const [childId, nodeParent] of Object.entries(movedChildren)) {
      changedIds.push(childId);
      this.#nodes.set(childId, this.#nodes.get(childId)!.move(nodeParent));
    }

    const deletedNodeIds = [node.id];
    for (const nodeId of deletedNodeIds) {
      changedIds.push(nodeId);
      const node = this.#nodes.get(nodeId);
      if (!(node instanceof ComponentNodeData)) continue;
      node.forEachSlot((childId) => {
        if (childId) deletedNodeIds.push(childId);
      });
      this.#nodes.delete(nodeId);
    }

    this.#changeListeners.notify({ nodeIds: changedIds });
  }

  #deleteSlotNode({ nodeId }: DeleteNodePatch): void {
    const node = this.getNode(nodeId);
    const [parentNode, movedChildren] = (
      this.#nodes.get(node.parent!.nodeId) as ComponentNodeData
    ).removeChild(node.parent!.slotName, node.parent!.index);

    const changedIds = [parentNode.id, nodeId];
    this.#nodes.set(parentNode.id, parentNode);
    this.#nodes.delete(nodeId);
    for (const [childId, nodeParent] of Object.entries(movedChildren)) {
      changedIds.push(childId);
      this.#nodes.set(childId, this.#nodes.get(childId)!.move(nodeParent));
    }

    this.#changeListeners.notify({ nodeIds: changedIds });
  }

  #renameComponentNode({ nodeId: oldId, newId }: RenameNodePatch): void {
    if (this.#nodes.has(newId)) {
      throw new Error(`A node with id '${newId}' already exists.`);
    }
    const oldNode = this.getComponentNode(oldId);
    const [newNode, movedChildren] = oldNode.rename(newId);
    this.#nodes.delete(oldId);
    this.#nodes.set(newId, newNode);

    const changedIds = [oldId, newId];

    if (oldNode.parent) {
      const { nodeId, slotName, index } = oldNode.parent;
      changedIds.push(nodeId);
      this.#nodes.set(
        nodeId,
        (this.#nodes.get(nodeId) as ComponentNodeData).renameChild(
          newId,
          slotName,
          index,
        ),
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

  #renameSlotNode({ nodeId: oldId, newId }: RenameNodePatch): void {
    if (this.#nodes.has(newId)) {
      throw new Error(`A node with id '${newId}' already exists.`);
    }
    const oldNode = this.getSlotNode(oldId);
    const newNode = oldNode.rename(newId);
    this.#nodes.delete(oldId);
    this.#nodes.set(newId, newNode);

    const changedIds = [oldId, newId];

    if (oldNode.parent) {
      const { nodeId, slotName, index } = oldNode.parent;
      changedIds.push(nodeId);
      this.#nodes.set(
        nodeId,
        (this.#nodes.get(nodeId) as ComponentNodeData).renameChild(
          newId,
          slotName,
          index,
        ),
      );
    } else {
      this.#rootNodeId = newId;
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

    if (oldNode instanceof ComponentNodeData) {
      oldNode.forEachInput((oldExpression, { type }, inputName, index) => {
        if (!oldExpression?.referencesNode(oldAncestorId)) return;
        newNode = (newNode as ComponentNodeData).setInput(
          Expression.fromJson(
            oldExpression.replaceNodeReferences(oldAncestorId, newAncestorId),
            type,
            ctx,
          ),
          inputName,
          index,
        );
      });

      oldNode.forEachSlot((childId) => {
        if (!childId) return;
        this.#updateNodeAfterAncestorRename(
          oldAncestorId,
          newAncestorId,
          childId,
          changedIds,
        );
      });
    } else {
      for (const outputName of oldNode.outputNames) {
        const oldExpression = oldNode.outputValues[outputName];
        if (!oldExpression?.referencesNode(oldAncestorId)) continue;
        newNode = (newNode as SlotNodeData).setOutput(
          outputName,
          Expression.fromJson(
            oldExpression.replaceNodeReferences(oldAncestorId, newAncestorId),
            oldNode.outputTypes[outputName],
            ctx,
          ),
        );
      }
    }

    if (oldNode !== newNode) {
      this.#nodes.set(nodeId, newNode);
      changedIds.push(nodeId);
    }
  }

  #setComponentNodeInput({
    nodeId,
    expression,
    inputName,
    index,
  }: SetComponentNodeInputPatch): void {
    const oldNode = this.getComponentNode(nodeId);
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

  #setSlotNodeDebugPreview({
    nodeId,
    debugPreview,
  }: SetSlotNodeDebugPreviewPatch): void {
    const oldNode = this.getSlotNode(nodeId);
    const newNode = oldNode.setDebugPreview(debugPreview);
    this.#nodes.set(nodeId, newNode);

    this.#changeListeners.notify({ nodeIds: [nodeId] });
  }

  #createSlotNodeOutput({
    nodeId,
    outputName,
    outputType,
    expression,
  }: CreateSlotNodeOutputPatch): void {
    const type = t.fromJson(outputType, this.definitions);
    const oldNode = this.getSlotNode(nodeId);
    const newNode = oldNode.createOutput(
      outputName,
      type,
      expression &&
        Expression.fromJson(
          expression,
          type,
          this.#createValidateExpressionContext(oldNode),
        ),
    );
    this.#nodes.set(nodeId, newNode);

    this.#changeListeners.notify({ nodeIds: [nodeId] });
  }

  #deleteSlotNodeOutput({
    nodeId,
    outputName,
  }: DeleteSlotNodeOutputPatch): void {
    const oldNode = this.getSlotNode(nodeId);
    const newNode = oldNode.deleteOutput(outputName);
    this.#nodes.set(nodeId, newNode);

    this.#changeListeners.notify({ nodeIds: [nodeId] });
  }

  #setSlotNodeOutput({
    nodeId,
    outputName,
    expression,
  }: SetSlotNodeOutputPatch): void {
    const oldNode = this.getSlotNode(nodeId);
    const newNode = oldNode.setOutput(
      outputName,
      expression &&
        Expression.fromJson(
          expression,
          oldNode.outputTypes[outputName],
          this.#createValidateExpressionContext(oldNode),
        ),
    );
    this.#nodes.set(nodeId, newNode);

    this.#changeListeners.notify({ nodeIds: [nodeId] });
  }

  #createValidateExpressionContext(
    node: Pick<ComponentNodeData | SlotNodeData, "parent">,
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
          const parentNode = this.#nodes.get(
            parent.nodeId,
          ) as ComponentNodeData;
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
