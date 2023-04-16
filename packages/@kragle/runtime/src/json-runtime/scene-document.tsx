import * as $Map from "@pschiffmann/std/map";
import { NodeDefinitions } from "../node-definition.js";
import { SlotSchema } from "../node-schema.js";
import * as t from "../type-system/index.js";

export interface SceneJson {
  readonly rootNode: string;
  readonly nodes: Readonly<Record<string, NodeJson>>;
}

export interface NodeJson {
  readonly type: string;

  readonly inputs: Readonly<
    Record<string, NodeInputJson | readonly (NodeInputJson | null)[]>
  >;

  /**
   * Mapping from slot name to child node id.
   */
  readonly slots: Readonly<Record<string, string | readonly string[]>>;
}

export type NodeInputJson =
  | {
      readonly type: "binding";
      readonly nodeId: string;
      readonly output: string;
    }
  // | {
  //     readonly type: "external";
  //     readonly sceneProp: string;
  //   }
  | {
      readonly type: "constant";
      readonly value: string | number | boolean;
    };

export type SceneDocumentPatch =
  | CreateRootNodePatch
  | CreateNodePatch
  | DeleteNodePatch
  | RenameNodePatch
  | SetNodeInputPatch;

export interface CreateRootNodePatch {
  readonly type: "create-root-node";
  readonly nodeType: string;
}

export interface CreateNodePatch {
  readonly type: "create-node";
  readonly nodeType: string;
  readonly parentId: string;
  readonly parentSlot: string;
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
  readonly input: string;
  readonly index?: number;
  readonly value: NodeInputJson | null;
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

  #rootNode: string | null = null;
  #nodes = new Map<string, NodeJson>();
  #nodeErrors = new Map<string, NodeErrors | null>();

  get rootNode(): string | null {
    return this.#rootNode;
  }

  getNode(nodeId: string): NodeJson | null {
    return this.#nodes.get(nodeId) ?? null;
  }

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
    for (const [name, type] of Object.entries(schema.inputs ?? {})) {
      if (!nodeJson.inputs[name] && !t.undefined().isAssignableTo(type)) {
        missingInputs.add(name);
      }
    }

    // Check slot collection inputs for missing values
    for (const [name, type] of Object.values(schema.slots ?? {}).flatMap(
      (slot) => Object.entries(slot.inputs ?? {})
    )) {
      const inputs = nodeJson.inputs[name] as readonly (NodeInputJson | null)[];
      for (const [index, value] of inputs.entries()) {
        if (!value && !t.undefined().isAssignableTo(type)) {
          missingInputs.add(`${name}/${index}`);
        }
      }
    }

    // Check for missing slots
    for (const [name, slotSchema] of Object.entries<SlotSchema>(
      schema.slots ?? {}
    )) {
      if (!slotSchema.inputs && !nodeJson.slots[name]) {
        missingSlots.add(name);
      }
    }

    return missingInputs.size !== 0 || missingSlots.size !== 0
      ? { missingInputs, missingSlots }
      : null;
  }

  applyPatch(patch: SceneDocumentPatch): void {
    switch (patch.type) {
      case "create-root-node":
        return this.#createRootNode(patch);
      case "create-node":
        return this.#createNode(patch);
      case "delete-node":
        return this.#deleteNode(patch);
      case "rename-node":
        return this.#renameNode(patch);
      case "set-node-input":
        return this.#setNodeInput(patch);
    }
  }

  #createRootNode({}: CreateRootNodePatch): void {}

  #createNode({ nodeType, parentId, parentSlot }: CreateNodePatch): void {
    const definition = this.nodeDefinitions.get(nodeType);
    if (!definition) throw new Error(`Unknown node type: ${nodeType}`);
    const { schema } = definition;
  }

  #deleteNode({ nodeId }: DeleteNodePatch) {}

  #renameNode({ nodeId, newId }: RenameNodePatch): void {}

  #setNodeInput({}: SetNodeInputPatch): void {}

  subscribe() {}
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

  function x() {}

  return { sceneDocument, errors };
}
