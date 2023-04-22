import { ComponentType, ReactNode } from "react";
import { NodeJson } from "./scene-document/index.js";
import * as t from "./type-system/index.js";
import { isInputId } from "./util/kragle-identifier.js";

export type AnyNodeSchema = NodeSchema<
  t.KragleTypeRecord,
  t.KragleTypeRecord,
  SlotSchemas
>;

export class NodeSchema<
  I extends t.KragleTypeRecord = {},
  O extends t.KragleTypeRecord = {},
  S extends SlotSchemas = {}
> {
  constructor(
    readonly name: string,
    {
      inputs,
      outputs,
      slots,
    }: Partial<Pick<NodeSchema<I, O, S>, "inputs" | "outputs" | "slots">>
  ) {
    this.inputs = inputs ?? ({} as any);
    this.outputs = outputs ?? ({} as any);
    this.slots = slots ?? ({} as any);

    const allInputs = new Set<string>();
    function validateInputName(inputName: string) {
      if (!isInputId(inputName)) {
        throw new Error(`Invalid input id: ${inputName}`);
      }
      if (allInputs.has(inputName)) {
        throw new Error(`Duplicate input id: ${inputName}`);
      }
      allInputs.add(inputName);
    }

    Object.keys(inputs ?? {}).forEach(validateInputName);
    Object.values(slots ?? {})
      .flatMap((slot) => Object.keys(slot.inputs ?? {}))
      .forEach(validateInputName);
  }

  readonly inputs: I;
  readonly outputs: O;
  readonly slots: S;
  readonly validate?: ValidateNode;

  /**
   * Map from collection input name to slot name.
   */
  #collectionInputSources = new Map<string, string>();

  *getCollectionInputs(): Iterable<[inputName: string, type: t.KragleType]> {
    for (const slotSchema of Object.values(this.slots)) {
      if (slotSchema.inputs) yield* Object.entries(slotSchema.inputs);
    }
  }

  *getCollectionSlots(): Iterable<string> {
    for (const [slotName, slotSchema] of Object.entries(this.slots)) {
      if (slotSchema.inputs) yield slotName;
    }
  }

  isCollectionSlot(slotName: string): boolean {
    const slotSchema = this.slots[slotName];
    if (slotSchema) return !!slotSchema.inputs;
    throw new Error(`Slot '${slotName}' doesn't exist on type '${this.name}'.`);
  }

  isCollectionInput(inputName: string): boolean {
    if (this.inputs.hasOwnProperty(inputName)) return false;
    for (const slotSchema of Object.values(this.slots)) {
      if (slotSchema.inputs?.hasOwnProperty(inputName)) return true;
    }
    throw new Error(
      `Input '${inputName}' doesn't exist on type '${this.name}'.`
    );
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

/**
 * Usage:
 * ```ts
 * const slots = {
 *   slotX: {
 *     inputs: {
 *       a: t.string(),
 *       b: t.optional(t.number()),
 *     },
 *   },
 *   slotY: {
 *     inputs: {
 *       a: t.null(),
 *       c: t.boolean(),
 *     },
 *   },
 * };
 *
 * type T1 = UnwrapAllSlotInputs<typeof slots>;
 * // type T1 = {
 * //   readonly slotX: {
 * //       readonly a: readonly string[];
 * //       readonly b: readonly (number | undefined)[];
 * //   };
 * //   readonly slotY: {
 * //       readonly a: readonly null[];
 * //       readonly c: readonly boolean[];
 * //   };
 * // }
 * ```
 */
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
      FlattenSlotInputs<S> & {
        OutputsProvider: ComponentType<OutputsProviderProps<O, S>>;
      }
  : {};

type OutputsProviderProps<
  O extends t.KragleTypeRecord,
  S extends SlotSchemas
> = t.UnwrapRecord<O> & {
  // className?: string;
  // style?: CSSProperties;
  children?(slots: InferSlotComponentTypes<S>): ReactNode;
};

type InferSlotComponentTypes<S extends SlotSchemas> = {
  readonly [k in keyof S]: S[k]["inputs"] extends {}
    ? readonly ComponentType<t.UnwrapRecord<S[k]["outputs"]>>[]
    : ComponentType<t.UnwrapRecord<S[k]["outputs"]>>;
};
