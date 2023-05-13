import * as t from "../type-system/index.js";
import { NodeJson } from "./node-data.js";

interface NodeSchemaInit<
  I extends t.KragleTypeRecord = {},
  O extends t.KragleTypeRecord = {},
  S extends SlotSchemas = {}
> {
  readonly inputs?: I;
  readonly outputs?: O;
  readonly slots?: S;
  readonly validate?: ValidateNode;
}

type GenericNodeSchemaInit<
  I extends t.KragleTypeRecord = {},
  O extends t.KragleTypeRecord = {},
  S extends SlotSchemas = {}
> = <
  TypeVariable1,
  TypeVariable2,
  TypeVariable3,
  TypeVariable4,
  TypeVariable5,
  TypeVariable6,
  TypeVariable7,
  TypeVariable8
>(
  t1: t.Entity<TypeVariable1>,
  t2: t.Entity<TypeVariable2>,
  t3: t.Entity<TypeVariable3>,
  t4: t.Entity<TypeVariable4>,
  t5: t.Entity<TypeVariable5>,
  t6: t.Entity<TypeVariable6>,
  t7: t.Entity<TypeVariable7>,
  t8: t.Entity<TypeVariable8>
) => NodeSchemaInit<I, O, S>;

export class NodeSchema<
  I extends t.KragleTypeRecord = {},
  O extends t.KragleTypeRecord = {},
  S extends SlotSchemas = {}
> {
  constructor(
    readonly name: string,
    init: NodeSchemaInit<I, O, S> // | GenericNodeSchemaInit<I, O, S>
  ) {
    this.inputs = init.inputs ?? {};
    this.collectionInputSlots = {};
    this.outputs = init.outputs ?? {};
    this.collectionOutputSlots = {};
    this.slots = init.slots ?? {};
    this.validate = init.validate;
  }

  readonly inputs: t.KragleTypeRecord;

  /**
   * Map from collection input name to slot name it belongs to.
   */
  readonly collectionInputSlots: { readonly [inputName: string]: string };

  readonly outputs: t.KragleTypeRecord;

  /**
   * Map from collection output name to slot name it belongs to.
   */
  readonly collectionOutputSlots: { readonly [outputName: string]: string };

  readonly slots: SlotSchemas;
  readonly validate?: ValidateNode;

  /**
   * Returns the slot name that `inputName` belongs to, or `null` if `inputName`
   * is a regular input.
   *
   * Throws an error if `inputName` doesn't exist.
   */
  getCollectionInputSlot(inputName: string): string | null {
    throw new Error("Unimplemented");
  }

  /**
   * Throws an error if `slotName` doesn't exist.
   */
  isCollectionSlot(slotName: string): boolean {
    throw new Error("Unimplemented");
  }

  forEachInput<R>(
    callback: (type: t.KragleType, inputName: string, slotName?: string) => R
  ): R[] {
    throw new Error("Unimplemented");
  }

  forEachCollectionSlotInput<R>(
    slotName: string,
    callback: (type: t.KragleType, inputName: string) => R
  ): R[] {
    throw new Error("Unimplemented");
  }

  forEachSlot<R>(
    callback: (slotName: string, isCollectionSlot: boolean) => R
  ): R[] {
    return Object.entries(this.slots).map(([slotName, slotSchema]) =>
      callback(slotName, !!slotSchema.inputs)
    );
  }

  forEachOutput<R>(
    callback: (type: t.KragleType, outputName: string, slotName?: string) => R
  ): R[] {
    throw new Error("Unimplemented");
  }
}

/**
 * This callback can be used to implement custom validation logic. It is only
 * called if `nodeJson` has passed the type system based validation.
 */
export type ValidateNode = (nodeJson: NodeJson) => string | null;

//
// Slots
//

export interface SlotSchema {
  /**
   * If a slot schema has an `inputs` key (even if it is empty), then that slot
   * is a collection slot and can accept any number of children, including 0.
   */
  readonly inputs?: t.KragleTypeRecord;
  readonly outputs?: t.KragleTypeRecord;
}

export type SlotSchemas = Readonly<Record<string, SlotSchema>>;
