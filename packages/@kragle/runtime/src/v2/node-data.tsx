import * as t from "../type-system/index.js";
import { ExpressionJson } from "./expression.js";
import { NodeSchema } from "./node-schema.js";

/**
 * Node serialization format.
 */
export interface NodeJson {
  readonly type: string;

  /**
   * Map from input name to input value expression. Collection input values are
   * stored in `<inputName>/<index>` keys.
   */
  readonly inputs: { readonly [inputName: string]: ExpressionJson };

  /**
   * Map from slot name to child node id. Collection slot children are stored in
   * `<slotName>/<index>` keys.
   */
  readonly slots: { readonly [slotName: string]: string };
}

export class NodeData implements NodeJson {
  private constructor(
    readonly schema: NodeSchema,
    readonly id: string,
    readonly inputs: NodeJson["inputs"],
    readonly slots: NodeJson["slots"],
    readonly collectionSlotSizes: { readonly [slotName: string]: number }
  ) {}

  get type(): string {
    return this.schema.name;
  }

  /**
   * Calls `callback` for each input defined in the node schema.
   *
   * If an input doesn't have an expression, `callback` is called with `null`
   * instead.
   *
   * If `inputName` is a collection input, `callback` is called once for each
   * child in that collection slot, even if not some inputs don't have
   * expressions. If the collection is empty, `callback` is called once and with
   * -1 passed as `index`.
   */
  forEachInput<R>(
    callback: (
      expression: ExpressionJson | null,
      type: t.KragleType,
      inputName: string,
      index?: number
    ) => R
  ): R[] {
    const result: R[] = [];
    this.schema.forEachInput((type, inputName, slotName) => {
      if (slotName) {
        const childCount = this.collectionSlotSizes[slotName];
        if (childCount === 0) {
          result.push(callback(null, type, inputName, -1));
        }
        for (let i = 0; i < childCount; i++) {
          const expression = this.inputs[`${inputName}::${i}`] ?? null;
          result.push(callback(expression, type, inputName, i));
        }
      } else {
        result.push(callback(this.inputs[inputName] ?? null, type, inputName));
      }
    });
    return result;
  }

  /**
   * Calls `callback` for each slot defined in the node schema.
   *
   * If a slot doesn't contain a child, `callback` is called with `null`
   * instead.
   *
   * If `slotName` is a collection slot, `callback` is called once for each
   * child. If the collection is empty, `callback` is called once and with
   * -1 passed as `index`.
   */
  forEachSlot<R>(
    callback: (childId: string | null, slotName: string, index?: number) => R
  ): R[] {
    const result: R[] = [];
    this.schema.forEachSlot((slotName, isCollectionSlot) => {
      if (isCollectionSlot) {
        const childCount = this.collectionSlotSizes[slotName];
        if (childCount === 0) {
          result.push(callback(null, slotName, -1));
        }
        for (let i = 0; i < childCount; i++) {
          const child = this.slots[`${slotName}::${i}`] ?? null;
          result.push(callback(child, slotName, i));
        }
      } else {
        result.push(callback(this.slots[slotName] ?? null, slotName));
      }
    });
    return result;
  }

  setInput(
    expression: ExpressionJson,
    inputName: string,
    index?: number
  ): NodeData {
    let inputKey: string;
    const collectionSlot = this.schema.getCollectionInputSlot(inputName);
    if (collectionSlot) {
      if (
        typeof index !== "number" ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= this.collectionSlotSizes[collectionSlot]
      ) {
        throw new Error(`Invalid index '${index}' for input '${inputName}'.`);
      }
      inputKey = `${inputName}::${index}`;
    } else {
      inputKey = inputName;
    }
    if (this.inputs[inputKey]) {
      throw new Error(`Input '${inputKey}' is not empty.`);
    }
    return new NodeData(
      this.schema,
      this.id,
      { [inputName]: expression, ...this.inputs },
      this.slots,
      this.collectionSlotSizes
    );
  }

  unsetInput(inputName: string, index?: number): NodeData {
    let inputKey: string;
    const collectionSlot = this.schema.getCollectionInputSlot(inputName);
    if (collectionSlot) {
      if (
        typeof index !== "number" ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= this.collectionSlotSizes[collectionSlot]
      ) {
        throw new Error(`Invalid index '${index}' for input '${inputName}'.`);
      }
      inputKey = `${inputName}::${index}`;
    } else {
      inputKey = inputName;
    }
    if (!this.inputs[inputKey]) {
      throw new Error(`Input '${inputKey}' is empty.`);
    }
    const { [inputKey]: _, ...inputs } = this.inputs;
    return new NodeData(
      this.schema,
      this.id,
      inputs,
      this.slots,
      this.collectionSlotSizes
    );
  }

  addChild(childId: string, slotName: string, index?: number): NodeData {
    return this.schema.isCollectionSlot(slotName)
      ? this.#addCollectionChild(childId, slotName, index)
      : this.#addRegularChild(childId, slotName);
  }

