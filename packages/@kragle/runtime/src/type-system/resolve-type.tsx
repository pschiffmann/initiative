import * as t from "./index.js";
import { KragleType } from "./kragle-type.js";

export function resolveType(value: any): KragleType {
  switch (typeof value) {
    case "string":
      return t.string(value);
    case "number":
      return t.number(value);
    case "boolean":
      return t.boolean(value);
    case "undefined":
      return t.undefined();
  }
  if (value === null) return t.null();
  throw new Error(`Can't resolve type of value ${value}.`);
}
