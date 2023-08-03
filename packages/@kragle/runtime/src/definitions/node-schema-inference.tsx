import { ComponentType, PropsWithChildren } from "react";
import { Flatten, MakeUndefinedOptional } from "../type-helpers/index.js";
import * as t from "../type-system/index.js";
import {
  NodeSchema,
  NodeSchemaInputs,
  NodeSchemaOutputs,
  NodeSchemaSlots,
} from "./node-schema.js";

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
    ? RegularInputTypes<I> &
        CollectionInputTypes<S> &
        (keyof S extends never
          ? {}
          : {
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
    ? (S[slotName]["inputs"] extends {} ? { readonly index: number } : {}) &
        (S[slotName]["outputs"] extends {}
          ? RegularOutputTypes<S[slotName]["outputs"]>
          : {})
    : never
  : never;

export type OutputTypes<nodeSchema extends NodeSchema> =
  nodeSchema extends NodeSchema<any, infer O, infer S>
    ? RegularOutputTypes<O> & ScopedOutputTypes<S>
    : never;

type RegularInputTypes<I extends NodeSchemaInputs> = MakeUndefinedOptional<{
  readonly [inputName in keyof I]: t.Unwrap<I[inputName]["type"]>;
}>;

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
type CollectionInputTypes<S extends NodeSchemaSlots> = Flatten<{
  readonly [slotName in keyof S]: S[slotName]["inputs"] extends {}
    ? {
        readonly [inputName in keyof S[slotName]["inputs"]]: readonly t.Unwrap<
          S[slotName]["inputs"][inputName]["type"]
        >[];
      }
    : {};
}>;

type RegularOutputTypes<O extends NodeSchemaOutputs> = MakeUndefinedOptional<{
  readonly [outputName in keyof O]: t.Unwrap<O[outputName]["type"]>;
}>;

type ScopedOutputTypes<S extends NodeSchemaSlots> = Flatten<{
  readonly [slotName in keyof S]: S[slotName]["outputs"] extends {}
    ? {
        readonly [outputName in keyof S[slotName]["outputs"]]: t.Unwrap<
          S[slotName]["outputs"][outputName]["type"]
        >;
      }
    : {};
}>;
