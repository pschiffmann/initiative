import { ObjectMap } from "@pschiffmann/std/object-map";
import { CSSProperties, ComponentType, PropsWithChildren } from "react";
import { Flatten } from "../type-helpers/index.js";
import * as t from "../type-system/index.js";
import { InputInit, NodeSchema, OutputInit, SlotInit } from "./node-schema.js";

export interface StyleProps {
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * Infers the `props` type for a node component from a `NodeSchema`.
 *
 * Usage:
 * ```ts
 * export const MyBlocSchema = new NodeSchema(...);
 * export type MyBlocSchema = typeof MyBlocSchema;
 *
 * export function MyBloc({ ... }: NodeComponentProps<MyBlocSchema>) {
 *   ...
 * }
 * ```
 */
export type NodeComponentProps<nodeSchema extends NodeSchema> =
  nodeSchema extends NodeSchema<infer I, infer O, infer S>
    ? StyleProps &
        RegularInputTypes<I> &
        CollectionInputTypes<S> &
        (keyof S extends never
          ? {}
          : {
              // TODO: Instead of generating a single `<SlotComponent index={...}>`,
              // we can generate an array of components for collection slots.
              // This way, we also don't need the extra `.size` and `.Component`
              // props.
              readonly slots: {
                readonly [slotName in keyof S &
                  string]: (S[slotName]["inputs"] extends {}
                  ? { readonly size: number }
                  : {}) & {
                  readonly Component: ComponentType<
                    SlotComponentProps<nodeSchema, slotName>
                  >;
                };
              };
            }) &
        (keyof O extends never
          ? {}
          : {
              readonly OutputsProvider: ComponentType<
                OutputsProviderProps<nodeSchema>
              >;
            })
    : never;

export type OutputsProviderProps<nodeSchema extends NodeSchema> =
  nodeSchema extends NodeSchema<any, infer O, any>
    ? PropsWithChildren<RegularOutputTypes<O>>
    : never;

export type SlotComponentProps<
  nodeSchema extends NodeSchema,
  slotName extends string,
> = nodeSchema extends NodeSchema<any, any, infer S>
  ? slotName extends keyof S
    ? StyleProps &
        (S[slotName]["inputs"] extends {} ? { readonly index: number } : {}) &
        (S[slotName]["outputs"] extends {}
          ? RegularOutputTypes<S[slotName]["outputs"]>
          : {})
    : never
  : never;

export type OutputTypes<nodeSchema extends NodeSchema> =
  nodeSchema extends NodeSchema<any, infer O, infer S>
    ? RegularOutputTypes<O> & ScopedOutputTypes<S>
    : never;

type RegularInputTypes<I extends ObjectMap<InputInit>> = {
  readonly [inputName in RequiredInputs<I>]: t.Unwrap<I[inputName]["type"]>;
} & {
  readonly [inputName in OptionalInputs<I>]?: t.Unwrap<I[inputName]["type"]>;
};

type RequiredInputs<I extends ObjectMap<InputInit>> = {
  [inputName in keyof I]: I[inputName]["optional"] extends true
    ? never
    : inputName;
}[keyof I];

type OptionalInputs<I extends ObjectMap<InputInit>> = {
  [inputName in keyof I]: I[inputName]["optional"] extends true
    ? inputName
    : never;
}[keyof I];

/**
 * Input:
 * ```ts
 * const slots = {
 *   slot1: {
 *     inputs: {
 *       x: { type: t.string() },
 *       y: { type: t.number() },
 *     },
 *   },
 *   slot2: {},
 *   slot3: {
 *     inputs: {
 *       y: { type: t.boolean() },
 *       z: { type: t.any() },
 *     },
 *   },
 * } satisfies NodeSchemaSlots;
 *
 * type Input = typeof slots;
 * ```
 *
 * Output:
 * ```ts
 * type Output = {
 *   readonly x: readonly string[];
 *   readonly y: readonly number[] | readonly boolean[];
 *   readonly z: readonly any[];
 * };
 * ```
 */
type CollectionInputTypes<S extends ObjectMap<SlotInit>> = Flatten<{
  readonly [slotName in keyof S]: S[slotName]["inputs"] extends {}
    ? {
        readonly [inputName in RequiredInputs<
          S[slotName]["inputs"]
        >]: readonly t.Unwrap<S[slotName]["inputs"][inputName]["type"]>[];
      } & {
        readonly [inputName in OptionalInputs<
          S[slotName]["inputs"]
        >]: readonly (
          | t.Unwrap<S[slotName]["inputs"][inputName]["type"]>
          | undefined
        )[];
      }
    : {};
}>;

type RegularOutputTypes<O extends ObjectMap<OutputInit>> = {
  readonly [outputName in keyof O]: t.Unwrap<O[outputName]["type"]>;
};

type ScopedOutputTypes<S extends ObjectMap<SlotInit>> = Flatten<{
  readonly [slotName in keyof S]: S[slotName]["outputs"] extends {}
    ? {
        readonly [outputName in keyof S[slotName]["outputs"]]: t.Unwrap<
          S[slotName]["outputs"][outputName]["type"]
        >;
      }
    : {};
}>;
