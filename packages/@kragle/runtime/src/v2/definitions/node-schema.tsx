import { ComponentType, PropsWithChildren } from "react";
import * as t from "../../type-system/index.js";
import { NodeJson } from "../scene-data/node-data.js";
import {
  validateNodeInputName,
  validateNodeOutputName,
  validateNodeSchemaName,
  validateNodeSlotName,
} from "../validate-names.js";

//
// NodeSchemaInit
//

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

export interface SlotSchema {
  /**
   * If a slot schema has an `inputs` key (even if it is empty), then that slot
   * is a collection slot and can accept any number of children, including 0.
   */
  readonly inputs?: t.KragleTypeRecord;
  readonly outputs?: t.KragleTypeRecord;
}

export type SlotSchemas = { readonly [slotName: string]: SlotSchema };

/**
 * This callback can be used to implement custom validation logic. It is only
 * called if `nodeJson` has passed the type system based validation.
 */
export type ValidateNode = (nodeJson: NodeJson) => string | null;

//
// NodeSchema
//

export class NodeSchema<
  I extends t.KragleTypeRecord = {},
  O extends t.KragleTypeRecord = {},
  S extends SlotSchemas = {}
> {
  constructor(
    readonly name: string,
    init: NodeSchemaInit<I, O, S> // | GenericNodeSchemaInit<I, O, S>
  ) {
    validateNodeSchemaName(name);

    const canonicalizedInputTypes: Record<string, t.KragleType> = {};
    for (const [inputName, type] of Object.entries(init.inputs ?? {})) {
      validateNodeInputName(name, inputName);
      canonicalizedInputTypes[inputName] = type.canonicalize();
    }

    const canonicalizedOutputTypes: Record<string, t.KragleType> = {};
    for (const [outputName, type] of Object.entries(init.outputs ?? {})) {
      validateNodeOutputName(name, outputName);
      canonicalizedOutputTypes[outputName] = type.canonicalize();
    }

    const slotAttributes: Record<string, SlotAttributes> = {};
    const collectionInputSlots: Record<string, string> = {};
    const scopedOutputSlots: Record<string, string> = {};
    for (const [slotName, slotSchema] of Object.entries(init.slots ?? {})) {
      const { inputs = {}, outputs = {} } = slotSchema;
      validateNodeSlotName(name, slotName);
      slotAttributes[slotName] = {
        isCollectionSlot: !!slotSchema.inputs,
        inputNames: Object.keys(inputs),
        outputNames: Object.keys(outputs),
      };

      for (const [inputName, type] of Object.entries(inputs)) {
        validateNodeInputName(name, inputName);
        if (canonicalizedInputTypes[inputName]) {
          throw new Error(
            `NodeSchema '${name}' must not contain multiple declarations of ` +
              `input '${inputName}'.`
          );
        }
        collectionInputSlots[inputName] = slotName;
        canonicalizedInputTypes[inputName] = type.canonicalize();
      }

      for (const [outputName, type] of Object.entries(outputs)) {
        validateNodeOutputName(name, outputName);
        if (canonicalizedOutputTypes[outputName]) {
          throw new Error(
            `NodeSchema '${name}' must not contain multiple declarations of ` +
              `output '${outputName}'.`
          );
        }
        scopedOutputSlots[outputName] = slotName;
        canonicalizedOutputTypes[outputName] = type.canonicalize();
      }
    }

    this.inputTypes = canonicalizedInputTypes;
    this.collectionInputSlots = collectionInputSlots;
    this.outputTypes = canonicalizedOutputTypes;
    this.scopedOutputSlots = scopedOutputSlots;
    this.slotAttributes = slotAttributes;
    this.validate = init.validate;
  }

  readonly inputTypes: t.KragleTypeRecord;

  /**
   * Map from collection input name to slot name it belongs to.
   */
  readonly collectionInputSlots: { readonly [inputName: string]: string };

  readonly outputTypes: t.KragleTypeRecord;

  /**
   * Map from scoped output name to slot name it belongs to.
   */
  readonly scopedOutputSlots: { readonly [outputName: string]: string };

  readonly slotAttributes: { readonly [slotName: string]: SlotAttributes };

  readonly validate?: ValidateNode;

  /**
   * Returns the slot name that `inputName` belongs to, or `null` if `inputName`
   * is a regular input.
   *
   * Throws an error if `inputName` doesn't exist.
   */
  getCollectionInputSlot(inputName: string): string | null {
    if (!this.inputTypes[inputName]) {
      throw new Error(
        `Input '${inputName}' doesn't exist on schema '${this.name}'.`
      );
    }
    return this.collectionInputSlots[inputName] ?? null;
  }

  /**
   * Returns the slot name that `outputName` belongs to, or `null` if
   * `outputName` is a regular output.
   *
   * Throws an error if `outputName` doesn't exist.
   */
  getScopedOutputSlot(outputName: string): string | null {
    if (!this.outputTypes[outputName]) {
      throw new Error(
        `Output '${outputName}' doesn't exist on schema '${this.name}'.`
      );
    }
    return this.scopedOutputSlots[outputName] ?? null;
  }

  /**
   * Calls `callback` for each input. If `inputName` is a collection input,
   * `slotName` contains the slot name this input belongs to.
   */
  forEachInput<R>(
    callback: (type: t.KragleType, inputName: string, slotName?: string) => R
  ): R[] {
    return Object.entries(this.inputTypes).map(([inputName, type]) =>
      callback(type, inputName, this.collectionInputSlots[inputName])
    );
  }

  /**
   * Calls `callback` for each input that belongs to `slotName`.
   *
   * Throws an error if `slotName` is not a collection slot.
   */
  forEachCollectionSlotInput<R>(
    slotName: string,
    callback: (type: t.KragleType, inputName: string) => R
  ): R[] {
    const slotAttributes = this.slotAttributes[slotName];
    if (!slotAttributes) {
      throw new Error(`NodeSchema '${this.name}' has no slot '${slotName}'.`);
    }
    if (!slotAttributes.isCollectionSlot) {
      throw new Error(
        `Slot '${slotName}' of NodeSchema '${this.name}' is not a collection ` +
          `slot.`
      );
    }
    return slotAttributes.inputNames.map((inputName) =>
      callback(this.inputTypes[inputName], inputName)
    );
  }

  isCollectionSlot(slotName: string): boolean {
    const slotAttributes = this.slotAttributes[slotName];
    if (!slotAttributes) {
      throw new Error(
        `Slot '${slotName}' doesn't exist on schema '${this.name}'.`
      );
    }
    return slotAttributes.isCollectionSlot;
  }

  forEachSlot<R>(
    callback: (slotName: string, slotAttributes: SlotAttributes) => R
  ): R[] {
    return Object.entries(this.slotAttributes).map(([slotName, attributes]) =>
      callback(slotName, attributes)
    );
  }

  forEachOutput<R>(
    callback: (type: t.KragleType, outputName: string, slotName?: string) => R
  ): R[] {
    return Object.entries(this.outputTypes).map(([outputName, type]) =>
      callback(type, outputName, this.scopedOutputSlots[outputName])
    );
  }
}