  #addRegularChild(childId: string, slotName: string): NodeData {
    if (this.slots[slotName]) {
      throw new Error(`Slot '${slotName}' is not empty.`);
    }
    return new NodeData(
      this.schema,
      this.id,
      this.inputs,
      { ...this.slots, [slotName]: childId },
      this.collectionSlotSizes
    );
  }

  #addCollectionChild(
    childId: string,
    slotName: string,
    index = this.collectionSlotSizes[slotName]
  ): NodeData {
    const childCount = this.collectionSlotSizes[slotName];
    if (!Number.isInteger(index) || index < 0 || index > childCount) {
      throw new Error(`Invalid index '${index}' for slot '${slotName}'.`);
    }

    const inputs = { ...this.inputs };
    const slots = { ...this.slots };
    for (let i = childCount; i > index; i--) {
      slots[`${slotName}::${i}`] = slots[`${slotName}::${i - 1}`];
      this.schema.forEachCollectionSlotInput(slotName, (_, inputName) => {
        const prev = inputs[`${inputName}::${i - 1}`];
        if (prev) {
          inputs[`${inputName}::${i}`] = prev;
        } else {
          delete inputs[`${inputName}::${i}`];
        }
      });
    }
    slots[`${slotName}::${index}`] = childId;

    return new NodeData(this.schema, this.id, inputs, slots, {
      ...this.collectionSlotSizes,
      [slotName]: childCount + 1,
    });
  }

  removeChild(slotName: string, index?: number): NodeData {
    return this.schema.isCollectionSlot(slotName)
      ? this.#removeCollectionChild(slotName, index)
      : this.#removeRegularChild(slotName);
  }

  #removeRegularChild(slotName: string): NodeData {
    if (!this.slots[slotName]) {
      throw new Error(`Slot '${slotName}' is empty.`);
    }
    const { [slotName]: _, ...slots } = this.slots;
    return new NodeData(
      this.schema,
      this.id,
      this.inputs,
      slots,
      this.collectionSlotSizes
    );
  }

  #removeCollectionChild(slotName: string, index?: number): NodeData {
    const childCount = this.collectionSlotSizes[slotName];
    if (
      typeof index !== "number" ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= childCount
    ) {
      throw new Error(`Invalid index '${index}' for slot '${slotName}'.`);
    }

    const inputs = { ...this.inputs };
    const slots = { ...this.slots };
    for (let i = index; i < childCount; i++) {
      slots[`${slotName}::${i}`] = slots[`${slotName}::${i + 1}`];
      this.schema.forEachCollectionSlotInput(slotName, (_, inputName) => {
        const next = inputs[`${inputName}::${i + 1}`];
        if (next) {
          inputs[`${inputName}::${i}`] = next;
        } else {
          delete inputs[`${inputName}::${i}`];
        }
      });
    }
    delete slots[`${slotName}::${childCount}`];
    this.schema.forEachCollectionSlotInput(slotName, (_, inputName) => {
      delete inputs[`${inputName}::${index}`];
    });

    return new NodeData(this.schema, this.id, inputs, slots, {
      ...this.collectionSlotSizes,
      [slotName]: childCount - 1,
    });
  }

  // inferTypeVariables(context: {}): {
  //   readonly [typeVariable: string]: t.KragleType;
  // } {
  //   throw new Error("Unimplemented");
  // }

  validate(context: ValidateNodeContext): NodeErrors {
    const inputErrors = new Map<string, string>();
    this.forEachInput((expression, type, inputName, index) => {});

    const missingSlots = new Set<string>();
    this.forEachSlot((childId, slotName, index) => {});

    throw new Error("Unimplemented");
  }

  static empty(schema: NodeSchema, id: string): NodeData {
    return new NodeData(schema, id, {}, {}, {});
  }
}

export interface ValidateNodeContext {
  getNode(nodeId: string): NodeData;
}

export interface NodeErrors {
  readonly inputErrors: ReadonlyMap<string, string>;
  readonly missingSlots: Set<string>;
}

/**
 * Throws an error if `index` is `undefined`.
 */
function assertIndexParameter(
  slotName: string,
  index: number | undefined
): asserts index is number {
  if (typeof index !== "number") {
    throw new Error(
      `Parameter 'index' is required because '${slotName}' is a ` +
        `collection slot.`
    );
  }
}

// export function encodeCollectionName(
//   inputOrSlotName: string,
//   index: number
// ): string {
//   return `${inputOrSlotName}::${index}`;
// }

// export function decodeCollectionName(
//   collectionName: string
// ): [inputOrSlotName: string, index: number] {
//   const [, inputOrSlotName, index] = collectionName.match(
//     /^([a-z][A-Za-z0-9]*)::(\d+)$/
//   )!;
//   return [inputOrSlotName, Number.parseInt(index)];
// }
