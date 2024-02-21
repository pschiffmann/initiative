import { InputAttributes, NodeSchema } from "@initiative.dev/schema";
import { validateNodeId } from "@initiative.dev/schema/internals";
import { assert } from "@pschiffmann/std/assert";
import { Expression, ExpressionJson } from "./expression.js";

/**
 * Node serialization format.
 */
export interface ComponentNodeJson {
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

export interface ComponentNodeErrors {
  readonly invalidInputs: ReadonlySet<string>;
  readonly missingSlots: ReadonlySet<string>;
}

export class ComponentNodeData {
  private constructor(
    readonly schema: NodeSchema,
    readonly id: string,
    readonly inputs: { readonly [inputName: string]: Expression },
    readonly slots: ComponentNodeJson["slots"],
    readonly collectionSlotSizes: { readonly [slotName: string]: number },
    readonly parent: NodeParent | null,
  ) {
    const invalidInputs = new Set<string>();
    this.forEachInput((expr, { optional }, inputName, index) => {
      if ((!expr && !optional) || expr?.hasErrors) {
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

  readonly errors: ComponentNodeErrors | null;

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

  forEachIndexInCollectionInput<R>(
    inputName: string,
    callback: (expression: Expression | null, index: number) => R,
  ): R[] {
    const slot = this.schema.getInputAttributes(inputName).slot;
    assert(!!slot, `Input '${inputName}' is not a collection input.`);

    const result: R[] = [];
    for (let i = 0; i < this.collectionSlotSizes[slot!]; i++) {
      result.push(callback(this.inputs[`${inputName}::${i}`] ?? null, i));
    }
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
  ): ComponentNodeData {
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

    return new ComponentNodeData(
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
  ): [self: ComponentNodeData, movedChildren: Record<string, NodeParent>] {
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

  #addRegularChild(childId: string, slotName: string): ComponentNodeData {
    if (this.slots[slotName]) {
      throw new Error(`Slot '${slotName}' is not empty.`);
    }
    return new ComponentNodeData(
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
  ): ComponentNodeData {
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

    return new ComponentNodeData(
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
  ): [self: ComponentNodeData, movedChildren: Record<string, NodeParent>] {
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

  #removeRegularChild(slotName: string): ComponentNodeData {
    if (!this.slots[slotName]) {
      throw new Error(`Slot '${slotName}' is empty.`);
    }
    const { [slotName]: _, ...slots } = this.slots;
    return new ComponentNodeData(
      this.schema,
      this.id,
      this.inputs,
      slots,
      this.collectionSlotSizes,
      this.parent,
    );
  }

  #removeCollectionChild(slotName: string, index?: number): ComponentNodeData {
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
    for (let i = index; i < childCount - 1; i++) {
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
    delete slots[`${slotName}::${childCount - 1}`];
    for (const inputName of this.schema.getSlotAttributes(slotName)
      .inputNames) {
      delete inputs[`${inputName}::${childCount - 1}`];
    }

    return new ComponentNodeData(
      this.schema,
      this.id,
      inputs,
      slots,
      { ...this.collectionSlotSizes, [slotName]: childCount - 1 },
      this.parent,
    );
  }

  renameChild(
    childId: string,
    slotName: string,
    index?: number,
  ): ComponentNodeData {
    const slotKey = this.schema.getSlotAttributes(slotName).isCollectionSlot
      ? `${slotName}::${index}`
      : slotName;
    if (!this.slots[slotKey]) throw new Error(`Slot '${slotKey}' is empty.`);
    return new ComponentNodeData(
      this.schema,
      this.id,
      this.inputs,
      { ...this.slots, [slotKey]: childId },
      this.collectionSlotSizes,
      this.parent,
    );
  }

  moveCollectionChild(
    slotName: string,
    oldIndex: number,
    newIndex: number,
  ): [self: ComponentNodeData, movedChildren: Record<string, NodeParent>] {
    const { isCollectionSlot, inputNames } =
      this.schema.getSlotAttributes(slotName);
    if (!isCollectionSlot) {
      throw new Error(`Slot '${slotName}' is not a collection slot.`);
    }
    if (!this.slots[`${slotName}::${oldIndex}`]) {
      throw new Error(`Invalid index '${oldIndex}' for slot '${slotName}'.`);
    }
    if (!this.slots[`${slotName}::${newIndex}`]) {
      throw new Error(`Invalid index '${newIndex}' for slot '${slotName}'.`);
    }
    if (oldIndex === newIndex) {
      throw new Error(`'oldIndex' is equal to 'newIndex'.`);
    }

    const slots = { ...this.slots };
    const inputs = { ...this.inputs };

    // Shift siblings
    if (oldIndex < newIndex) {
      for (let i = oldIndex; i < newIndex; i++) {
        slots[`${slotName}::${i}`] = this.slots[`${slotName}::${i + 1}`];
        for (const inputName of inputNames) {
          const expr = this.inputs[`${inputName}::${i + 1}`];
          if (expr) {
            inputs[`${inputName}::${i}`] = expr;
          } else {
            delete inputs[`${inputName}::${i}`];
          }
        }
      }
    } else {
      for (let i = newIndex; i < oldIndex; i++) {
        slots[`${slotName}::${i + 1}`] = this.slots[`${slotName}::${i}`];
        for (const inputName of inputNames) {
          const expr = this.inputs[`${inputName}::${i}`];
          if (expr) {
            inputs[`${inputName}::${i + 1}`] = expr;
          } else {
            delete inputs[`${inputName}::${i + 1}`];
          }
        }
      }
    }

    // Move child from `oldIndex` to `newIndex`
    slots[`${slotName}::${newIndex}`] = this.slots[`${slotName}::${oldIndex}`];
    for (const inputName of inputNames) {
      const expr = this.inputs[`${inputName}::${oldIndex}`];
      if (expr) {
        inputs[`${inputName}::${newIndex}`] = expr;
      } else {
        delete inputs[`${inputName}::${newIndex}`];
      }
    }

    // Resolve `movedChildren`
    const movedChildren: Record<string, NodeParent> = {};
    for (
      let i = Math.min(oldIndex, newIndex);
      i <= Math.max(oldIndex, newIndex);
      i++
    ) {
      const childId = slots[`${slotName}::${i}`];
      movedChildren[childId] = { nodeId: this.id, slotName, index: i };
    }

    return [
      new ComponentNodeData(
        this.schema,
        this.id,
        inputs,
        slots,
        this.collectionSlotSizes,
        this.parent,
      ),
      movedChildren,
    ];
  }

  // inferTypeVariables(context: {}): {
  //   readonly [typeVariable: string]: t.Type;
  // } {
  //   throw new Error("Unimplemented");
  // }

  rename(
    id: string,
  ): [self: ComponentNodeData, movedChildren: Record<string, NodeParent>] {
    validateNodeId(id);
    const self = new ComponentNodeData(
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

  move(parent: NodeParent): ComponentNodeData {
    return new ComponentNodeData(
      this.schema,
      this.id,
      this.inputs,
      this.slots,
      this.collectionSlotSizes,
      parent,
    );
  }

  toJson(): ComponentNodeJson {
    const inputs: Record<string, ExpressionJson> = {};
    this.forEachInput((expression, attributes, inputName, index) => {
      if (!expression) return;
      const inputKey =
        index === undefined ? inputName : `${inputName}::${index}`;
      inputs[inputKey] = expression.toJson();
    });
    return { type: this.type, inputs, slots: this.slots };
  }

  static empty(
    schema: NodeSchema,
    id: string,
    parent: NodeParent | null,
  ): ComponentNodeData {
    validateNodeId(id);
    const collectionSlotSizes: { [slotName: string]: number } = {};
    schema.forEachSlot((slotName, { isCollectionSlot }) => {
      if (isCollectionSlot) collectionSlotSizes[slotName] = 0;
    });
    return new ComponentNodeData(
      schema,
      id,
      {},
      {},
      collectionSlotSizes,
      parent,
    );
  }
}
