import { ObjectMap } from "@pschiffmann/std/object-map";
import * as t from "../type-system/index.js";

export type DebugValueSchemas = ObjectMap<DebugValueSchema>;

export interface DebugValueSchema<T extends t.Type = t.Type> {
  readonly type: T;
  readonly doc?: string;
}
