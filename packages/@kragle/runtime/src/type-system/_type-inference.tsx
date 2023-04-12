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

/**
 * Returns the keys of `T` that don't accept `undefined` as a value.
 */
type RequiredKeys<T extends {}> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];

/**
 * Turns `{ p: undefined }` into `{ p?: undefined; }`.
 */
type MakeUndefinedOptional<T extends {}> = Pick<T, RequiredKeys<T>> &
  Partial<T>;
