import * as $Map from "@pschiffmann/std/map";
import { NodeDefinitions } from "../node-definition.js";
import * as t from "../type-system/index.js";
import { assertIsNodeId, isNodeId } from "../util/kragle-identifier.js";
import * as $NodeJson from "./node-json.js";
import { InputBindingJson, NodeJson } from "./node-json.js";

export type SceneDocumentPatch =
  | CreateRootNodePatch
  | CreateNodePatch
  | DeleteNodePatch
  | RenameNodePatch
  | BindNodeInputPatch;

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

export interface BindNodeInputPatch {
  readonly type: "bind-node-input";
  readonly nodeId: string;
  readonly inputName: string;
  readonly index?: number;
  readonly binding: InputBindingJson | null;
}

export type OnSceneDocumentChangeHandler = (
  changedNodeIds: readonly string[]
) => void;

interface NodeParent {
  readonly nodeId: string;
  readonly slotName: string;
  readonly index?: number;
}

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

  #getNode(nodeId: string): NodeJson {
    const nodeJson = this.#nodes.get(nodeId);
    if (!nodeJson) throw new Error(`Can't find node ${nodeId}`);
    return nodeJson;
  }

  #generateNodeId(prefix: string): string {
    if (!isNodeId(prefix)) prefix = "Node";
    for (let i = 1; ; i++) {
      const nodeId = `${prefix}${i}`;
      if (!this.#nodes.has(nodeId)) return nodeId;
    }
  }

  /**
   * Returns the slot name of `ancestor` that leads to `descendant` in the node
   * tree.
   *
   * Throws an error if `descendant` is not a descendant of `ancestor`.
   */
  getNodeSlotNameInAncestor({
    descendant,
    ancestor,
  }: {
    descendant: string;
    ancestor: string;
  }): string {
    for (
      let current = this.#nodeParents.get(descendant);
      current;
      current = this.#nodeParents.get(current.nodeId)
    ) {
      if (current.nodeId === ancestor) return current.slotName;
    }
    throw new Error(
      `Node '${descendant}' is not a descendant of '${ancestor}'.`
    );
  }

  //
  // Node errors
  //

  #nodeErrors = new Map<string, NodeErrors | null>();

  get hasErrors(): boolean {
    return this.#nodeErrors.size !== 0;
  }

  getNodeErrors(nodeId: string): NodeErrors | null {
    return $Map.putIfAbsent(this.#nodeErrors, nodeId, () =>
      this.#resolveNodeErrors(nodeId)
    );
  }

  #resolveNodeErrors(nodeId: string): NodeErrors | null {
    const nodeJson = this.#getNode(nodeId);
    const { schema } = this.nodeDefinitions.get(nodeJson.type)!;

    const missingInputs = new Set<string>();
    const missingSlots = new Set<string>();

    // Check single inputs for missing values
    for (const [inputName, type] of Object.entries(schema.inputs)) {
      if (!nodeJson.inputs[inputName] && !t.undefined().isAssignableTo(type)) {
        missingInputs.add(inputName);
      }
    }

    // Check collection inputs for missing values
    for (const [slotName, type] of schema.getCollectionInputs()) {
      const bindings = nodeJson.collectionInputs[slotName];
      for (const [index, value] of bindings.entries()) {
        if (!value && !t.undefined().isAssignableTo(type)) {
          missingInputs.add(`${slotName}/${index}`);
        }
      }
    }

    // Check for missing slots
    for (const slotName of Object.keys(schema.slots)) {
      if (!schema.isCollectionSlot(slotName) && !nodeJson.slots[slotName]) {
        missingSlots.add(slotName);
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
      throw new Error("'onChange' is already subscribed to this document.");
    }
    this.#subscriptions.add(onChange);

    let called = false;
    return () => {
      if (called) return;
      called = true;
      this.#subscriptions.delete(onChange);
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
      case "bind-node-input":
        return this.#bindNodeInput(patch);
    }
  }

  #createRootNode({ nodeType, nodeId }: CreateRootNodePatch): void {
    if (this.#rootNodeId !== null) {
      throw new Error("Scene document is not empty.");
    }
    const definition = this.nodeDefinitions.get(nodeType);
    if (!definition) throw new Error(`Unknown node type '${nodeType}'.`);
    if (nodeId) {
      assertIsNodeId(nodeId);
    } else {
      nodeId = this.#generateNodeId(definition.importName);
    }
    this.#rootNodeId = nodeId;
    this.#nodes.set(nodeId, $NodeJson.create(definition.schema));
    this.#notifySubscriptions([nodeId]);
  }

  #createNode({
    nodeType,
    parentId,
    parentSlot,
    nodeId,
  }: CreateNodePatch): void {
    const parentJson = this.#getNode(parentId);
    const parentSchema = this.nodeDefinitions.get(parentJson.type)!.schema;

    const childDefinition = this.nodeDefinitions.get(nodeType);
    if (!childDefinition) throw new Error(`Unknown node type '${nodeType}'.`);

    if (nodeId) {
      assertIsNodeId(nodeId);
      if (this.#nodes.has(nodeId)) {
        throw new Error(`A node with id '${nodeId}' already exists.`);
      }
    } else {
      nodeId = this.#generateNodeId(childDefinition.importName);
    }

    let nodeParent: NodeParent;
    if (parentSchema.isCollectionSlot(parentSlot)) {
      nodeParent = {
        nodeId: parentId,
        slotName: parentSlot,
        index: parentJson.collectionSlots[parentSlot].length,
      };
    } else {
      if (parentJson.slots[parentSlot]) {
        throw new Error(
          `Slot '${parentSlot}' of node '${parentId}' is not empty.`
        );
      }
      nodeParent = { nodeId: parentId, slotName: parentSlot };
    }

    this.#nodes.set(
      parentId,
      $NodeJson.addChild(parentSchema, parentJson, parentSlot, nodeId)
    );
    this.#nodeErrors.delete(parentId);

    this.#nodes.set(nodeId, $NodeJson.create(childDefinition.schema));
    this.#nodeParents.set(nodeId, nodeParent);

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
    if (!nodeParent) throw new Error(`Can't find node '${nodeId}'.`);

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
      const newChildren = newParentJson.collectionSlots[slotName];
      for (const [index, childId] of newChildren.entries()) {
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

      const { schema } = this.nodeDefinitions.get(nodeJson.type)!;
      for (const slotName of Object.keys(schema.slots)) {
        const child = nodeJson.slots[slotName];
        if (child) deleteRecursive(child);
      }
      for (const slotName of schema.getCollectionSlots()) {
        for (const child of nodeJson.collectionSlots[slotName]) {
          deleteRecursive(child);
        }
      }
    };
    deleteRecursive(nodeId);

    this.#notifySubscriptions(changedNodeIds);
  }

  #renameRootNode({ nodeId, newId }: RenameNodePatch): void {
    assertIsNodeId(newId);
    if (this.#nodes.has(newId)) {
      throw new Error(`A node with id '${newId}' already exists.`);
    }

    const nodeJson = this.#nodes.get(nodeId)!;
    this.#rootNodeId = newId;
    this.#nodes.set(newId, nodeJson);
    this.#nodes.delete(nodeId);
    this.#nodeErrors.set(newId, this.#nodeErrors.get(nodeId)!);
    this.#nodeErrors.delete(nodeId);

    const { schema } = this.nodeDefinitions.get(nodeJson.type)!;
    for (const slotName of Object.keys(schema.slots)) {
      const child = nodeJson.slots[slotName];
      if (!child) continue;
      this.#nodeParents.set(child, {
        ...this.#nodeParents.get(child)!,
        nodeId,
      });
    }
    for (const slotName of schema.getCollectionSlots()) {
      for (const child of nodeJson.collectionSlots[slotName]) {
        this.#nodeParents.set(child, {
          ...this.#nodeParents.get(child)!,
          nodeId,
        });
      }
    }

    this.#notifySubscriptions([nodeId, newId]);
  }

  #renameNode({ nodeId, newId }: RenameNodePatch): void {
    assertIsNodeId(newId);
    if (this.#nodes.has(newId)) {
      throw new Error(`A node with id '${newId}' already exists.`);
    }
    const nodeParent = this.#nodeParents.get(nodeId);
    if (!nodeParent) throw new Error(`Can't find node '${nodeId}'.`);

    const parentJson = this.#nodes.get(nodeParent.nodeId)!;
    const parentSchema = this.nodeDefinitions.get(parentJson.type)!.schema;
    let newParentJson: NodeJson;
    if (parentSchema.isCollectionSlot(nodeParent.slotName)) {
      const newChildren = [...parentJson.collectionSlots[nodeParent.slotName]];
      newChildren[nodeParent.index!] = newId;
      newParentJson = {
        ...parentJson,
        collectionSlots: {
          ...parentJson.collectionSlots,
          [nodeParent.slotName]: newChildren,
        },
      };
    } else {
      newParentJson = {
        ...parentJson,
        slots: { ...parentJson.slots, [nodeParent.slotName]: newId },
      };
    }
    this.#nodes.set(nodeParent.nodeId, newParentJson);

    const nodeJson = this.#nodes.get(nodeId)!;
    this.#nodes.set(newId, nodeJson);
    this.#nodes.delete(nodeId);
    this.#nodeErrors.set(newId, this.#nodeErrors.get(nodeId)!);
    this.#nodeErrors.delete(nodeId);

    const schema = this.nodeDefinitions.get(nodeJson.type)!.schema;
    for (const slotName of Object.keys(schema.slots)) {
      if (schema.isCollectionSlot(slotName)) {
        for (const child of nodeJson.collectionSlots[slotName]) {
          this.#nodeParents.set(child, {
            ...this.#nodeParents.get(child)!,
            nodeId,
          });
        }
      } else {
        const child = nodeJson.slots[slotName];
        if (child) {
          this.#nodeParents.set(child, {
            ...this.#nodeParents.get(child)!,
            nodeId,
          });
        }
      }
    }

    this.#notifySubscriptions([nodeParent.nodeId, nodeId, newId]);
  }

  #bindNodeInput({
    nodeId,
    inputName,
    index,
    binding,
  }: BindNodeInputPatch): void {
    let bindingType: t.KragleType;
    switch (binding?.type) {
      case "node-output": {
        const ancestorNodeJson = this.#getNode(binding.nodeId);
        const ancestorSchema = this.nodeDefinitions.get(
          ancestorNodeJson.type
        )!.schema;
        const ancestorSlot = this.getNodeSlotNameInAncestor({
          descendant: nodeId,
          ancestor: binding.nodeId,
        });
        const outputType =
          ancestorSchema.outputs[binding.outputName] ??
          ancestorSchema.slots[ancestorSlot].outputs?.[binding.outputName];
        if (!outputType) {
          throw new Error(
            `Node '${binding.nodeId}' doesn't expose an output ` +
              `'${binding.outputName}' to node '${nodeId}'.`
          );
        }
        bindingType = outputType;
        break;
      }
      case "constant": {
        bindingType = t.resolveType(binding.value);
        break;
      }
    }

    const nodeJson = this.#getNode(nodeId);
    const { schema } = this.nodeDefinitions.get(nodeJson.type)!;
    let newNodeJson: NodeJson;
    if (schema.isCollectionInput(inputName)) {
      if (!index) {
        throw new Error(
          `Parameter 'index' is required to bind collection input ` +
            `'${inputName}' of node '${nodeId}'.`
        );
      }
      if (binding !== null) {
        const [, inputType] = [...schema.getCollectionInputs()].find(
          (input) => input[0] === inputName
        )!;
        if (!bindingType!.isAssignableTo(inputType)) {
          throw new Error(
            `Can't bind input '${inputName}/${index}' of node '${nodeId}' to ` +
              `value of type '${bindingType!}'.`
          );
        }
      }
      const newInputs = [...nodeJson.collectionInputs[inputName]];
      newInputs[index] = binding;
      newNodeJson = {
        ...nodeJson,
        collectionInputs: {
          ...nodeJson.collectionInputs,
          [inputName]: newInputs,
        },
      };
    } else if (binding) {
      const inputType = schema.inputs[inputName];
      if (!bindingType!.isAssignableTo(inputType)) {
        throw new Error(
          `Can't bind input '${inputName}' of node '${nodeId}' to value of ` +
            `type '${bindingType!}'.`
        );
      }
      newNodeJson = {
        ...nodeJson,
        inputs: { ...nodeJson.inputs, [inputName]: binding },
      };
    } else {
      const inputs = { ...nodeJson.inputs };
      delete inputs[inputName];
      newNodeJson = { ...nodeJson, inputs };
    }
    this.#nodes.set(nodeId, newNodeJson);
    this.#nodeErrors.delete(nodeId);

    this.#notifySubscriptions([nodeId]);
  }
}
