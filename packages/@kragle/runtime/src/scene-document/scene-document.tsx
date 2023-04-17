import * as $Map from "@pschiffmann/std/map";
import { NodeDefinitions } from "../node-definition.js";
import { SlotSchema } from "../node-schema.js";
import * as t from "../type-system/index.js";
import { assertIsNodeId, isNodeId } from "../util/kragle-identifier.js";
import * as $NodeJson from "./node-json.js";
import { NodeInputJson, NodeJson, NodeParent } from "./node-json.js";

export type SceneDocumentPatch =
  | CreateRootNodePatch
  | CreateNodePatch
  | DeleteNodePatch
  | RenameNodePatch
  | SetNodeInputPatch;

export interface CreateRootNodePatch {
  readonly type: "create-root-node";
  readonly nodeType: string;
  readonly nodeId?: string;
}

export interface CreateNodePatch {
  readonly type: "create-node";
  readonly nodeType: string;
  readonly parentId: string;
  readonly parentSlot: string;
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
  readonly inputName: string;
  readonly index?: number;
  readonly value: NodeInputJson | null;
}

export type OnSceneDocumentChangeHandler = (
  changedNodeIds: readonly string[]
) => void;

export interface NodeErrors {
  /**
   * Missing slot inputs are listed as `<input name>/<index>`.
   */
  readonly missingInputs: ReadonlySet<string>;
  readonly missingSlots: ReadonlySet<string>;
}

export class SceneDocument {
  constructor(readonly nodeDefinitions: NodeDefinitions) {}

  #rootNodeId: string | null = null;

  getRootNodeId = () => {
    return this.#rootNodeId;
  };

  //
  // Node
  //

  #nodes = new Map<string, NodeJson>();
  #nodeParents = new Map<string, NodeParent>();

  getNode(nodeId: string): NodeJson | null {
    return this.#nodes.get(nodeId) ?? null;
  }

  #generateNodeId(prefix: string): string {
    if (!isNodeId(prefix)) prefix = "Node";
    for (let i = 1; ; i++) {
      const nodeId = `${prefix}${i}`;
      if (!this.#nodes.has(nodeId)) return nodeId;
    }
  }

  //
  // Node errors
  //

  #nodeErrors = new Map<string, NodeErrors | null>();

  getNodeErrors(nodeId: string): NodeErrors | null {
    return $Map.putIfAbsent(this.#nodeErrors, nodeId, () =>
      this.#resolveNodeErrors(nodeId)
    );
  }

  #resolveNodeErrors(nodeId: string): NodeErrors | null {
    const nodeJson = this.#nodes.get(nodeId);
    if (!nodeJson) throw new Error(`Can't find node ${nodeId}`);
    const { schema } = this.nodeDefinitions.get(nodeJson.type)!;

    const missingInputs = new Set<string>();
    const missingSlots = new Set<string>();

    // Check simple inputs for missing values
    for (const [name, type] of Object.entries(schema.inputs)) {
      if (!nodeJson.inputs[name] && !t.undefined().isAssignableTo(type)) {
        missingInputs.add(name);
      }
    }

    // Check slot collection inputs for missing values
    for (const [name, type] of Object.values(schema.slots).flatMap((slot) =>
      Object.entries(slot.inputs ?? {})
    )) {
      const inputs = nodeJson.inputs[name] as readonly (NodeInputJson | null)[];
      for (const [index, value] of inputs.entries()) {
        if (!value && !t.undefined().isAssignableTo(type)) {
          missingInputs.add(`${name}/${index}`);
        }
      }
    }

    // Check for missing slots
    for (const [name, slotSchema] of Object.entries<SlotSchema>(schema.slots)) {
      if (!slotSchema.inputs && !nodeJson.slots[name]) {
        missingSlots.add(name);
      }
    }

