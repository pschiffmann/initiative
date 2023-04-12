import { FC, ReactNode } from "react";
import * as t from "./type-system/index.js";

export class NodeSpec<
  I extends t.KragleTypeRecord = {},
  O extends t.KragleTypeRecord = {},
  S extends SlotDefinitions = {}
> {
  constructor(
    readonly name: string,
    { inputs, outputs, slots }: Omit<NodeSpec<I, O, S>, "name">
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

type SlotDefinition =
  | DefaultSlotDefinition
  | CollectionSlotDefinition
  | TemplateSlotDefinition;

interface DefaultSlotDefinition {
  readonly type?: "default";
}

interface CollectionSlotDefinition {
  readonly type: "collection";
  readonly inputs?: t.KragleTypeRecord;
}

interface TemplateSlotDefinition {
  readonly type: "template";
  readonly outputs?: t.KragleTypeRecord;
}

type SlotDefinitions = Readonly<Record<string, SlotDefinition>>;

type InferSlotType<T extends SlotDefinition> = T extends TemplateSlotDefinition
  ? FC<t.UnwrapRecord<T["outputs"]>>
  : FC<{}>;

type InferSlotTypes<T extends SlotDefinitions | undefined> =
  T extends SlotDefinitions ? { [k in keyof T]: InferSlotType<T[k]> } : {};

//
// React component props
//

export type InferProps<N extends NodeSpec> = N extends NodeSpec<
  infer I,
  infer O,
  infer S
>
  ? t.UnwrapRecord<I> & {
      OutputsProvider: FC<t.UnwrapRecord<O> & OutputsProviderProps<O, S>>;
    }
  : {};

type OutputsProviderProps<
  O extends t.KragleTypeRecord,
  S extends SlotDefinitions
> = t.UnwrapRecord<O> & {
  children?(slots: InferSlotTypes<S>): ReactNode;
};
