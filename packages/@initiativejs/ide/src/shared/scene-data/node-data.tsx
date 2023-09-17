import { InputAttributes, NodeSchema } from "@initiativejs/schema";
import { validateNodeId } from "@initiativejs/schema/internals";
import * as $Object from "@pschiffmann/std/object";
import {
  Expression,
  ExpressionJson,
  MemberAccessExpression,
} from "./expression.js";

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

export interface NodeParent {
  readonly nodeId: string;
  readonly slotName: string;
  readonly index?: number;
}

export interface NodeErrors {
  readonly invalidInputs: ReadonlySet<string>;
  readonly missingSlots: ReadonlySet<string>;
}

export class NodeData {
  private constructor(
    readonly schema: NodeSchema,
    readonly id: string,
    readonly inputs: { readonly [inputName: string]: Expression },
    readonly slots: NodeJson["slots"],
    readonly collectionSlotSizes: { readonly [slotName: string]: number },
    readonly parent: NodeParent | null,
  ) {
    const invalidInputs = new Set<string>();
    this.forEachInput((expr, { optional }, inputName, index) => {
      if (
        (!expr && !optional) ||
        (expr instanceof MemberAccessExpression && !expr.isComplete)
      ) {
        invalidInputs.add(
          index === undefined ? inputName : `${inputName}::${index}`,
        );
      }
    });
    const missingSlots = new Set<string>();
    schema.forEachSlot((slotName, { isCollectionSlot }) => {
      if (!isCollectionSlot && !slots[slotName]) missingSlots.add(slotName);
    });
    this.errors =
      invalidInputs.size > 0 || missingSlots.size > 0
        ? { invalidInputs, missingSlots }
        : null;
  }

  get type(): string {
    return this.schema.name;
  }

  readonly errors: NodeErrors | null;

