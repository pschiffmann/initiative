import { NodeDefinitions } from "../node-definition.js";

export interface SceneJson {
  readonly rootNode: string;
  readonly nodes: Readonly<Record<string, NodeJson>>;
}

export interface NodeJson {
  readonly type: string;

  readonly inputs: Readonly<Record<string, NodeInputJson>>;

  /**
   * Mapping from slot name to child node id.
   */
  readonly slots: Readonly<Record<string, string>>;
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
  readonly input: NodeInputJson | null;
}

export interface NodeErrors {}

export type NodeError = NodeInputError | NodeSlotError;

export interface NodeInputError {
  readonly type: "input-error";
  readonly nodeId: string;
  readonly input: string;
  readonly message: string;
}

export interface NodeSlotError {
  readonly type: "slot-error";
  readonly nodeId: string;
  readonly slot: string;
  readonly index?: number;
  readonly message: string;
}

export class SceneDocument {
  constructor(readonly nodeDefinitions: NodeDefinitions) {}

  #rootNode: string | null = null;
  #nodes = new Map<string, NodeJson>();
  #nodeErrors = new Map<string, readonly NodeError[]>();

  get rootNode(): string | null {
    return this.#rootNode;
  }

  getNode(nodeId: string): NodeJson | undefined {
    return this.#nodes.get(nodeId);
  }

  getNodeErrors(nodeId: string): readonly NodeError[] | undefined {
    return this.#nodeErrors.get(nodeId);
  }

  applyPatch(patch: SceneDocumentPatch): void {
    const { type } = patch;
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
