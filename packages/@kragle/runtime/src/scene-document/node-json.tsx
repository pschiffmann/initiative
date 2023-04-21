import { NodeSchema, SlotSchemas } from "../node-schema.js";
import * as t from "../type-system/index.js";

export interface NodeJson {
  readonly type: string;

  readonly inputs: Readonly<Record<string, InputBindingJson>>;

  /**
   * Node json objects retrieved from `SceneDocument` are guaranteed to contain
   * an _input name -> array_ mapping for each collection input. Input arrays
   * are guaranteed to have equal or fewer elements than their associated
   * collection slot.
   */
  readonly collectionInputs: Readonly<
    Record<string, readonly (InputBindingJson | null)[]>
  >;

  readonly slots: Readonly<Record<string, string>>;

  /**
   * Node json objects retrieved from `SceneDocument` are guaranteed to contain
   * a _slot name -> array_ mapping for each collection slot.
   */
  readonly collectionSlots: Readonly<Record<string, readonly string[]>>;
}

export type InputBindingJson =
  | {
      readonly type: "node-output";
      readonly nodeId: string;
      readonly outputName: string;
    }
  // | {
  //     readonly type: "external";
  //     readonly sceneProp: string;
  //   }
  | {
      readonly type: "constant";
      readonly value: string | number | boolean;
    };

export function create(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>
): NodeJson {
  const collectionInputs: Record<string, null[]> = {};
  const collectionSlots: Record<string, string[]> = {};
  for (const slotName of Object.keys(schema.slots)) {
    if (schema.isCollectionSlot(slotName)) {
      collectionInputs[slotName] = [];
      collectionSlots[slotName] = [];
    }
  }
  return {
    type: schema.name,
    inputs: {},
    collectionInputs,
    slots: {},
    collectionSlots,
  };
}

/**
 * Returns a copy of `nodeJson` with `childId` inserted into `nodeJson.slots`.
 * If `slotName` is a collection slot, appends `childId` as the last child in
 * that slot.
 */
export function addChild(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>,
  nodeJson: NodeJson,
  slotName: string,
  childId: string
): NodeJson {
  if (schema.isCollectionSlot(slotName)) {
    return {
      ...nodeJson,
      collectionSlots: {
        ...nodeJson.collectionSlots,
        [slotName]: [...nodeJson.collectionSlots[slotName], childId],
      },
    };
  } else {
    if (nodeJson.slots[slotName]) {
      throw new Error(`Slot '${slotName}' already contains a child.`);
    }
    return {
      ...nodeJson,
      slots: {
        ...nodeJson.slots,
        [slotName]: childId,
      },
    };
  }
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
  if (schema.isCollectionSlot(slotName)) {
    if (typeof index !== "number") {
      throw new Error(
        `Parameter 'index' is required to delete from collection slot ` +
          `'${slotName}'.`
      );
    }
    const collectionInputs = { ...nodeJson.collectionInputs };
    const collectionSlots = { ...nodeJson.collectionSlots };
    for (const inputName of Object.keys(schema.slots[slotName].inputs!)) {
      collectionInputs[inputName] = collectionInputs[inputName].filter(
        (_, i) => i !== index
      );
    }
    collectionSlots[slotName] = collectionSlots[slotName].filter(
      (_, i) => i !== index
    );
    return { ...nodeJson, collectionInputs, collectionSlots };
  } else {
    const { [slotName]: _, ...slots } = nodeJson.slots;
    return { ...nodeJson, slots };
  }
}

export function replaceChild(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>,
  nodeJson: NodeJson,
  slotName: string,
  index: number | undefined,
  newChildId: string
): NodeJson {
  if (schema.isCollectionSlot(slotName)) {
    if (typeof index !== "number") {
      throw new Error(
        `Parameter 'index' is required to replace collection slot ` +
          `'${slotName}'.`
      );
    }
    return {
      ...nodeJson,
      collectionSlots: {
        ...nodeJson.collectionSlots,
        [slotName]: nodeJson.collectionSlots[slotName].map((childId, i) =>
          i === index ? newChildId : childId
        ),
      },
    };
  } else {
    return {
      ...nodeJson,
      slots: {
        ...nodeJson.slots,
        [slotName]: newChildId,
      },
    };
  }
}

export function setNodeInput(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>,
  nodeJson: NodeJson,
  inputName: string,
  index: number | undefined,
  newValue: InputBindingJson | null
): NodeJson {
  if (schema.isCollectionInput(inputName)) {
    if (typeof index !== "number") {
      throw new Error(
        `Parameter 'index' is required to bind collection input ` +
          `'${inputName}'.`
      );
    }
    return {
      ...nodeJson,
      collectionInputs: {
        ...nodeJson.collectionInputs,
        [inputName]: nodeJson.collectionInputs[inputName].map((value, i) =>
          i === index ? newValue : value
        ),
      },
    };
  } else if (newValue) {
    return {
      ...nodeJson,
      inputs: {
        ...nodeJson.inputs,
        [inputName]: newValue,
      },
    };
  } else {
    const { [inputName]: _, ...inputs } = nodeJson.inputs;
    return { ...nodeJson, inputs };
  }
}