  /**
   * Calls `callback` for each input defined in the node schema.
   *
   * If an input doesn't have an expression, `callback` is called with `null`
   * instead.
   *
   * If `inputName` is a collection input, `callback` is called once for each
   * child in that collection slot, even if some inputs don't have expressions.
   * If the collection is empty, `callback` is called once and with -1 passed as
   * `index`.
   */
  forEachInput<R>(
    callback: (
      expression: Expression | null,
      attributes: InputAttributes,
      inputName: string,
      index?: number,
    ) => R,
  ): R[] {
    const result: R[] = [];
    this.schema.forEachInput((inputName, attributes) => {
      if (attributes.slot) {
        const childCount = this.collectionSlotSizes[attributes.slot];
        if (childCount === 0) {
          result.push(callback(null, attributes, inputName, -1));
        }
        for (let i = 0; i < childCount; i++) {
          const expression = this.inputs[`${inputName}::${i}`] ?? null;
          result.push(callback(expression, attributes, inputName, i));
        }
      } else {
        result.push(
          callback(this.inputs[inputName] ?? null, attributes, inputName),
        );
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
    callback: (childId: string | null, slotName: string, index?: number) => R,
  ): R[] {
    const result: R[] = [];
    this.schema.forEachSlot((slotName, { isCollectionSlot }) => {
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

  forEachChildInSlot<R>(
    slotName: string,
    callback: (childId: string, index: number) => R,
  ): R[] {
    const result: R[] = [];
    if (this.schema.getSlotAttributes(slotName).isCollectionSlot) {
      for (let i = 0; i < this.collectionSlotSizes[slotName]; i++) {
        result.push(callback(this.slots[`${slotName}::${i}`], i));
      }
    } else {
      const childId = this.slots[slotName];
      if (childId) result.push(callback(childId, -1));
    }
    return result;
  }

  setInput(
    expression: Expression | null,
    inputName: string,
    index?: number,
  ): NodeData {
    let inputKey: string;
    const { slot } = this.schema.getInputAttributes(inputName);
    if (slot) {
      if (
        typeof index !== "number" ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= this.collectionSlotSizes[slot]
      ) {
        throw new Error(`Invalid index '${index}' for input '${inputName}'.`);
      }
      inputKey = `${inputName}::${index}`;
    } else {
      inputKey = inputName;
    }

    const inputs = { ...this.inputs };
    if (expression) {
      inputs[inputKey] = expression;
    } else {
      delete inputs[inputKey];
    }

    return new NodeData(
      this.schema,
      this.id,
      inputs,
      this.slots,
      this.collectionSlotSizes,
      this.parent,
    );
  }

  addChild(
    childId: string,
    slotName: string,
    index = this.collectionSlotSizes[slotName],
  ): [self: NodeData, movedChildren: Record<string, NodeParent>] {
    if (!this.schema.getSlotAttributes(slotName).isCollectionSlot) {
      const self = this.#addRegularChild(childId, slotName);
      return [self, { [childId]: { nodeId: this.id, slotName } }];
    } else {
      const self = this.#addCollectionChild(childId, slotName, index);
      const movedChildren: Record<string, NodeParent> = {};
      for (let i = index!; i < self.collectionSlotSizes[slotName]; i++) {
        const parent: NodeParent = { nodeId: self.id, slotName, index: i };
        movedChildren[self.slots[`${slotName}::${i}`]] = parent;
      }
      return [self, movedChildren];
    }
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
      this.collectionSlotSizes,
      this.parent,
    );
  }

  #addCollectionChild(
    childId: string,
    slotName: string,
    index: number,
  ): NodeData {
    const childCount = this.collectionSlotSizes[slotName];
    if (!Number.isInteger(index) || index < 0 || index > childCount) {
      throw new Error(`Invalid index '${index}' for slot '${slotName}'.`);
    }

    const inputs = { ...this.inputs };
    const slots = { ...this.slots };
    for (let i = childCount; i > index; i--) {
      slots[`${slotName}::${i}`] = slots[`${slotName}::${i - 1}`];
      for (const inputName of this.schema.getSlotAttributes(slotName)
        .inputNames) {
        const prev = inputs[`${inputName}::${i - 1}`];
        if (prev) {
          inputs[`${inputName}::${i}`] = prev;
        } else {
          delete inputs[`${inputName}::${i}`];
        }
      }
    }
    slots[`${slotName}::${index}`] = childId;

    return new NodeData(
      this.schema,
      this.id,
      inputs,
      slots,
      { ...this.collectionSlotSizes, [slotName]: childCount + 1 },
      this.parent,
    );
  }

  removeChild(
    slotName: string,
    index?: number,
  ): [self: NodeData, movedChildren: Record<string, NodeParent>] {
    if (!this.schema.getSlotAttributes(slotName).isCollectionSlot) {
      const self = this.#removeRegularChild(slotName);
      return [self, {}];
    } else {
      const self = this.#removeCollectionChild(slotName, index);
      const movedChildren: Record<string, NodeParent> = {};
      for (let i = index!; i < self.collectionSlotSizes[slotName]; i++) {
        const parent: NodeParent = { nodeId: self.id, slotName, index: i };
        movedChildren[self.slots[`${slotName}::${i}`]] = parent;
      }
      return [self, movedChildren];
    }
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
      this.collectionSlotSizes,
      this.parent,
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
      for (const inputName of this.schema.getSlotAttributes(slotName)
        .inputNames) {
        const next = inputs[`${inputName}::${i + 1}`];
        if (next) {
          inputs[`${inputName}::${i}`] = next;
        } else {
          delete inputs[`${inputName}::${i}`];
        }
      }
    }
    delete slots[`${slotName}::${childCount}`];
    for (const inputName of this.schema.getSlotAttributes(slotName)
      .inputNames) {
      delete inputs[`${inputName}::${index}`];
    }

    return new NodeData(
      this.schema,
      this.id,
      inputs,
      slots,
      { ...this.collectionSlotSizes, [slotName]: childCount - 1 },
      this.parent,
    );
  }

  renameChild(childId: string, slotName: string, index?: number): NodeData {
    const slotKey = this.schema.getSlotAttributes(slotName).isCollectionSlot
      ? `${slotName}::${index}`
      : slotName;
    if (!this.slots[slotKey]) throw new Error(`Slot '${slotKey}' is empty.`);
    return new NodeData(
      this.schema,
      this.id,
      this.inputs,
      { ...this.slots, [slotKey]: childId },
      this.collectionSlotSizes,
      this.parent,
    );
  }

  // inferTypeVariables(context: {}): {
  //   readonly [typeVariable: string]: t.Type;
  // } {
  //   throw new Error("Unimplemented");
  // }

  rename(
    id: string,
  ): [self: NodeData, movedChildren: Record<string, NodeParent>] {
    validateNodeId(id);
    const self = new NodeData(
      this.schema,
      id,
      this.inputs,
      this.slots,
      this.collectionSlotSizes,
      this.parent,
    );
    const movedChildren: Record<string, NodeParent> = {};
    self.forEachSlot((childId, slotName, index) => {
      if (!childId) return;
      movedChildren[childId] = { nodeId: id, slotName, index };
    });
    return [self, movedChildren];
  }

  move(parent: NodeParent): NodeData {
    return new NodeData(
      this.schema,
      this.id,
      this.inputs,
      this.slots,
      this.collectionSlotSizes,
      parent,
    );
  }

  toJson(): NodeJson {
    return {
      type: this.type,
      inputs: $Object.map(this.inputs, (_, expression) => expression.toJson()),
      slots: this.slots,
    };
  }

  static empty(
    schema: NodeSchema,
    id: string,
    parent: NodeParent | null,
  ): NodeData {
    validateNodeId(id);
    const collectionSlotSizes: { [slotName: string]: number } = {};
    schema.forEachSlot((slotName, { isCollectionSlot }) => {
      if (isCollectionSlot) collectionSlotSizes[slotName] = 0;
    });
    return new NodeData(schema, id, {}, {}, collectionSlotSizes, parent);
  }
}
