import { MakeUndefinedOptional } from "../type-helpers/index.js";
import { KragleType } from "./kragle-type.js";

export type Unwrap<T extends KragleType> = T["_output"];

export type KragleTypeArray = readonly KragleType[];
export type UnwrapArray<T extends KragleTypeArray> = {
  readonly [k in keyof T]: Unwrap<T[k]>;
};

export type KragleTypeRecord = Readonly<Record<string, KragleType>>;
export type UnwrapRecord<T extends KragleTypeRecord | undefined> =
  T extends KragleTypeRecord
    ? MakeUndefinedOptional<{ readonly [k in keyof T]: Unwrap<T[k]> }>
    : {};