export interface SlotAttributes {
  readonly isCollectionSlot: boolean;
  readonly inputNames: readonly string[];
  readonly outputNames: readonly string[];
}

//
// Type inference
//

type UnwrapAllSlotInputs<S extends SlotSchemas> = {
  readonly [k in keyof S]: UnwrapSingleSlotInputs<S[k]["inputs"]>;
};
type UnwrapSingleSlotInputs<I extends t.KragleTypeRecord | undefined> =
  I extends t.KragleTypeRecord
    ? { readonly [k in keyof I]: readonly t.Unwrap<I[k]>[] }
    : {};

type NestedKeys<T extends {}> = {
  [k in keyof T]: keyof T[k] & string;
}[keyof T];
type Flatten<T extends Record<string, {}>> = {
  readonly [k in NestedKeys<T>]: T[keyof T][k];
};

type AddKeys<T extends {}, K extends string> = {
  [k in K]: k extends keyof T ? T[k] : never;
};
type AddNestedKeys<T extends Record<string, {}>, K extends string> = {
  [k in keyof T]: AddKeys<T[k], K>;
};

// TODO: Explain this magic
type FlattenSlotInputs<S extends SlotSchemas> = Flatten<
  AddNestedKeys<UnwrapAllSlotInputs<S>, NestedKeys<UnwrapAllSlotInputs<S>>>
>;

//
// React component props
//

export type InferProps<N extends NodeSchema> = N extends NodeSchema<
  infer I,
  infer O,
  infer S
>
  ? t.UnwrapRecord<I> &
      FlattenSlotInputs<S> &
      SlotPropMixin<S> &
      OutputsProviderPropMixin<O>
  : {};

type SlotPropMixin<S extends SlotSchemas> = keyof S extends never
  ? {}
  : {
      readonly slots: {
        readonly [slotName in keyof S]: S[slotName]["inputs"] extends {}
          ? {
              readonly length: number;
              readonly Component: ComponentType<
                SlotWithInputsComponentPropsMixin<S[slotName]> &
                  SlotWithOutputsComponentPropsMixin<S[slotName]>
              >;
            }
          : {
              readonly Component: ComponentType<
                SlotWithInputsComponentPropsMixin<S[slotName]> &
                  SlotWithOutputsComponentPropsMixin<S[slotName]>
              >;
            };
      };
    };

type SlotWithInputsComponentPropsMixin<S extends SlotSchema> =
  S["inputs"] extends {} ? { readonly index: number } : {};

type SlotWithOutputsComponentPropsMixin<S extends SlotSchema> =
  S["outputs"] extends {} ? t.UnwrapRecord<S["outputs"]> : {};

type OutputsProviderPropMixin<O extends t.KragleTypeRecord> =
  keyof O extends never
    ? {}
    : { OutputsProvider: ComponentType<PropsWithChildren<t.UnwrapRecord<O>>> };
