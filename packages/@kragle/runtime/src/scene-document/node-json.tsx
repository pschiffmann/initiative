import { NodeSchema, SlotSchemas } from "../node-schema.js";
import * as t from "../type-system/index.js";

export interface NodeJson {
  readonly type: string;

  /**
   * `SceneDocument` will keep the array length of collection input arrays equal
   * to the number of slot children, and fill unassigned inputs with `null`s.
   *
   * `parseSceneJson()` also accepts arrays that have fewer elements that the
   * slot has children.
   */
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

export interface NodeParent {
  readonly nodeId: string;
  readonly slotName: string;
  readonly index?: number;
}

export function create(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>
): NodeJson {
  const inputs: Record<string, null[]> = {};
  const slots: Record<string, string[]> = {};
  for (const [slotName, slotSchema] of Object.entries(schema.slots)) {
    if (slotSchema.inputs) {
      inputs[slotName] = [];
      slots[slotName] = [];
    }
  }
  return { type: schema.name, inputs, slots };
}

/**
 * Returns a copy of `nodeJson` with `childId` inserted into `nodeJson.slots`.
 * If `slotName` is a collection slot, appends `childId` as the last child in
 * that slot and appends a `null` value to every slot input array.
 */
export function addChild(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>,
  nodeJson: NodeJson,
  slotName: string,
  childId: string
): NodeJson {
  const newNodeJson = {
    ...nodeJson,
    inputs: { ...nodeJson.inputs },
    slots: { ...nodeJson.slots },
  };
  let nodeParent: NodeParent;
  if (schema.isCollectionSlot(slotName)) {
    newNodeJson.slots[slotName] = [
      ...(nodeJson.slots[slotName] as readonly string[]),
      childId,
    ];
    for (const inputName of Object.keys(schema.slots[slotName].inputs!)) {
      newNodeJson.inputs[inputName] = [
        ...(nodeJson.inputs[inputName] as readonly (NodeInputJson | null)[]),
        null,
      ];
    }
  } else {
    newNodeJson.slots[slotName] = childId;
  }
  return newNodeJson;
}

/**
 *
 */
export function removeChild(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>,
  nodeJson: NodeJson,
  slotName: string,
  index?: number
): NodeJson {
  const result = {
    ...nodeJson,
    inputs: { ...nodeJson.inputs },
    slots: { ...nodeJson.slots },
  };
  if (schema.isCollectionSlot(slotName)) {
    result.slots[slotName] = (
      nodeJson.slots[slotName] as readonly string[]
    ).filter((_, i) => i !== index);
    for (const inputName of Object.keys(schema.slots[slotName].inputs!)) {
      result.inputs[inputName] = (
        nodeJson.inputs[inputName] as readonly (NodeInputJson | null)[]
      ).filter((_, i) => i !== index);
    }
  } else {
    delete result.slots[slotName];
  }
  return result;
}

export function replaceChild(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>,
  nodeJson: NodeJson,
  slotName: string,
  index: number | undefined,
  newChildId: string
): NodeJson {
  const result = { ...nodeJson, slots: { ...nodeJson.slots } };
  if (schema.isCollectionSlot(slotName)) {
    result.slots[slotName] = (
      nodeJson.slots[slotName] as readonly string[]
    ).map((childId, i) => (i === index ? newChildId : childId));
  } else {
    result.slots[slotName] = newChildId;
  }
  return result;
}

export function setNodeInput(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>,
  nodeJson: NodeJson,
  inputName: string,
  index: number | undefined,
  newValue: NodeInputJson | null
): NodeJson {
  const result = { ...nodeJson, inputs: { ...nodeJson.inputs } };
  if (schema.isCollectionInput(inputName)) {
    result.inputs[inputName] = (
      nodeJson.inputs[inputName] as readonly (NodeInputJson | null)[]
    ).map((value, i) => (i === index ? newValue : value));
  } else if (newValue) {
    result.inputs[inputName] = newValue;
  } else {
    delete result.inputs[inputName];
  }
  return result;
}