    return missingInputs.size !== 0 || missingSlots.size !== 0
      ? { missingInputs, missingSlots }
      : null;
  }

  //
  // Subscribe
  //

  #subscriptions = new Set<OnSceneDocumentChangeHandler>();

  subscribe = (onChange: OnSceneDocumentChangeHandler) => {
    if (this.#subscriptions.has(onChange)) {
      throw new Error("function is already subscribed to this document.");
    }
    this.#subscriptions.add(onChange);

    let called = false;
    return () => {
      if (!called) this.#subscriptions.delete(onChange);
    };
  };

  #notifySubscriptions(nodeIds: readonly string[]): void {
    for (const onChange of [...this.#subscriptions]) {
      onChange(nodeIds);
    }
  }

  //
  // Node patches
  //

  applyPatch(patch: SceneDocumentPatch): void {
    switch (patch.type) {
      case "create-root-node":
        return this.#createRootNode(patch);
      case "create-node":
        return this.#createNode(patch);
      case "delete-node":
        return patch.nodeId === this.#rootNodeId
          ? this.#deleteRootNode()
          : this.#deleteNode(patch);
      case "rename-node":
        return patch.nodeId === this.#rootNodeId
          ? this.#renameRootNode(patch)
          : this.#renameNode(patch);
      case "set-node-input":
        return this.#setNodeInput(patch);
    }
  }

  #createRootNode({ nodeType, nodeId }: CreateRootNodePatch): void {
    if (this.#rootNodeId !== null) {
      throw new Error("Scene document is not empty.");
    }
    const definition = this.nodeDefinitions.get(nodeType);
    if (!definition) throw new Error(`Unknown node type: ${nodeType}`);
    const { schema } = definition;
    if (nodeId) {
      assertIsNodeId(nodeId);
    } else {
      nodeId = this.#generateNodeId(definition.importName);
    }
    this.#rootNodeId = nodeId;
    this.#nodes.set(nodeId, $NodeJson.create(schema));
    this.#notifySubscriptions([nodeId]);
  }

  #createNode({
    nodeType,
    parentId,
    parentSlot,
    nodeId,
  }: CreateNodePatch): void {
    if (!parentSlot) throw new Error("Missing parameter :parentSlot");

    const parentJson = this.#nodes.get(parentId);
    if (!parentJson) throw new Error(`Can't find node: ${parentId}`);
    const parentSchema = this.nodeDefinitions.get(parentJson.type)!.schema;
    if (
      !parentSchema.isCollectionSlot(parentSlot) &&
      parentJson.slots[parentSlot]
    ) {
      throw new Error(
        `Slot '${parentSlot}' of node '${parentId}' already contains a node.`
      );
    }

    const childDefinition = this.nodeDefinitions.get(nodeType);
    if (!childDefinition) throw new Error(`Unknown node type: ${nodeType}`);

    if (nodeId) {
      assertIsNodeId(nodeId);
    } else {
      nodeId = this.#generateNodeId(childDefinition.importName);
    }

    const newParentJson = $NodeJson.addChild(
      parentSchema,
      parentJson,
      parentSlot,
      nodeId
    );
    this.#nodes.set(parentId, newParentJson);
    this.#nodes.set(nodeId, $NodeJson.create(childDefinition.schema));
    this.#nodeErrors.delete(parentId);
    this.#nodeParents.set(
      nodeId,
      parentSchema.isCollectionSlot(parentSlot)
        ? {
            nodeId: parentId,
            slotName: parentSlot,
            index:
              (newParentJson.slots[parentSlot] as readonly string[]).length - 1,
          }
        : { nodeId: parentId, slotName: parentSlot }
    );
    this.#notifySubscriptions([parentId, nodeId]);
  }

  #deleteRootNode(): void {
    this.#rootNodeId = null;
    const nodeIds = [...this.#nodes.keys()];
    this.#nodes.clear();
    this.#nodeErrors.clear();
    this.#nodeParents.clear();
    this.#notifySubscriptions(nodeIds);
  }

  #deleteNode({ nodeId }: DeleteNodePatch): void {
    const nodeParent = this.#nodeParents.get(nodeId);
    if (!nodeParent) throw new Error(`Can't find node: ${nodeId}`);

    const { nodeId: parentId, slotName, index } = nodeParent;
    const parentJson = this.#nodes.get(parentId)!;
    const parentSchema = this.nodeDefinitions.get(parentJson.type)!.schema;
    const newParentJson = $NodeJson.removeChild(
      parentSchema,
      parentJson,
      slotName,
      index
    );

    this.#nodes.set(parentId, newParentJson);
    if (parentSchema.isCollectionSlot(slotName)) {
      const newSlots = newParentJson.slots[slotName] as readonly string[];
      for (const [index, childId] of newSlots.entries()) {
        this.#nodeParents.set(childId, { nodeId: parentId, slotName, index });
      }
    }

    const changedNodeIds: string[] = [parentId];
    const deleteRecursive = (nodeId: string) => {
      changedNodeIds.push(nodeId);
      const nodeJson = this.#nodes.get(nodeId)!;
      this.#nodes.delete(nodeId);
      this.#nodeErrors.delete(nodeId);
      this.#nodeParents.delete(nodeId);
      for (const children of Object.values(nodeJson.slots)) {
        if (typeof children === "string") {
          deleteRecursive(children);
        } else {
          children.forEach(deleteRecursive);
        }
      }
    };
    deleteRecursive(nodeId);

    this.#notifySubscriptions(changedNodeIds);
  }

  #renameRootNode({ nodeId, newId }: RenameNodePatch): void {
    assertIsNodeId(newId);

    const nodeJson = this.#nodes.get(nodeId)!;
    this.#rootNodeId = newId;
    this.#nodes.set(newId, nodeJson);
    this.#nodes.delete(nodeId);
    this.#nodeErrors.set(newId, this.#nodeErrors.get(nodeId)!);
    this.#nodeErrors.delete(nodeId);

    for (const children of Object.values(nodeJson.slots)) {
      if (typeof children === "string") {
        this.#nodeParents.set(children, {
          ...this.#nodeParents.get(children)!,
          nodeId,
        });
      } else {
        for (const child of children) {
          this.#nodeParents.set(child, {
            ...this.#nodeParents.get(child)!,
            nodeId,
          });
        }
      }
    }

    this.#notifySubscriptions([nodeId, newId]);
  }

  #renameNode({ nodeId, newId }: RenameNodePatch): void {
    assertIsNodeId(newId);
    const nodeParent = this.#nodeParents.get(nodeId);
    if (!nodeParent) throw new Error(`Can't find node: ${nodeId}`);

    const parentJson = this.#nodes.get(nodeParent.nodeId)!;
    const newParentJson = { ...parentJson, slots: { ...parentJson.slots } };
    if (typeof parentJson.slots[nodeParent.slotName] === "string") {
      newParentJson.slots[nodeParent.slotName] = newId;
    } else {
      const newChildren = [...parentJson.slots[nodeParent.slotName]];
      newChildren[nodeParent.index!] = newId;
      newParentJson.slots[nodeParent.slotName] = newChildren;
    }
    this.#nodes.set(nodeParent.nodeId, newParentJson);

    const nodeJson = this.#nodes.get(nodeId)!;
    this.#nodes.set(newId, nodeJson);
    this.#nodes.delete(nodeId);
    this.#nodeErrors.set(newId, this.#nodeErrors.get(nodeId)!);
    this.#nodeErrors.delete(nodeId);

    for (const children of Object.values(nodeJson.slots)) {
      if (typeof children === "string") {
        this.#nodeParents.set(children, {
          ...this.#nodeParents.get(children)!,
          nodeId,
        });
      } else {
        for (const child of children) {
          this.#nodeParents.set(child, {
            ...this.#nodeParents.get(child)!,
            nodeId,
          });
        }
      }
    }

    this.#notifySubscriptions([nodeParent.nodeId, nodeId, newId]);
  }

  #setNodeInput({ nodeId, inputName, index, value }: SetNodeInputPatch): void {
    const nodeJson = this.#nodes.get(nodeId);
    if (!nodeJson) throw new Error(`Can't find node: ${nodeId}`);

    const { schema } = this.nodeDefinitions.get(nodeJson.type)!;
    const newNodeJson = { ...nodeJson, inputs: { ...nodeJson.inputs } };
    if (schema.isCollectionInput(inputName)) {
      if (!index)
        throw new Error(
          `Input '${inputName}' of node ${nodeId} is a collection input.`
        );
      const newInputs = [
        ...(nodeJson.inputs[inputName] as readonly (NodeInputJson | null)[]),
      ];
      newInputs[index] = value;
      newNodeJson.inputs[inputName] = newInputs;
    } else if (value) {
      newNodeJson.inputs[inputName] = value;
    } else {
      delete newNodeJson.inputs[inputName];
    }
    this.#nodes.set(nodeId, newNodeJson);
    this.#nodeErrors.delete(nodeId);

    this.#notifySubscriptions([nodeId]);
  }
}
