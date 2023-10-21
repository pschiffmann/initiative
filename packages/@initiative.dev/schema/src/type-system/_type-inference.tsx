import { MakeUndefinedOptional } from "../type-helpers/index.js";
import { Type } from "./type.js";

export type Unwrap<T extends Type> = T["_output"];

export type TypeArray = readonly Type[];
export type UnwrapArray<T extends TypeArray> = {
  readonly [k in keyof T]: Unwrap<T[k]>;
};

export type TypeRecord = Readonly<Record<string, Type>>;
export type UnwrapRecord<T extends TypeRecord | undefined> =
  T extends TypeRecord
    ? MakeUndefinedOptional<{ readonly [k in keyof T]: Unwrap<T[k]> }>
    : {};
