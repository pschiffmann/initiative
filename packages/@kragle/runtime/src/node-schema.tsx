import { ComponentType, ReactNode } from "react";
import * as t from "./type-system/index.js";
import { isInputId } from "./util/kragle-identifier.js";

export class NodeSchema<
  I extends t.KragleTypeRecord = {},
  O extends t.KragleTypeRecord = {},
  S extends SlotSchemas = {}
> {
  constructor(
    readonly name: string,
    { inputs, outputs, slots }: Omit<NodeSchema<I, O, S>, "name">
  ) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.slots = slots;

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

  readonly inputs?: I;
  readonly outputs?: O;
  readonly slots?: S;
}

//
// Slots
//

interface SlotSchema {
  readonly inputs?: t.KragleTypeRecord;
  readonly outputs?: t.KragleTypeRecord;
}

type SlotSchemas = Readonly<Record<string, SlotSchema>>;

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
  children?(slots: InferSlotComponentTypes<S>): ReactNode;
};

type InferSlotComponentTypes<S extends SlotSchemas> = {
  readonly [k in keyof S]: ComponentType<t.UnwrapRecord<S[k]["outputs"]>>;
};
