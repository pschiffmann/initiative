import { ComponentType, ReactNode } from "react";
import * as t from "./type-system/index.js";

export class NodeSchema<
  I extends t.KragleTypeRecord = {},
  O extends t.KragleTypeRecord = {},
  S extends SlotDefinitions = {}
> {
  constructor(
    readonly name: string,
    { inputs, outputs, slots }: Omit<NodeSchema<I, O, S>, "name">
  ) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.slots = slots;
  }

  readonly inputs?: I;
  readonly outputs?: O;
  readonly slots?: S;
}

//
// Slots
//

interface SlotDefinition {
  readonly inputs?: t.KragleTypeRecord;
  readonly outputs?: t.KragleTypeRecord;
}

type SlotDefinitions = Readonly<Record<string, SlotDefinition>>;

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
type UnwrapAllSlotInputs<S extends SlotDefinitions> = {
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

const slots = {
  slotX: {
    inputs: {
      a: t.string(),
      b: t.optional(t.number()),
    },
  },
  slotY: {
    inputs: {
      a: t.null(),
      c: t.boolean(),
    },
  },
};

type T6 = UnwrapAllSlotInputs<typeof slots>;
type T7 = Flatten<AddNestedKeys<T6, NestedKeys<T6>>>;

export type InferSlotComponentTypes<S extends SlotDefinitions> = {
  readonly [k in keyof S]: ComponentType<t.UnwrapRecord<S[k]["outputs"]>>;
};

//
// React component props
//

export type InferProps<N extends NodeSchema> = N extends NodeSchema<
  infer I,
  infer O,
  infer S
>
  ? t.UnwrapRecord<I> & {
      OutputsProvider: ComponentType<OutputsProviderProps<O, S>>;
    }
  : {};

type OutputsProviderProps<
  O extends t.KragleTypeRecord,
  S extends SlotDefinitions
> = t.UnwrapRecord<O> & {
  children?(slots: InferSlotComponentTypes<S>): ReactNode;
};
